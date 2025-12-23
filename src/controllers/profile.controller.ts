import { Response } from 'express';
import prisma from '../config/database';
import { getLogger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth.middleware';

export const createProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;

    // Check if profile already exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      log.warn({ userId }, 'Profile creation failed: profile already exists');
      res.status(400).json({ error: 'Profile already exists. Use update endpoint instead.' });
      return;
    }

    const {
      gender,
      pubertyDate,
      regularPrayerStartDate,
      periodDaysAverage,
      fajrMissPercent = 0,
      dhuhrMissPercent = 0,
      asrMissPercent = 0,
      maghribMissPercent = 0,
      ishaMissPercent = 0,
      jomaaMissPercent,
    } = req.body;

    // Create profile
    const profile = await prisma.profile.create({
      data: {
        userId,
        gender,
        pubertyDate: new Date(pubertyDate),
        regularPrayerStartDate: regularPrayerStartDate ? new Date(regularPrayerStartDate) : null,
        periodDaysAverage: periodDaysAverage ? parseFloat(periodDaysAverage) : null,
        fajrMissPercent: parseFloat(fajrMissPercent) || 0,
        dhuhrMissPercent: parseFloat(dhuhrMissPercent) || 0,
        asrMissPercent: parseFloat(asrMissPercent) || 0,
        maghribMissPercent: parseFloat(maghribMissPercent) || 0,
        ishaMissPercent: parseFloat(ishaMissPercent) || 0,
        jomaaMissPercent: jomaaMissPercent ? parseFloat(jomaaMissPercent) : null,
      },
    });

    log.info({ userId, profileId: profile.id }, 'Profile created successfully');

    res.status(201).json({
      message: 'Profile created successfully',
      profile,
    });
  } catch (error) {
    log.error({ err: error }, 'Profile creation error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;

    const profile = await prisma.profile.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    if (!profile) {
      log.warn({ userId }, 'Profile not found');
      res.status(404).json({ error: 'Profile not found' });
      return;
    }

    log.info({ userId, profileId: profile.id }, 'Profile retrieved successfully');

    res.json({ profile });
  } catch (error) {
    log.error({ err: error }, 'Profile retrieval error');
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  const log = getLogger(req.traceId);

  try {
    const userId = req.userId!;

    // Check if profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: { userId },
    });

    if (!existingProfile) {
      log.warn({ userId }, 'Profile update failed: profile not found');
      res.status(404).json({ error: 'Profile not found. Create a profile first.' });
      return;
    }

    const {
      gender,
      pubertyDate,
      regularPrayerStartDate,
      periodDaysAverage,
      fajrMissPercent,
      dhuhrMissPercent,
      asrMissPercent,
      maghribMissPercent,
      ishaMissPercent,
      jomaaMissPercent,
    } = req.body;

    // Build update data object (only include provided fields)
    const updateData: any = {};

    if (gender !== undefined) updateData.gender = gender;
    if (pubertyDate !== undefined) updateData.pubertyDate = new Date(pubertyDate);
    if (regularPrayerStartDate !== undefined)
      updateData.regularPrayerStartDate = regularPrayerStartDate
        ? new Date(regularPrayerStartDate)
        : null;
    if (periodDaysAverage !== undefined)
      updateData.periodDaysAverage = periodDaysAverage ? parseFloat(periodDaysAverage) : null;
    if (fajrMissPercent !== undefined) updateData.fajrMissPercent = parseFloat(fajrMissPercent);
    if (dhuhrMissPercent !== undefined) updateData.dhuhrMissPercent = parseFloat(dhuhrMissPercent);
    if (asrMissPercent !== undefined) updateData.asrMissPercent = parseFloat(asrMissPercent);
    if (maghribMissPercent !== undefined)
      updateData.maghribMissPercent = parseFloat(maghribMissPercent);
    if (ishaMissPercent !== undefined) updateData.ishaMissPercent = parseFloat(ishaMissPercent);
    if (jomaaMissPercent !== undefined)
      updateData.jomaaMissPercent = jomaaMissPercent ? parseFloat(jomaaMissPercent) : null;

    const profile = await prisma.profile.update({
      where: { userId },
      data: updateData,
    });

    log.info({ userId, profileId: profile.id }, 'Profile updated successfully');

    res.json({
      message: 'Profile updated successfully',
      profile,
    });
  } catch (error) {
    log.error({ err: error }, 'Profile update error');
    res.status(500).json({ error: 'Internal server error' });
  }
};
