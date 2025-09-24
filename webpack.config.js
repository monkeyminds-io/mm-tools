const path = require('path');
const fs = require('fs');
const TerserPlugin = require('terser-webpack-plugin');

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
  const isProduction = argv.mode === 'production';
  
  return {
    mode: argv.mode || 'production',
    
    entry: findSolutions(),
    
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: '[name].js',
      clean: true,
      // Remove UMD wrapper - just output plain JavaScript
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
      minimize: false, // We'll create separate builds for minified versions
      splitChunks: false // Keep everything in one file per solution
    },
    
    target: 'web',
    
    plugins: [
      // Custom plugin to create minified versions and latest aliases
      {
        apply: (compiler) => {
          compiler.hooks.afterEmit.tap('CreateMinifiedAndLatest', (compilation) => {
            const outputPath = compiler.options.output.path;
            
            // Create latest aliases
            Object.keys(compilation.assets).forEach(filename => {
              if (filename.endsWith('.js')) {
                const fullPath = path.join(outputPath, filename);
                
                // Create latest alias (copy v1-0 to latest for now)
                if (filename.startsWith('v1-0/')) {
                  const latestFilename = filename.replace('v1-0/', 'latest/');
                  const latestDir = path.dirname(path.join(outputPath, latestFilename));
                  
                  if (!fs.existsSync(latestDir)) {
                    fs.mkdirSync(latestDir, { recursive: true });
                  }
                  
                  fs.copyFileSync(fullPath, path.join(outputPath, latestFilename));
                }
              }
            });
          });
        }
      }
    ],
    
    devtool: false // No source maps for production
  };
};

// Separate Webpack config for minified versions
module.exports.minified = {
  mode: 'production',
  
  entry: findSolutions(),
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].min.js',
    // Remove UMD wrapper for minified version too
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
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: false, // Keep console.log for debugging
            drop_debugger: true,
          },
          format: {
            comments: false,
          },
        },
        extractComments: false,
      }),
    ],
    splitChunks: false
  },
  
  target: 'web',
  
  plugins: [
    // Create latest aliases for minified files too
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CreateMinifiedLatest', (compilation) => {
          const outputPath = compiler.options.output.path;
          
          Object.keys(compilation.assets).forEach(filename => {
            if (filename.endsWith('.min.js') && filename.startsWith('v1-0/')) {
              const latestFilename = filename.replace('v1-0/', 'latest/');
              const latestDir = path.dirname(path.join(outputPath, latestFilename));
              
              if (!fs.existsSync(latestDir)) {
                fs.mkdirSync(latestDir, { recursive: true });
              }
              
              const fullPath = path.join(outputPath, filename);
              fs.copyFileSync(fullPath, path.join(outputPath, latestFilename));
            }
          });
        });
      }
    }
  ],
  
  devtool: false
};