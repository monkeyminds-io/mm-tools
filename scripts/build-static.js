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
 * Build individual solution as browser-ready static file
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
  
  // Create browser-compatible bundle
  const browserBundle = await createBrowserBundle(solutionCode, domain, solution, version);
  
  // Write the main file
  const mainFile = path.join(outputDir, `${solution}.js`);
  await fs.writeFile(mainFile, browserBundle);
  
  // Create minified version
  const minifiedJs = await minifyCode(browserBundle);
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
 * Create browser-compatible bundle
 */
async function createBrowserBundle(solutionCode, domain, solution, version) {
  // Remove TypeScript imports and replace with inlined code
  let processedCode = await inlineUtilities(solutionCode);
  
  // Remove TypeScript type annotations
  processedCode = removeTypeAnnotations(processedCode);
  
  // Wrap in IIFE for browser compatibility
  const header = createFileHeader(domain, solution, version);
  
  const browserBundle = `${header}
(function() {
    'use strict';
    
    ${processedCode}
    
})();`;
  
  return browserBundle;
}

/**
 * Inline utilities and remove imports
 */
async function inlineUtilities(code) {
  let processedCode = code;
  
  // Find and replace import statements
  const importRegex = /import\s*{([^}]+)}\s*from\s*['"](\.\.\/\.\.\/\.\.\/shared\/utils|\.\.\/\.\.\/\.\.\/shared\/utils\/index)['"];?\s*/g;
  
  let match;
  while ((match = importRegex.exec(code)) !== null) {
    const importedFunctions = match[1].split(',').map(f => f.trim());
    
    // Read and process utilities
    const utilsContent = await fs.readFile('./src/shared/utils/index.ts', 'utf8');
    let inlinedCode = '';
    
    for (const funcName of importedFunctions) {
      const funcCode = extractFunction(utilsContent, funcName);
      if (funcCode) {
        // Remove TypeScript annotations and export
        const cleanFunc = removeTypeAnnotations(funcCode).replace('export const', 'const');
        inlinedCode += cleanFunc + '\n\n';
      }
    }
    
    // Replace import with inlined utilities
    processedCode = processedCode.replace(match[0], inlinedCode);
  }
  
  return processedCode;
}

/**
 * Extract function from utilities file
 */
function extractFunction(utilsContent, funcName) {
  // Match function with proper bracket counting
  const funcStart = utilsContent.indexOf(`export const ${funcName}`);
  if (funcStart === -1) return null;
  
  let bracketCount = 0;
  let inFunction = false;
  let funcEnd = funcStart;
  
  for (let i = funcStart; i < utilsContent.length; i++) {
    const char = utilsContent[i];
    
    if (char === '=' && !inFunction) {
      inFunction = true;
    }
    
    if (inFunction) {
      if (char === '{') bracketCount++;
      if (char === '}') bracketCount--;
      
      if (bracketCount === 0 && char === '}') {
        funcEnd = i + 1;
        break;
      }
    }
  }
  
  return utilsContent.slice(funcStart, funcEnd);
}

/**
 * Remove TypeScript type annotations
 */
function removeTypeAnnotations(code) {
  return code
    // Remove type annotations from parameters: (param: Type) => (param)
    .replace(/\(\s*([^:)]+):\s*[^),]+/g, '($1')
    .replace(/,\s*([^:,)]+):\s*[^),]+/g, ', $1')
    
    // Remove function return types: ): Type => ):
    .replace(/\):\s*[^=>{]+\s*=>/g, ') =>')
    .replace(/\):\s*[^=>{]+\s*\{/g, ') {')
    
    // Remove variable type annotations: const x: Type = => const x =
    .replace(/:\s*[^=]+(\s*=)/g, '$1')
    
    // Remove interface declarations
    .replace(/interface\s+\w+\s*{[^}]*}/g, '')
    
    // Remove type declarations
    .replace(/type\s+\w+\s*=[^;]+;/g, '')
    
    // Remove as Type assertions
    .replace(/\s+as\s+\w+/g, '')
    
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n');
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