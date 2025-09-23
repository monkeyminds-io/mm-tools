import { Router, Request, Response } from 'express';
import { asyncHandler, createError } from '../middleware/errorHandler';
import { SolutionService } from '../services/SolutionService';

const router = Router();
const solutionService = new SolutionService();

// GET /v{version}/{domain}/{solution} - Get solution files
router.get('/:version/:domain/:solution', asyncHandler(async (req: Request, res: Response) => {
  const version = req.params.version;
  const { domain, solution } = req.params;
  const { file } = req.query;

  try {
    if (file) {
      // Serve specific file (e.g., styles.css, manifest.json)
      const fileContent = await solutionService.getSolutionFile(version, domain, solution, file as string);
      
      // Set appropriate content type
      const contentType = getContentType(file as string);
      res.setHeader('Content-Type', contentType);
      
      res.send(fileContent);
    } else {
      // Serve main JavaScript file by default
      const jsContent = await solutionService.getSolutionFile(version, domain, solution, 'index.js');
      res.setHeader('Content-Type', 'application/javascript');
      res.send(jsContent);
    }
  } catch (error) {
    throw createError(`Solution not found: ${version}/${domain}/${solution}`, 404);
  }
}));

// GET /v{version}/{domain}/{solution}/manifest - Get solution manifest
router.get('/:version/:domain/:solution/manifest', asyncHandler(async (req: Request, res: Response) => {
  const version = req.params.version;
  const { domain, solution } = req.params;
  
  try {
    const manifest = await solutionService.getSolutionManifest(version, domain, solution);
    res.json(manifest);
  } catch (error) {
    throw createError(`Manifest not found for solution: ${version}/${domain}/${solution}`, 404);
  }
}));

// GET /v{version}/{domain} - List solutions in domain
router.get('/:version/:domain', asyncHandler(async (req: Request, res: Response) => {
  const version = req.params.version;
  const { domain } = req.params;
  
  try {
    const solutions = await solutionService.getDomainSolutions(version, domain);
    res.json({
      domain,
      version,
      solutions,
      count: solutions.length
    });
  } catch (error) {
    throw createError(`Domain not found: ${version}/${domain}`, 404);
  }
}));

// GET /v{version} - List all domains and solutions
router.get('/:version', asyncHandler(async (req: Request, res: Response) => {
  const version = req.params.version;
  
  try {
    const catalog = await solutionService.getVersionCatalog(version);
    res.json(catalog);
  } catch (error) {
    throw createError(`Version not found: ${version}`, 404);
  }
}));

// GET / - List all available versions
router.get('/', asyncHandler(async (_req: Request, res: Response) => {
  try {
    const versions = await solutionService.getAllVersions();
    res.json({
      message: 'MonkeyMinds Tools API',
      versions,
      endpoints: {
        health: '/health',
        version_catalog: '/{version}',
        domain_solutions: '/{version}/{domain}',
        solution_files: '/{version}/{domain}/{solution}',
        solution_manifest: '/{version}/{domain}/{solution}/manifest'
      }
    });
  } catch (error) {
    throw createError('Unable to load solutions catalog', 500);
  }
}));

// Helper function to determine content type
function getContentType(filename: string): string {
  const ext = filename.toLowerCase().split('.').pop();
  
  switch (ext) {
    case 'js':
      return 'application/javascript';
    case 'css':
      return 'text/css';
    case 'json':
      return 'application/json';
    case 'html':
      return 'text/html';
    case 'md':
      return 'text/markdown';
    default:
      return 'text/plain';
  }
}

export { router as solutionsRouter };