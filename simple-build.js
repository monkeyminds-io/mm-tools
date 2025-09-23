const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

async function simpleBuild() {
  console.log('🚀 Simple build starting...');
  
  // Clean dist directory (but preserve server files)
  const distSolutionsPath = './dist/v1-0/list/load-more';
  try {
    await fs.rm(distSolutionsPath, { recursive: true, force: true });
  } catch {}
  
  // Create output directory
  await fs.mkdir(distSolutionsPath, { recursive: true });
  console.log('📁 Created:', distSolutionsPath);
  
  // Copy your exact files
  const sourceDir = './src/solutions/list/load-more/v1-0';
  
  // 1. Copy index.ts and compile it
  const sourceTs = path.join(sourceDir, 'index.ts');
  const outputJs = path.join(distSolutionsPath, 'index.js');
  
  console.log('🔨 Compiling TypeScript...');
  console.log('📄 From:', sourceTs);
  console.log('📄 To:', outputJs);
  
  try {
    // Simple TypeScript compilation with verbose output
    console.log('🔄 Running TypeScript compiler...');
    const result = execSync(`npx tsc ${sourceTs} --outDir ${distSolutionsPath} --target ES2020 --module CommonJS --lib ES2020,DOM --esModuleInterop --skipLibCheck --listFiles`, 
      { stdio: 'pipe', encoding: 'utf8' });
    
    console.log('📋 TypeScript output:', result);
    
    // Check if the file was created in the nested structure
    const nestedJsFile = path.join(distSolutionsPath, 'solutions', 'list', 'load-more', 'v1-0', 'index.js');
    const targetJsFile = path.join(distSolutionsPath, 'index.js');
    
    if (await fileExists(nestedJsFile)) {
      console.log('✅ Found compiled file in nested structure');
      console.log('📁 Moving from:', nestedJsFile);
      console.log('📁 Moving to:', targetJsFile);
      
      // Move the file to the correct location
      await fs.rename(nestedJsFile, targetJsFile);
      
      // Clean up the nested directory structure
      try {
        await fs.rm(path.join(distSolutionsPath, 'solutions'), { recursive: true, force: true });
        await fs.rm(path.join(distSolutionsPath, 'shared'), { recursive: true, force: true });
        console.log('🧹 Cleaned up nested directories');
      } catch (error) {
        console.log('⚠️  Could not clean up nested directories:', error.message);
      }
      
      console.log('✅ TypeScript compiled and moved successfully');
    } else if (await fileExists(compiledFile)) {
      console.log('✅ TypeScript compiled successfully (direct location)');
    } else {
      console.log('❌ Could not find compiled file in any expected location');
      return;
    }
    
  } catch (error) {
    console.error('❌ TypeScript compilation error:');
    console.error('stderr:', error.stderr?.toString());
    console.error('stdout:', error.stdout?.toString());
    console.error('status:', error.status);
    return;
  }
  
  // 2. Copy manifest.json
  try {
    const sourceManifest = path.join(sourceDir, 'manifest.json');
    const targetManifest = path.join(distSolutionsPath, 'manifest.json');
    await fs.copyFile(sourceManifest, targetManifest);
    console.log('✅ Copied manifest.json');
  } catch (error) {
    console.log('⚠️  Could not copy manifest.json:', error.message);
  }
  
  // 3. Copy README.md
  try {
    const sourceReadme = path.join(sourceDir, 'README.md');
    const targetReadme = path.join(distSolutionsPath, 'README.md');
    await fs.copyFile(sourceReadme, targetReadme);
    console.log('✅ Copied README.md');
  } catch (error) {
    console.log('⚠️  Could not copy README.md:', error.message);
  }
  
  console.log('🎉 Simple build completed!');
  
  // List what we created
  console.log('📦 Created files:');
  try {
    const files = await fs.readdir(distSolutionsPath);
    files.forEach(file => console.log(`   ${file}`));
  } catch (error) {
    console.log('❌ Could not list output files');
  }
}

async function listDirectoryRecursive(dirPath) {
  const results = [];
  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        const subContents = await listDirectoryRecursive(fullPath);
        results.push(`${entry.name}/: [${subContents.join(', ')}]`);
      } else {
        results.push(entry.name);
      }
    }
  } catch (error) {
    results.push(`Error: ${error.message}`);
  }
  return results;
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

simpleBuild().catch(console.error);