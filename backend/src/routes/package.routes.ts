import { Router } from 'express';
import { getPackages, getPackageById, createPackage, updatePackage, deletePackage } from '../controllers/package.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createPackageSchema, updatePackageSchema } from '../utils/schemas';

const router = Router();

router.get('/', getPackages);
router.get('/:id', getPackageById);
router.post('/', authenticate, authorizeAdmin, validate(createPackageSchema), createPackage);
router.put('/:id', authenticate, authorizeAdmin, validate(updatePackageSchema), updatePackage);
router.delete('/:id', authenticate, authorizeAdmin, deletePackage);

export default router;
