const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Simple static build configuration
const CONFIG = {
  srcDir: './src/solutions',
  distDir: './dist',
  tempDir: './temp-build'
};

/**
 * Build all solutions as static files
 */
async function buildStaticFiles() {
  console.log('📦 Building MonkeyMinds Static Files...');
  
  // Clean and setup
  await cleanAndSetup();
  
  // Build each solution as a static file
  await buildSolution('list', 'load-more', 'v1-0');
  
  // Create latest aliases
  await createLatestAliases();
  
  // Clean up
  await cleanup();
  
  console.log('✅ Static build complete!');
  console.log('📁 Files available at:');
  console.log('   dist/v1-0/list/load-more.js');
  console.log('   dist/v1-0/list/load-more.min.js');
  console.log('   dist/latest/list/load-more.js');
}

/**
 * Build individual solution as static file
 */
async function buildSolution(domain, solution, version) {
  console.log(`🔨 Building ${domain}/${solution} (${version})...`);
  
  const sourceDir = path.join(CONFIG.srcDir, domain, solution, version);
  const outputDir = path.join(CONFIG.distDir, version, domain);
  
  // Create output directory
  await fs.mkdir(outputDir, { recursive: true });
  
  // Read the solution TypeScript file
  const sourceFile = path.join(sourceDir, 'index.ts');
  let solutionCode = await fs.readFile(sourceFile, 'utf8');
  
  // Inline shared utilities (simple approach)
  solutionCode = await inlineSharedUtilities(solutionCode);
  
  // Create temporary bundled file
  const tempFile = path.join(CONFIG.tempDir, `${domain}-${solution}-${version}.ts`);
  await fs.writeFile(tempFile, solutionCode);
  
  // Compile TypeScript to JavaScript
  const jsOutput = path.join(CONFIG.tempDir, `${domain}-${solution}-${version}.js`);
  execSync(`npx tsc ${tempFile} --outFile ${jsOutput} --target ES2020 --module none --lib ES2020,DOM --esModuleInterop`, 
    { stdio: 'pipe' });
  
  // Read compiled JavaScript
  let compiledJs = await fs.readFile(jsOutput, 'utf8');
  
  // Add MonkeyMinds branding header
  const header = createFileHeader(domain, solution, version);
  compiledJs = header + '\n' + compiledJs;
  
  // Write the main file
  const mainFile = path.join(outputDir, `${solution}.js`);
  await fs.writeFile(mainFile, compiledJs);
  
  // Create minified version
  const minifiedJs = await minifyCode(compiledJs);
  const minFile = path.join(outputDir, `${solution}.min.js`);
  await fs.writeFile(minFile, minifiedJs);
  
  // Copy documentation files to a docs folder
  const docsDir = path.join(outputDir, 'docs');
  await fs.mkdir(docsDir, { recursive: true });
  
  try {
    await fs.copyFile(
      path.join(sourceDir, 'manifest.json'), 
      path.join(docsDir, `${solution}.json`)
    );
    await fs.copyFile(
      path.join(sourceDir, 'README.md'), 
      path.join(docsDir, `${solution}.md`)
    );
  } catch (error) {
    console.log(`⚠️  Could not copy docs for ${solution}`);
  }
  
  console.log(`✅ Built ${domain}/${solution}.js and ${solution}.min.js`);
}

/**
 * Inline shared utilities into solution code
 */
