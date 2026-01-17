import { Response } from 'express';
import prisma from '../config/database';
import { getLogger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * Mark prayers as completed for a specific date (or today if not provided) based on the most recent active goal
 * This creates a completed prayers record with values from the active goal
 */
export const markCompleted = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;
    const { date } = req.query;

    // Get target date (use provided date or default to today)
    let targetDate: Date;
    if (date) {
      targetDate = new Date(date as string);
      targetDate.setHours(0, 0, 0, 0);
    } else {
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }

    // Find the most recent active goal for the user
    const activeGoal = await prisma.goal.findFirst({
      where: {
        userId,
        isActive: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!activeGoal) {
      log.warn({ userId }, 'No active goal found');
      res.status(404).json({ error: 'No active goal found. Please create an active goal first.' });
      return;
    }

    // Check if there's already a completed prayers record for the target date
    const existingRecord = await prisma.completedPrayers.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    if (existingRecord) {
      log.warn({ userId, date: targetDate }, 'Date already marked as completed');
      res.status(400).json({
        error: 'This date has already been marked as completed. Use update endpoint to modify.',
        completedPrayers: existingRecord,
        date: targetDate.toISOString().split('T')[0],
      });
      return;
    }

    // Create completed prayers record based on the goal
    const completedPrayers = await prisma.completedPrayers.create({
      data: {
        userId,
        date: targetDate,
        fajrCompleted: activeGoal.fajrGoal,
        dhuhrCompleted: activeGoal.dhuhrGoal,
        asrCompleted: activeGoal.asrGoal,
        maghribCompleted: activeGoal.maghribGoal,
        ishaCompleted: activeGoal.ishaGoal,
        witrCompleted: activeGoal.witrGoal,
      },
    });

    log.info(
      { userId, date: targetDate, goalId: activeGoal.id },
      'Date marked as completed successfully'
    );

    res.status(201).json({
      message: 'Date marked as completed successfully',
      completedPrayers,
      date: targetDate.toISOString().split('T')[0],
      goal: {
        id: activeGoal.id,
        fajrGoal: activeGoal.fajrGoal,
        dhuhrGoal: activeGoal.dhuhrGoal,
        asrGoal: activeGoal.asrGoal,
        maghribGoal: activeGoal.maghribGoal,
        ishaGoal: activeGoal.ishaGoal,
        witrGoal: activeGoal.witrGoal,
      },
    });
  } catch (error) {
    log.error({ err: error }, 'Mark completed error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get completed prayers for a specific date or today if no date provided
 */
export const getCompletedPrayers = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;
    const { date } = req.query;

    let targetDate: Date;
    if (date) {
      targetDate = new Date(date as string);
      targetDate.setHours(0, 0, 0, 0);
    } else {
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }

    const completedPrayers = await prisma.completedPrayers.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    if (!completedPrayers) {
      log.info({ userId, date: targetDate }, 'No completed prayers found for date');
      res.status(404).json({
        error: 'No completed prayers found for this date',
        date: targetDate.toISOString().split('T')[0],
      });
      return;
    }

    log.info({ userId, date: targetDate }, 'Completed prayers retrieved successfully');

    res.json({
      completedPrayers,
    });
  } catch (error) {
    log.error({ err: error }, 'Get completed prayers error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get all completed prayers for the user, optionally filtered by date range
 */
export const getAllCompletedPrayers = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;
    const { startDate, endDate } = req.query;

    const where: { userId: string; date?: { gte?: Date; lte?: Date } } = { userId };

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        const start = new Date(startDate as string);
        start.setHours(0, 0, 0, 0);
        where.date.gte = start;
      }
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999);
        where.date.lte = end;
      }
    }

    const completedPrayers = await prisma.completedPrayers.findMany({
      where,
      orderBy: {
        date: 'desc',
      },
    });

    log.info(
      { userId, count: completedPrayers.length },
      'All completed prayers retrieved successfully'
    );

    res.json({
      completedPrayers,
      count: completedPrayers.length,
    });
  } catch (error) {
    log.error({ err: error }, 'Get all completed prayers error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Update completed prayers for a specific date (or today if not provided)
 * Accepts counts for each prayer type and increments the record
 */
export const updateCompletedPrayers = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;
    const { date } = req.query;
    const {
      fajrCompleted = 0,
      dhuhrCompleted = 0,
      asrCompleted = 0,
      maghribCompleted = 0,
      ishaCompleted = 0,
      witrCompleted = 0,
    } = req.body;

    // Get target date (use provided date or default to today)
    let targetDate: Date;
    if (date) {
      targetDate = new Date(date as string);
      targetDate.setHours(0, 0, 0, 0);
    } else {
      targetDate = new Date();
      targetDate.setHours(0, 0, 0, 0);
    }

    // Parse increment values
    const fajrIncrement = parseInt(fajrCompleted, 10) || 0;
    const dhuhrIncrement = parseInt(dhuhrCompleted, 10) || 0;
    const asrIncrement = parseInt(asrCompleted, 10) || 0;
    const maghribIncrement = parseInt(maghribCompleted, 10) || 0;
    const ishaIncrement = parseInt(ishaCompleted, 10) || 0;
    const witrIncrement = parseInt(witrCompleted, 10) || 0;

    // Upsert completed prayers record with increment
    const completedPrayers = await prisma.completedPrayers.upsert({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
      create: {
        userId,
        date: targetDate,
        fajrCompleted: fajrIncrement,
        dhuhrCompleted: dhuhrIncrement,
        asrCompleted: asrIncrement,
        maghribCompleted: maghribIncrement,
        ishaCompleted: ishaIncrement,
        witrCompleted: witrIncrement,
      },
      update: {
        fajrCompleted: {
          increment: fajrIncrement,
        },
        dhuhrCompleted: {
          increment: dhuhrIncrement,
        },
        asrCompleted: {
          increment: asrIncrement,
        },
        maghribCompleted: {
          increment: maghribIncrement,
        },
        ishaCompleted: {
          increment: ishaIncrement,
        },
        witrCompleted: {
          increment: witrIncrement,
        },
      },
    });

    log.info({ userId, date: targetDate }, 'Completed prayers incremented successfully');

    res.json({
      message: 'Completed prayers incremented successfully',
      completedPrayers,
      date: targetDate.toISOString().split('T')[0],
    });
  } catch (error) {
    log.error({ err: error }, 'Update today completed prayers error');
    res.status(500).json({ error: 'Internal server error' });
  }
};
