import { Router } from 'express';
import { validateCoupon, createCoupon, getAllCoupons, updateCoupon, deleteCoupon } from '../controllers/coupon.controller';
import { authenticate, authorizeAdmin } from '../middleware/auth.middleware';

const router = Router();

// User: validate a coupon
router.post('/validate', authenticate, validateCoupon);

// Admin only
router.get('/', authenticate, authorizeAdmin, getAllCoupons);
router.post('/', authenticate, authorizeAdmin, createCoupon);
router.put('/:id', authenticate, authorizeAdmin, updateCoupon);
router.delete('/:id', authenticate, authorizeAdmin, deleteCoupon);

export default router;
