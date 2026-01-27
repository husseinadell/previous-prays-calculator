import { Router } from 'express';
import {
  createProfile,
  getProfile,
  updateProfile,
  deleteProfile,
  getProgressStats,
} from '../controllers/profile.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  validateProfileCreateMiddleware,
  validateProfileUpdateMiddleware,
} from '../middleware/validation.middleware';

const router: Router = Router();

// All profile routes require authentication
router.use(authenticate);

router.post('/', validateProfileCreateMiddleware, createProfile);
router.get('/', getProfile);
router.get('/progress', getProgressStats);
router.put('/', validateProfileUpdateMiddleware, updateProfile);
router.delete('/', deleteProfile);

export default router;
