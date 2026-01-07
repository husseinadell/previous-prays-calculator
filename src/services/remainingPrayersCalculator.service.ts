import { Gender } from '../../prisma/prisma/client';

interface ProfileData {
  gender: Gender;
  pubertyDate: Date;
  regularPrayerStartDate: Date | null;
  periodDaysAverage: number | null;
  fajrMissPercent: number;
  dhuhrMissPercent: number;
  asrMissPercent: number;
  maghribMissPercent: number;
  ishaMissPercent: number;
  witrMissPercent: number | null;
  jomaaMissPercent: number | null;
}

interface RemainingPrayers {
  fajrRemaining: number;
  dhuhrRemaining: number;
  asrRemaining: number;
  maghribRemaining: number;
  ishaRemaining: number;
  witrRemaining: number;
}

/**
 * Calculate the number of days between two dates
 */
const calculateDaysBetween = (startDate: Date, endDate: Date): number => {
  const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Calculate period days for women
 * periodDaysAverage is per month, so we calculate total period days
 */
const calculateTotalPeriodDays = (totalDays: number, periodDaysAverage: number | null): number => {
  if (!periodDaysAverage || periodDaysAverage === 0) {
    return 0;
  }

  // Average month is ~30.44 days
  const months = totalDays / 30.44;
  return Math.floor(months * periodDaysAverage);
};

/**
 * Calculate remaining prayers for a specific prayer type based on miss percentage
 */
const calculatePrayerRemaining = (totalPrayerDays: number, missPercent: number): number => {
  const missedPrayers = Math.floor((totalPrayerDays * missPercent) / 100);
  return missedPrayers;
};

/**
 * Calculate number of Jomaa prayers in a given period
 * Jomaa is every Friday, so we count Fridays between dates
 */
const calculateJomaaCount = (startDate: Date, endDate: Date): number => {
  let jomaaCount = 0;
  const currentDate = new Date(startDate);

  // Find the first Friday
  while (currentDate.getDay() !== 5 && currentDate <= endDate) {
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Count all Fridays in the period
  while (currentDate <= endDate) {
    jomaaCount++;
    currentDate.setDate(currentDate.getDate() + 7); // Next Friday
  }

  return jomaaCount;
};

/**
 * Calculate remaining prayers for men
 * After regularPrayerStartDate, we assume 100% prayer rate (0% miss)
 * So we only calculate from puberty to regularPrayerStartDate
 * Apply miss percentages to each prayer type
 * Jomaa prayers are subtracted from Dhuhr remaining
 */
const calculateForMen = (profile: ProfileData, prayerDays: number): RemainingPrayers => {
  // Apply miss percentages to each prayer type
  const fajrRemaining = calculatePrayerRemaining(prayerDays, profile.fajrMissPercent);
  let dhuhrRemaining = calculatePrayerRemaining(prayerDays, profile.dhuhrMissPercent);
  const asrRemaining = calculatePrayerRemaining(prayerDays, profile.asrMissPercent);
  const maghribRemaining = calculatePrayerRemaining(prayerDays, profile.maghribMissPercent);
  const ishaRemaining = calculatePrayerRemaining(prayerDays, profile.ishaMissPercent);

  // Witr is optional, use 0 if not provided
  const witrMissPercent = profile.witrMissPercent || 0;
  const witrRemaining = calculatePrayerRemaining(prayerDays, witrMissPercent);

  // Calculate Jomaa prayers in the period and subtract from Dhuhr
  const jomaaCount = calculateJomaaCount(
    profile.pubertyDate,
    profile.regularPrayerStartDate ?? new Date()
  );
  const jomaaMissPercent = profile.jomaaMissPercent || 0;
  const jomaaMissed = Math.floor((jomaaCount * jomaaMissPercent) / 100);
  const jomaaPrayed = jomaaCount - jomaaMissed;

  // Dhuhr remaining = calculated Dhuhr missed - Jomaa prayers (since Jomaa replaces Dhuhr)
  dhuhrRemaining = Math.max(0, dhuhrRemaining - jomaaPrayed);

  return {
    fajrRemaining,
    dhuhrRemaining,
    asrRemaining,
    maghribRemaining,
    ishaRemaining,
    witrRemaining,
  };
};

/**
 * Calculate remaining prayers for women
 * After regularPrayerStartDate, we assume 100% prayer rate (0% miss)
 * So we only calculate from puberty to regularPrayerStartDate
 * Period days are subtracted from the calculation period (no prayers during period)
 * Apply miss percentages to each prayer type
 * Jomaa is NOT part of women's calculation
 */
const calculateForWomen = (profile: ProfileData, prayerDays: number): RemainingPrayers => {
  // Apply miss percentages to each prayer type
  const fajrRemaining = calculatePrayerRemaining(prayerDays, profile.fajrMissPercent);
  const dhuhrRemaining = calculatePrayerRemaining(prayerDays, profile.dhuhrMissPercent);
  const asrRemaining = calculatePrayerRemaining(prayerDays, profile.asrMissPercent);
  const maghribRemaining = calculatePrayerRemaining(prayerDays, profile.maghribMissPercent);
  const ishaRemaining = calculatePrayerRemaining(prayerDays, profile.ishaMissPercent);

  // Witr is optional, use 0 if not provided
  const witrMissPercent = profile.witrMissPercent || 0;
  const witrRemaining = calculatePrayerRemaining(prayerDays, witrMissPercent);

  return {
    fajrRemaining,
    dhuhrRemaining,
    asrRemaining,
    maghribRemaining,
    ishaRemaining,
    witrRemaining,
  };
};

/**
 * Main function to calculate remaining prayers
 * @param profile - User profile data
 * @param referenceDate - Date to calculate from (defaults to today)
 * @returns Remaining prayers count for each prayer type
 */
export const calculateRemainingPrayers = (
  profile: ProfileData,
  referenceDate: Date = new Date()
): RemainingPrayers => {
  const pubertyDate = profile.pubertyDate;
  let totalDays = calculateDaysBetween(
    pubertyDate,
    profile.regularPrayerStartDate ?? referenceDate
  );

  if (profile.gender === Gender.MALE) {
    // For men: apply miss percentages, subtract Jomaa from Dhuhr
    return calculateForMen(profile, totalDays);
  } else {
    // For women: subtract period days, then apply miss percentages
    totalDays = totalDays - calculateTotalPeriodDays(totalDays, profile.periodDaysAverage);
    return calculateForWomen(profile, totalDays);
  }
};
