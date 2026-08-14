import { Router } from 'express';
import { createBooking, getBookings, getBookingById, updateBooking, cancelBooking } from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createBookingSchema, updateBookingSchema } from '../utils/schemas';

const router = Router();

router.use(authenticate);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id', validate(updateBookingSchema), updateBooking);
router.delete('/:id', cancelBooking);

export default router;
