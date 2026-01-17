import { Router } from 'express';
import {
  createGoal,
  getGoals,
  getGoal,
  updateGoal,
  calculateGoalDays,
} from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth.middleware';
import {
  validateGoalCreateMiddleware,
  validateGoalUpdateMiddleware,
} from '../middleware/validation.middleware';

const router: Router = Router();

// All goal routes require authentication
router.use(authenticate);

router.post('/', validateGoalCreateMiddleware, createGoal);
router.get('/', getGoals);
router.get('/:id', getGoal);
router.put('/:id', validateGoalUpdateMiddleware, updateGoal);
router.post('/calculate-days', calculateGoalDays);

export default router;
