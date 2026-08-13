import { Router } from 'express';
import { getPackages, getPackageById, createPackage, updatePackage, deletePackage } from '../controllers/package.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.get('/', getPackages);
router.get('/:id', getPackageById);
router.post('/', authenticate, authorizeAdmin, createPackage);
router.put('/:id', authenticate, authorizeAdmin, updatePackage);
router.delete('/:id', authenticate, authorizeAdmin, deletePackage);

export default router;
