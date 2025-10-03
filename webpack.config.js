const path = require('path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Dynamically find all solutions
function findSolutions() {
  const solutions = {};
  const solutionsDir = path.resolve(__dirname, 'src/solutions');
  
  // Walk through domain/solution/version structure
  const domains = fs.readdirSync(solutionsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());
    
  domains.forEach(domain => {
    const domainPath = path.join(solutionsDir, domain.name);
    const solutionDirs = fs.readdirSync(domainPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
      
    solutionDirs.forEach(solution => {
      const solutionPath = path.join(domainPath, solution.name);
      const versionDirs = fs.readdirSync(solutionPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'));
        
      versionDirs.forEach(version => {
        const entryFile = path.join(solutionPath, version.name, 'index.ts');
        if (fs.existsSync(entryFile)) {
          const key = `${version.name}/${domain.name}/${solution.name}`;
          solutions[key] = entryFile;
        }
      });
    });
  });
  
  return solutions;
}

module.exports = (env, argv) => {
  const isMinified = env && env.minified === 'true';
  const filename = isMinified ? '[name].min.js' : '[name].js';
  
  return {
    mode: 'production',
    
    entry: findSolutions(),
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: filename,
      clean: !isMinified, // Only clean on first build
      globalObject: 'this'
    },
    
    resolve: {
      extensions: ['.ts', '.js'],
      alias: {
        '@shared': path.resolve(__dirname, 'src/shared')
      }
    },
    
    module: {
      rules: [
        {
          test: /\.ts$/,
          use: 'ts-loader',
          exclude: /node_modules/
        }
      ]
    },
    
    optimization: {
      minimize: isMinified === true, // Ensure boolean
      minimizer: isMinified ? [
        new TerserPlugin({
          terserOptions: {
            compress: {
              drop_console: false,
              drop_debugger: true,
            },
            format: {
              comments: false,
            },
          },
          extractComments: false,
        })
      ] : undefined,
      splitChunks: false
    },
    
    target: 'web',
    
    plugins: [
      // Copy examples to dist/examples
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CopyExamples', async (compilation) => {
            const outputPath = compiler.options.output.path;
            const examplesOutputPath = path.join(outputPath, 'examples');
            
            // Copy examples for each solution
            const solutionsDir = path.resolve(__dirname, 'src/solutions');
            const copyExample = async (domain, solution, version) => {
              const exampleSource = path.join(solutionsDir, domain, solution, version, 'examples');
              const exampleTarget = path.join(examplesOutputPath, version, domain, solution);
              
              if (fs.existsSync(exampleSource)) {
                if (!fs.existsSync(exampleTarget)) {
                  fs.mkdirSync(exampleTarget, { recursive: true });
                }
                
                // Copy all example files
                const exampleFiles = fs.readdirSync(exampleSource);
                exampleFiles.forEach(file => {
                  let content = fs.readFileSync(path.join(exampleSource, file), 'utf8');
                  
                  // Update script src path and CSS path in HTML files
                  if (file.endsWith('.html')) {
                    content = content.replace(
                      'src="../infinite.js"',
                      `src="../../${version}/${domain}/${solution}.js"`
                    ).replace(
                      'href="../../../styles/monkeyminds.css"',
                      `href="../../../styles/monkeyminds.css"`
                    );
                  }
                  
                  fs.writeFileSync(path.join(exampleTarget, file), content);
                });
                
                console.log(`📄 Copied examples for ${domain}/${solution}/${version}`);
              }
            };
            
            // Find all solutions and copy their examples
            const domains = fs.readdirSync(solutionsDir, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory());
              
            for (const domain of domains) {
              const domainPath = path.join(solutionsDir, domain.name);
              const solutions = fs.readdirSync(domainPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory());
                
              for (const solution of solutions) {
                const solutionPath = path.join(domainPath, solution.name);
                const versions = fs.readdirSync(solutionPath, { withFileTypes: true })
                  .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'));
                  
                for (const version of versions) {
                  await copyExample(domain.name, solution.name, version.name);
                }
              }
            }
          });
        }
      },
      
      // Create latest aliases
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CreateLatest', (compilation) => {
            const outputPath = compiler.options.output.path;
            
            Object.keys(compilation.assets).forEach(filename => {
              if (filename.endsWith('.js') && filename.startsWith('v1-0/')) {
                const latestFilename = filename.replace('v1-0/', 'latest/');
                const latestDir = path.dirname(path.join(outputPath, latestFilename));
                
                if (!fs.existsSync(latestDir)) {
                  fs.mkdirSync(latestDir, { recursive: true });
                }
                
                const fullPath = path.join(outputPath, filename);
                fs.copyFileSync(fullPath, path.join(outputPath, latestFilename));
                
                // Also copy examples to latest
                const exampleSource = path.join(outputPath, 'examples', 'v1-0');
                const exampleTarget = path.join(outputPath, 'examples', 'latest');
                
                if (fs.existsSync(exampleSource) && !fs.existsSync(exampleTarget)) {
                  fs.mkdirSync(exampleTarget, { recursive: true });
                  const copyDirRecursive = (src, dest) => {
                    const entries = fs.readdirSync(src, { withFileTypes: true });
                    entries.forEach(entry => {
                      const srcPath = path.join(src, entry.name);
                      const destPath = path.join(dest, entry.name);
                      if (entry.isDirectory()) {
                        fs.mkdirSync(destPath, { recursive: true });
                        copyDirRecursive(srcPath, destPath);
                      } else {
                        let content = fs.readFileSync(srcPath, 'utf8');
                        if (entry.name.endsWith('.html')) {
                          content = content.replace(/v1-0\//g, 'latest/');
                        }
                        fs.writeFileSync(destPath, content);
                      }
                    });
                  };
                  copyDirRecursive(exampleSource, exampleTarget);
                }
              }
            });
          });
        }
      },
      // Copy assets using copy-webpack-plugin
      new CopyWebpackPlugin({
        patterns: [
          {
            from: 'src/assets',
            to: 'assets',
            noErrorOnMissing: true
          }
        ]
      }),
    ],
    
    devtool: false
  };
};