async function inlineSharedUtilities(solutionCode) {
  // Find import statements for shared utilities
  const importRegex = /import\s*{([^}]+)}\s*from\s*['"](\.\.\/\.\.\/\.\.\/shared\/utils|\.\.\/\.\.\/\.\.\/shared\/utils\/index)['"];?/g;
  
  let processedCode = solutionCode;
  let match;
  
  while ((match = importRegex.exec(solutionCode)) !== null) {
    const importedFunctions = match[1].split(',').map(f => f.trim());
    
    // Read shared utilities
    const utilsContent = await fs.readFile('./src/shared/utils/index.ts', 'utf8');
    
    // Extract needed functions
    let inlinedCode = '// === Inlined MonkeyMinds Utilities ===\n';
    
    for (const funcName of importedFunctions) {
      // Find the function definition
      const funcRegex = new RegExp(
        `export\\s+const\\s+${funcName}\\s*=\\s*\\([^)]*\\)\\s*:\\s*[^=]*=>\\s*{[^}]*(?:{[^}]*}[^}]*)*}`, 'g'
      );
      const funcMatch = utilsContent.match(funcRegex);
      
      if (funcMatch) {
        // Remove 'export' and add to inlined code
        const inlinedFunc = funcMatch[0].replace('export const', 'const');
        inlinedCode += inlinedFunc + '\n\n';
      }
    }
    
    // Replace import with inlined code
    processedCode = processedCode.replace(match[0], inlinedCode);
  }
  
  return processedCode;
}

/**
 * Create branded file header
 */
function createFileHeader(domain, solution, version) {
  return `/**
 * MonkeyMinds ${solution.charAt(0).toUpperCase() + solution.slice(1)} Solution ${version}
 * 
 * Usage: <script src="https://tools.monkeyminds.io/${version}/${domain}/${solution}.js"></script>
 * 
 * Docs: https://tools.monkeyminds.io/${version}/${domain}/docs/${solution}.md
 * 
 * Built: ${new Date().toISOString()}
 * © MonkeyMinds - https://monkeyminds.io
 */`;
}

/**
 * Simple code minification
 */
async function minifyCode(code) {
  // Simple minification: remove comments and extra whitespace
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // Remove /* */ comments
    .replace(/\/\/.*$/gm, '') // Remove // comments
    .replace(/^\s+/gm, '') // Remove leading whitespace
    .replace(/\s+$/gm, '') // Remove trailing whitespace
    .replace(/\n\s*\n/g, '\n') // Remove empty lines
    .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Create latest version aliases
 */
async function createLatestAliases() {
  console.log('🔗 Creating latest version aliases...');
  
  const latestDir = path.join(CONFIG.distDir, 'latest');
  await fs.mkdir(latestDir, { recursive: true });
  
  // Copy v1-0 files to latest (since it's our only version for now)
  const sourceDir = path.join(CONFIG.distDir, 'v1-0');
  const targetDir = path.join(latestDir);
  
  await copyDirectory(sourceDir, targetDir);
  
  console.log('✅ Created /latest/ aliases');
}

/**
 * Copy directory recursively
 */
async function copyDirectory(source, target) {
  await fs.mkdir(target, { recursive: true });
  const entries = await fs.readdir(source, { withFileTypes: true });
  
  for (const entry of entries) {
    const sourcePath = path.join(source, entry.name);
    const targetPath = path.join(target, entry.name);
    
    if (entry.isDirectory()) {
      await copyDirectory(sourcePath, targetPath);
    } else {
      await fs.copyFile(sourcePath, targetPath);
    }
  }
}

/**
 * Clean and setup directories
 */
async function cleanAndSetup() {
  // Clean temp directory
  try {
    await fs.rm(CONFIG.tempDir, { recursive: true, force: true });
  } catch {}
  await fs.mkdir(CONFIG.tempDir, { recursive: true });
  
  // Clean dist directory
  try {
    await fs.rm(CONFIG.distDir, { recursive: true, force: true });
  } catch {}
  await fs.mkdir(CONFIG.distDir, { recursive: true });
}

/**
 * Cleanup temporary files
 */
async function cleanup() {
  try {
    await fs.rm(CONFIG.tempDir, { recursive: true, force: true });
  } catch {}
}

// Run if called directly
if (require.main === module) {
  buildStaticFiles().catch(console.error);
}

module.exports = { buildStaticFiles };