import { Router } from 'express';
import { getDashboardStats, getAllUsers, getUserById, getAllPayments } from '../controllers/admin.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.get('/payments', getAllPayments);

export default router;
