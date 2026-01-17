import { Router } from 'express';
import {
  markCompleted,
  getCompletedPrayers,
  getAllCompletedPrayers,
  updateCompletedPrayers,
} from '../controllers/completedPrayers.controller';
import { authenticate } from '../middleware/auth.middleware';

const router: Router = Router();

// All completed prayers routes require authentication
router.use(authenticate);

router.post('/', markCompleted);
router.get('/', getAllCompletedPrayers);
router.get('/date', getCompletedPrayers);
router.put('/', updateCompletedPrayers);

export default router;
