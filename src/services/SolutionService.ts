import fs from 'fs/promises';
import path from 'path';
import { config } from '../config/environment';

export interface SolutionManifest {
  name: string;
  version: string;
  description: string;
  domain: string;
  documentation?: {
    readme: string;
    changelog?: string;
    examples: string[];
  };
  files: {
    script: string;
    styles?: string;
    minified?: string;
  };
  dependencies?: string[];
  compatibility: string[];
  size: {
    js: string;
    css?: string;
  };
  changelog?: any[];
}

export interface DomainCatalog {
  domain: string;
  version: string;
  solutions: string[];
  count: number;
}

export interface VersionCatalog {
  version: string;
  domains: Record<string, string[]>;
  totalSolutions: number;
}

export class SolutionService {
  private readonly solutionsPath: string;

  constructor() {
    this.solutionsPath = path.join(process.cwd(), config.paths.dist);
  }

  /**
   * Get a specific file from a solution
   */
  async getSolutionFile(version: string, domain: string, solution: string, filename: string): Promise<string> {
    const filePath = path.join(this.solutionsPath, version, domain, solution, filename);
    
    try {
      await this.validatePath(filePath);
      const content = await fs.readFile(filePath, 'utf8');
      return content;
    } catch (error) {
      throw new Error(`File not found: ${version}/${domain}/${solution}/${filename}`);
    }
  }

  /**
   * Get solution manifest
   */
  async getSolutionManifest(version: string, domain: string, solution: string): Promise<SolutionManifest> {
    try {
      const manifestContent = await this.getSolutionFile(version, domain, solution, 'manifest.json');
      return JSON.parse(manifestContent);
    } catch (error) {
      throw new Error(`Manifest not found for: ${version}/${domain}/${solution}`);
    }
  }

  /**
   * Get all solutions in a domain
   */
  async getDomainSolutions(version: string, domain: string): Promise<string[]> {
    const domainPath = path.join(this.solutionsPath, version, domain);
    
    try {
      await this.validatePath(domainPath);
      const entries = await fs.readdir(domainPath, { withFileTypes: true });
      
      const solutions = entries
        .filter(entry => entry.isDirectory())
        .map(entry => entry.name)
        .sort();
      
      return solutions;
    } catch (error) {
      throw new Error(`Domain not found: ${version}/${domain}`);
    }
  }

  /**
   * Get catalog for a specific version
   */
  async getVersionCatalog(version: string): Promise<VersionCatalog> {
    const versionPath = path.join(this.solutionsPath, version);
    
    try {
      await this.validatePath(versionPath);
      const domains = await fs.readdir(versionPath, { withFileTypes: true });
      
      const catalog: VersionCatalog = {
        version,
        domains: {},
        totalSolutions: 0
      };

      for (const domain of domains) {
        if (domain.isDirectory()) {
          try {
            const solutions = await this.getDomainSolutions(version, domain.name);
            catalog.domains[domain.name] = solutions;
            catalog.totalSolutions += solutions.length;
          } catch (error) {
            // Skip invalid domains
            continue;
          }
        }
      }

      return catalog;
    } catch (error) {
      throw new Error(`Version not found: ${version}`);
    }
  }

  /**
   * Get all available versions
   */
  async getAllVersions(): Promise<string[]> {
    try {
      await this.validatePath(this.solutionsPath);
      const entries = await fs.readdir(this.solutionsPath, { withFileTypes: true });
      
      const versions = entries
        .filter(entry => entry.isDirectory())
        .filter(entry => entry.name.startsWith('v'))
        .map(entry => entry.name)
        .sort((a, b) => {
          // Sort versions properly (v1-0, v1-1, v2-0, etc.)
          const aNum = a.replace('v', '').split('-').map(Number);
          const bNum = b.replace('v', '').split('-').map(Number);
          
          for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
            const aPart = aNum[i] || 0;
            const bPart = bNum[i] || 0;
            if (aPart !== bPart) {
              return bPart - aPart; // Descending order (newest first)
            }
          }
          return 0;
        });

      return versions;
    } catch (error) {
      throw new Error('Unable to read solutions directory');
    }
  }

  /**
   * Check if a solution exists
   */
  async solutionExists(version: string, domain: string, solution: string): Promise<boolean> {
    const solutionPath = path.join(this.solutionsPath, version, domain, solution);
    
    try {
      await this.validatePath(solutionPath);
      const stats = await fs.stat(solutionPath);
      return stats.isDirectory();
    } catch (error) {
      return false;
    }
  }

  /**
   * Get solution metadata (without reading full manifest)
   */
  async getSolutionMetadata(version: string, domain: string, solution: string): Promise<{
    name: string;
    hasManifest: boolean;
    hasReadme: boolean;
    hasStyles: boolean;
    files: string[];
  }> {
    const solutionPath = path.join(this.solutionsPath, version, domain, solution);
    
    try {
      await this.validatePath(solutionPath);
      const files = await fs.readdir(solutionPath);
      
      return {
        name: solution,
        hasManifest: files.includes('manifest.json'),
        hasReadme: files.includes('README.md'),
        hasStyles: files.includes('styles.css'),
        files: files.sort()
      };
    } catch (error) {
      throw new Error(`Solution not found: ${version}/${domain}/${solution}`);
    }
  }

  /**
   * Validate that the path is within our solutions directory (security)
   */
  private async validatePath(filePath: string): Promise<void> {
    const resolvedPath = path.resolve(filePath);
    const resolvedSolutionsPath = path.resolve(this.solutionsPath);
    
    if (!resolvedPath.startsWith(resolvedSolutionsPath)) {
      throw new Error('Invalid path: Access denied');
    }

    try {
      await fs.access(resolvedPath);
    } catch (error) {
      throw new Error('Path does not exist');
    }
  }
}