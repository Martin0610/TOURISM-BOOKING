import { Router } from 'express';
import { createReview, getPackageReviews } from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/package/:packageId', getPackageReviews);
router.post('/', authenticate, createReview);

export default router;
