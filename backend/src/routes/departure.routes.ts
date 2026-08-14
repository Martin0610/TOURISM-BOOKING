import { Router } from 'express';
import { getDepartures, getDepartureById } from '../controllers/departure.controller';

const router = Router();

router.get('/', getDepartures);
router.get('/:id', getDepartureById);

export default router;
