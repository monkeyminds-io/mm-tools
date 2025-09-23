const fs = require('fs').promises;
const path = require('path');

async function debugStructure() {
  console.log('🔍 Debugging file structure...');
  
  try {
    // Check if src/solutions exists
    const solutionsPath = './src/solutions';
    console.log('📂 Checking:', solutionsPath);
    
    const entries = await fs.readdir(solutionsPath, { withFileTypes: true });
    console.log('Found entries:', entries.map(e => `${e.name} (${e.isDirectory() ? 'dir' : 'file'})`));
    
    // Go deeper
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const domainPath = path.join(solutionsPath, entry.name);
        console.log(`\n📁 Checking domain: ${entry.name}`);
        
        const domainEntries = await fs.readdir(domainPath, { withFileTypes: true });
        console.log('  Solutions:', domainEntries.map(e => `${e.name} (${e.isDirectory() ? 'dir' : 'file'})`));
        
        for (const solutionEntry of domainEntries) {
          if (solutionEntry.isDirectory()) {
            const solutionPath = path.join(domainPath, solutionEntry.name);
            console.log(`\n  🎯 Checking solution: ${solutionEntry.name}`);
            
            const solutionEntries = await fs.readdir(solutionPath, { withFileTypes: true });
            console.log('    Versions:', solutionEntries.map(e => `${e.name} (${e.isDirectory() ? 'dir' : 'file'})`));
            
            for (const versionEntry of solutionEntries) {
              if (versionEntry.isDirectory()) {
                const versionPath = path.join(solutionPath, versionEntry.name);
                console.log(`\n    📦 Checking version: ${versionEntry.name}`);
                
                const versionEntries = await fs.readdir(versionPath, { withFileTypes: true });
                console.log('      Files:', versionEntries.map(e => `${e.name} (${e.isDirectory() ? 'dir' : 'file'})`));
              }
            }
          }
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugStructure();