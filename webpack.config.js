const path = require('path');
const fs = require('fs');

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

module.exports = {
  mode: 'production',
  
  entry: findSolutions(),
  
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].js',
    clean: true,
    library: {
      type: 'umd',
      name: 'MonkeyMinds'
    },
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
    minimize: false, // We'll create separate minified versions
    splitChunks: false // Keep everything in one file per solution
  },
  
  target: 'web',
  
  plugins: [
    // Custom plugin to create minified versions and latest aliases
    {
      apply: (compiler) => {
        compiler.hooks.afterEmit.tap('CreateMinifiedAndLatest', (compilation) => {
          const outputPath = compiler.options.output.path;
          
          // Create minified versions
          Object.keys(compilation.assets).forEach(filename => {
            if (filename.endsWith('.js')) {
              const fullPath = path.join(outputPath, filename);
              const content = fs.readFileSync(fullPath, 'utf8');
              
              // Simple minification
              const minified = content
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\/\/.*$/gm, '')
                .replace(/^\s+/gm, '')
                .replace(/\s+$/gm, '')
                .replace(/\n\s*\n/g, '\n')
                .replace(/\s{2,}/g, ' ')
                .trim();
              
              const minFilename = filename.replace('.js', '.min.js');
              fs.writeFileSync(path.join(outputPath, minFilename), minified);
              
              // Create latest alias (copy v1-0 to latest for now)
              if (filename.startsWith('v1-0/')) {
                const latestFilename = filename.replace('v1-0/', 'latest/');
                const latestDir = path.dirname(path.join(outputPath, latestFilename));
                
                if (!fs.existsSync(latestDir)) {
                  fs.mkdirSync(latestDir, { recursive: true });
                }
                
                fs.copyFileSync(fullPath, path.join(outputPath, latestFilename));
                fs.copyFileSync(
                  path.join(outputPath, minFilename), 
                  path.join(outputPath, latestFilename.replace('.js', '.min.js'))
                );
              }
            }
          });
        });
      }
    }
  ],
  
  devtool: false // No source maps for production
};