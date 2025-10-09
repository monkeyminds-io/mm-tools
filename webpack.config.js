const path = require('path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

// Dynamically find all solutions (supports both old and new structures)
function findSolutions() {
  const solutions = {};
  const solutionsDir = path.resolve(__dirname, 'src/solutions');
  
  const solutionDirs = fs.readdirSync(solutionsDir, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory());
    
  solutionDirs.forEach(solution => {
    const solutionPath = path.join(solutionsDir, solution.name);
    const entries = fs.readdirSync(solutionPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    
    entries.forEach(entry => {
      // Check if this is a version directory (new structure: slider/v1-2/)
      if (entry.name.startsWith('v')) {
        const entryFile = path.join(solutionPath, entry.name, 'index.ts');
        if (fs.existsSync(entryFile)) {
          // Output: v1-2/slider/index.js
          const key = `${entry.name}/${solution.name}/index`;
          solutions[key] = entryFile;
        }
      } else {
        // Old structure: slider/infinite/v1-1/
        const subSolutionPath = path.join(solutionPath, entry.name);
        const versionDirs = fs.readdirSync(subSolutionPath, { withFileTypes: true })
          .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'));
          
        versionDirs.forEach(version => {
          const entryFile = path.join(subSolutionPath, version.name, 'index.ts');
          if (fs.existsSync(entryFile)) {
            // Output: v1-1/slider/infinite.js
            const key = `${version.name}/${solution.name}/${entry.name}`;
            solutions[key] = entryFile;
          }
        });
      }
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
      minimize: isMinified === true,
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
      
      // Copy examples to dist/examples
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CopyExamples', async (compilation) => {
            const outputPath = compiler.options.output.path;
            const examplesOutputPath = path.join(outputPath, 'examples');
            
            // Copy examples for each solution (supports both old and new structures)
            const solutionsDir = path.resolve(__dirname, 'src/solutions');
            
            const solutions = fs.readdirSync(solutionsDir, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory());
              
            for (const solution of solutions) {
              const solutionPath = path.join(solutionsDir, solution.name);
              const entries = fs.readdirSync(solutionPath, { withFileTypes: true })
                .filter(dirent => dirent.isDirectory());
              
              for (const entry of entries) {
                // Check if this is a version directory (new structure)
                if (entry.name.startsWith('v')) {
                  const exampleSource = path.join(solutionPath, entry.name, 'examples');
                  const exampleTarget = path.join(examplesOutputPath, entry.name, solution.name);
                  
                  if (fs.existsSync(exampleSource)) {
                    if (!fs.existsSync(exampleTarget)) {
                      fs.mkdirSync(exampleTarget, { recursive: true });
                    }
                    
                    const exampleFiles = fs.readdirSync(exampleSource);
                    exampleFiles.forEach(file => {
                      let content = fs.readFileSync(path.join(exampleSource, file), 'utf8');
                      
                      if (file.endsWith('.html')) {
                        content = content.replace(
                          /src=".*\/index\.js"/g,
                          `src="../../../${entry.name}/${solution.name}/index.js"`
                        ).replace(
                          'href="../../../../styles/monkeyminds.css"',
                          `href="../../../styles/monkeyminds.css"`
                        );
                      }
                      
                      fs.writeFileSync(path.join(exampleTarget, file), content);
                    });
                    
                    console.log(`📄 Copied examples for ${solution.name}/${entry.name}`);
                  }
                } else {
                  // Old structure: slider/infinite/v1-1/
                  const subSolutionPath = path.join(solutionPath, entry.name);
                  const versions = fs.readdirSync(subSolutionPath, { withFileTypes: true })
                    .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'));
                    
                  for (const version of versions) {
                    const exampleSource = path.join(subSolutionPath, version.name, 'examples');
                    const exampleTarget = path.join(examplesOutputPath, version.name, solution.name, entry.name);
                    
                    if (fs.existsSync(exampleSource)) {
                      if (!fs.existsSync(exampleTarget)) {
                        fs.mkdirSync(exampleTarget, { recursive: true });
                      }
                      
                      const exampleFiles = fs.readdirSync(exampleSource);
                      exampleFiles.forEach(file => {
                        let content = fs.readFileSync(path.join(exampleSource, file), 'utf8');
                        
                        if (file.endsWith('.html')) {
                          content = content.replace(
                            'src="../infinite.js"',
                            `src="../../../${version.name}/${solution.name}/${entry.name}.js"`
                          ).replace(
                            'href="../../../../styles/monkeyminds.css"',
                            `href="../../../../styles/monkeyminds.css"`
                          );
                        }
                        
                        fs.writeFileSync(path.join(exampleTarget, file), content);
                      });
                      
                      console.log(`📄 Copied examples for ${solution.name}/${entry.name}/${version.name}`);
                    }
                  }
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
                  const copyLatestExamples = (src, dest) => {
                    const entries = fs.readdirSync(src, { withFileTypes: true });
                    entries.forEach(entry => {
                      const srcPath = path.join(src, entry.name);
                      const destPath = path.join(dest, entry.name);
                      if (entry.isDirectory()) {
                        fs.mkdirSync(destPath, { recursive: true });
                        copyLatestExamples(srcPath, destPath);
                      } else {
                        let content = fs.readFileSync(srcPath, 'utf8');
                        if (entry.name.endsWith('.html')) {
                          content = content.replace(/v1-0\//g, 'latest/');
                        }
                        fs.writeFileSync(destPath, content);
                      }
                    });
                  };
                  copyLatestExamples(exampleSource, exampleTarget);
                }
              }
            });
          });
        }
      }
    ],
    
    devtool: false
  };
};