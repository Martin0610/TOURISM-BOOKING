import { Router } from 'express';
import { getDashboardStats, getAllUsers, getUserById, getAllPayments, getRevenueStats, updateUserRole } from '../controllers/admin.controller';
import { getAllReviewsAdmin, moderateReview, deleteReview } from '../controllers/review.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate, authorizeAdmin);

router.get('/stats', getDashboardStats);
router.get('/revenue', getRevenueStats);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.patch('/users/:id/role', updateUserRole);
router.get('/payments', getAllPayments);
router.get('/reviews', getAllReviewsAdmin);
router.patch('/reviews/:id', moderateReview);
router.delete('/reviews/:id', deleteReview);

export default router;
