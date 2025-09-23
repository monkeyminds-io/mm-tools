const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

// Build configuration
const CONFIG = {
  srcDir: './src/solutions',
  distDir: './public',
  sharedDir: './src/shared',
  tempDir: './temp-build'
};

/**
 * Build individual solution by bundling with shared utilities
 */
async function buildSolution(versionPath, domain, solution, version) {
  const solutionPath = path.join(versionPath, solution);
  const indexFile = path.join(solutionPath, 'index.ts');
  
  // Check if solution has TypeScript file
  try {
    await fs.access(indexFile);
  } catch {
    console.log(`⏭️  Skipping ${version}/${domain}/${solution} - no index.ts found`);
    return;
  }

  console.log(`🔨 Building ${version}/${domain}/${solution}...`);

  // Create temporary bundle file that includes shared utilities
  const tempBundlePath = path.join(CONFIG.tempDir, `${domain}-${solution}-${version}.ts`);
  await createBundle(indexFile, tempBundlePath);

  // Compile TypeScript to JavaScript
  const outputDir = path.join(CONFIG.distDir, version, domain, solution);
  await fs.mkdir(outputDir, { recursive: true });

  try {
    // Compile with TypeScript using build config
    const outputFile = path.join(outputDir, 'index.js');
    execSync(`npx tsc ${tempBundlePath} --project tsconfig.build.json --outDir ${outputDir}`, 
      { stdio: 'pipe' });

    // Move compiled file to correct location
    const compiledFile = path.join(path.dirname(outputFile), path.basename(tempBundlePath).replace('.ts', '.js'));
    if (await fileExists(compiledFile)) {
      await fs.rename(compiledFile, outputFile);
    }

    // Copy manifest and README if they exist
    await copyIfExists(path.join(solutionPath, 'manifest.json'), path.join(outputDir, 'manifest.json'));
    await copyIfExists(path.join(solutionPath, 'README.md'), path.join(outputDir, 'README.md'));
    
    // Copy examples folder if it exists
    const examplesSource = path.join(solutionPath, 'examples');
    const examplesTarget = path.join(outputDir, 'examples');
    if (await directoryExists(examplesSource)) {
      await copyDirectory(examplesSource, examplesTarget);
    }

    console.log(`✅ Built ${version}/${domain}/${solution}`);
    
  } catch (error) {
    console.error(`❌ Failed to build ${version}/${domain}/${solution}:`, error.message);
  }
}

/**
 * Create a bundled TypeScript file with shared utilities inlined
 */
async function createBundle(solutionFile, outputFile) {
  const solutionContent = await fs.readFile(solutionFile, 'utf8');
  
  // Simple bundling: replace import statements with actual code
  let bundledContent = solutionContent;
  
  // Find import statements for shared utilities
  const importRegex = /import\s+{([^}]+)}\s+from\s+['"](\.\.\/\.\.\/\.\.\/shared\/utils|\.\.\/\.\.\/\.\.\/shared\/utils\/index)['"]/g;
  let match;
  
  while ((match = importRegex.exec(solutionContent)) !== null) {
    const importedFunctions = match[1].split(',').map(f => f.trim());
    
    // Read shared utilities
    const utilsContent = await fs.readFile('./src/shared/utils/index.ts', 'utf8');
    
    // Extract only the needed functions
    let extractedUtils = '';
    for (const funcName of importedFunctions) {
      const funcRegex = new RegExp(`export const ${funcName}[^;]+;`, 'g');
      const funcMatch = utilsContent.match(funcRegex);
      if (funcMatch) {
        extractedUtils += funcMatch[0].replace('export const', 'const') + '\n\n';
      }
    }
    
    // Replace import with actual code
    bundledContent = bundledContent.replace(match[0], extractedUtils);
  }
  
  await fs.mkdir(path.dirname(outputFile), { recursive: true });
  await fs.writeFile(outputFile, bundledContent);
}

/**
 * Copy file if it exists
 */
async function copyIfExists(source, target) {
  try {
    await fs.access(source);
    await fs.copyFile(source, target);
  } catch {
    // File doesn't exist, skip
  }
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
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if directory exists
 */
async function directoryExists(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Main build function
 */
async function buildAllSolutions() {
  console.log('🏗️  Building MonkeyMinds Solutions...');
  
  // Clean and create temp directory
  try {
    await fs.rm(CONFIG.tempDir, { recursive: true, force: true });
    await fs.rm(CONFIG.distDir, { recursive: true, force: true });
  } catch {
    // Directories might not exist
  }
  
  await fs.mkdir(CONFIG.tempDir, { recursive: true });
  await fs.mkdir(CONFIG.distDir, { recursive: true });

  try {
    // Get all versions
    const versions = await fs.readdir(CONFIG.srcDir, { withFileTypes: true });
    
    for (const versionEntry of versions) {
      if (!versionEntry.isDirectory() || !versionEntry.name.startsWith('v')) continue;
      
      const version = versionEntry.name;
      const versionPath = path.join(CONFIG.srcDir, version);
      
      // Get all domains in this version
      const domains = await fs.readdir(versionPath, { withFileTypes: true });
      
      for (const domainEntry of domains) {
        if (!domainEntry.isDirectory()) continue;
        
        const domain = domainEntry.name;
        const domainPath = path.join(versionPath, domain);
        
        // Get all solutions in this domain
        const solutions = await fs.readdir(domainPath, { withFileTypes: true });
        
        for (const solutionEntry of solutions) {
          if (!solutionEntry.isDirectory()) continue;
          
          const solution = solutionEntry.name;
          await buildSolution(domainPath, domain, solution, version);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
  
  // Clean up temp directory
  await fs.rm(CONFIG.tempDir, { recursive: true, force: true });
  
  console.log('🎉 All solutions built successfully!');
}

// Run if called directly
if (require.main === module) {
  buildAllSolutions().catch(console.error);
}

module.exports = { buildAllSolutions };