import { Response } from 'express';
import prisma from '../config/database';
import { getLogger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

export const createGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;

    const {
      fajrGoal = 0,
      dhuhrGoal = 0,
      asrGoal = 0,
      maghribGoal = 0,
      ishaGoal = 0,
      witrGoal = 0,
      startDate,
      endDate,
      isActive = true,
    } = req.body;

    // Deactivate all existing active goals for this user
    if (isActive) {
      await prisma.goal.updateMany({
        where: {
          userId,
          isActive: true,
        },
        data: {
          isActive: false,
        },
      });
    }

    // Create new goal
    const goal = await prisma.goal.create({
      data: {
        userId,
        fajrGoal: parseInt(fajrGoal, 10) || 0,
        dhuhrGoal: parseInt(dhuhrGoal, 10) || 0,
        asrGoal: parseInt(asrGoal, 10) || 0,
        maghribGoal: parseInt(maghribGoal, 10) || 0,
        ishaGoal: parseInt(ishaGoal, 10) || 0,
        witrGoal: parseInt(witrGoal, 10) || 0,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : null,
        isActive,
      },
    });

    log.info({ userId, goalId: goal.id }, 'Goal created successfully');

    res.status(201).json({
      message: 'Goal created successfully',
      goal,
    });
  } catch (error) {
    log.error({ err: error }, 'Goal creation error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGoals = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;
    const { active } = req.query;

    const where: { userId: string; isActive?: boolean } = { userId };

    // Filter by active status if provided
    if (active !== undefined) {
      where.isActive = active === 'true';
    }

    const goals = await prisma.goal.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    log.info({ userId, count: goals.length }, 'Goals retrieved successfully');

    res.json({
      goals,
    });
  } catch (error) {
    log.error({ err: error }, 'Goals retrieval error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;
    const { id } = req.params;

    const goal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!goal) {
      log.warn({ userId, goalId: id }, 'Goal not found');
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    log.info({ userId, goalId: goal.id }, 'Goal retrieved successfully');

    res.json({
      goal,
    });
  } catch (error) {
    log.error({ err: error }, 'Goal retrieval error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateGoal = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;
    const { id } = req.params;

    // Check if goal exists and belongs to user
    const existingGoal = await prisma.goal.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!existingGoal) {
      log.warn({ userId, goalId: id }, 'Goal update failed: goal not found');
      res.status(404).json({ error: 'Goal not found' });
      return;
    }

    const {
      fajrGoal,
      dhuhrGoal,
      asrGoal,
      maghribGoal,
      ishaGoal,
      witrGoal,
      startDate,
      endDate,
      isActive,
    } = req.body;

    // Build update data object (only include provided fields)
    const updateData: {
      fajrGoal?: number;
      dhuhrGoal?: number;
      asrGoal?: number;
      maghribGoal?: number;
      ishaGoal?: number;
      witrGoal?: number;
      startDate?: Date;
      endDate?: Date | null;
      isActive?: boolean;
    } = {};

    if (fajrGoal !== undefined) updateData.fajrGoal = parseInt(fajrGoal, 10);
    if (dhuhrGoal !== undefined) updateData.dhuhrGoal = parseInt(dhuhrGoal, 10);
    if (asrGoal !== undefined) updateData.asrGoal = parseInt(asrGoal, 10);
    if (maghribGoal !== undefined) updateData.maghribGoal = parseInt(maghribGoal, 10);
    if (ishaGoal !== undefined) updateData.ishaGoal = parseInt(ishaGoal, 10);
    if (witrGoal !== undefined) updateData.witrGoal = parseInt(witrGoal, 10);
    if (startDate !== undefined) updateData.startDate = new Date(startDate);
    if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
    if (isActive !== undefined) {
      updateData.isActive = isActive;

      // If activating this goal, deactivate all other active goals for this user
      if (isActive) {
        await prisma.goal.updateMany({
          where: {
            userId,
            isActive: true,
            id: { not: id },
          },
          data: {
            isActive: false,
          },
        });
      }
    }

    const goal = await prisma.goal.update({
      where: { id },
      data: updateData,
    });

    log.info({ userId, goalId: goal.id }, 'Goal updated successfully');

    res.json({
      message: 'Goal updated successfully',
      goal,
    });
  } catch (error) {
    log.error({ err: error }, 'Goal update error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Calculate how many days it will take to complete a goal based on remaining prayers
 * Takes goal amounts and calculates days needed for each prayer type
 */
export const calculateGoalDays = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;

    // Check if user has a profile and remaining prayers
    const remainingPrayers = await prisma.remainingPrayers.findUnique({
      where: { userId },
    });

    if (!remainingPrayers) {
      log.warn({ userId }, 'Remaining prayers not found');
      res.status(404).json({
        error: 'Remaining prayers not found. Please create a profile first.',
      });
      return;
    }

    const {
      fajrGoal = 0,
      dhuhrGoal = 0,
      asrGoal = 0,
      maghribGoal = 0,
      ishaGoal = 0,
      witrGoal = 0,
    } = req.body;

    // Parse goal values
    const goals = {
      fajr: parseInt(fajrGoal, 10) || 0,
      dhuhr: parseInt(dhuhrGoal, 10) || 0,
      asr: parseInt(asrGoal, 10) || 0,
      maghrib: parseInt(maghribGoal, 10) || 0,
      isha: parseInt(ishaGoal, 10) || 0,
      witr: parseInt(witrGoal, 10) || 0,
    };

    // Calculate days needed for each prayer type
    const calculateDays = (remaining: number, goal: number): number | null => {
      if (goal <= 0) {
        return null; // Can't calculate if goal is 0 or negative
      }
      return Math.ceil(remaining / goal); // Round up to nearest day
    };

    const daysBreakdown = {
      fajr: calculateDays(remainingPrayers.fajrRemaining, goals.fajr),
      dhuhr: calculateDays(remainingPrayers.dhuhrRemaining, goals.dhuhr),
      asr: calculateDays(remainingPrayers.asrRemaining, goals.asr),
      maghrib: calculateDays(remainingPrayers.maghribRemaining, goals.maghrib),
      isha: calculateDays(remainingPrayers.ishaRemaining, goals.isha),
      witr: calculateDays(remainingPrayers.witrRemaining, goals.witr),
    };

    // Find the maximum days needed (the limiting factor)
    const daysArray = Object.values(daysBreakdown).filter((days): days is number => days !== null);
    const maxDays = daysArray.length > 0 ? Math.max(...daysArray) : null;

    log.info({ userId, maxDays, goals }, 'Goal days calculated successfully');

    res.json({
      remainingPrayers: {
        fajrRemaining: remainingPrayers.fajrRemaining,
        dhuhrRemaining: remainingPrayers.dhuhrRemaining,
        asrRemaining: remainingPrayers.asrRemaining,
        maghribRemaining: remainingPrayers.maghribRemaining,
        ishaRemaining: remainingPrayers.ishaRemaining,
        witrRemaining: remainingPrayers.witrRemaining,
      },
      goal: {
        fajrGoal: goals.fajr,
        dhuhrGoal: goals.dhuhr,
        asrGoal: goals.asr,
        maghribGoal: goals.maghrib,
        ishaGoal: goals.isha,
        witrGoal: goals.witr,
      },
      daysBreakdown,
      maxDays,
      message: maxDays
        ? `It will take ${maxDays} days to complete all remaining prayers with the given goal.`
        : 'Please set at least one prayer goal greater than 0.',
    });
  } catch (error) {
    log.error({ err: error }, 'Calculate goal days error');
    res.status(500).json({ error: 'Internal server error' });
  }
};
