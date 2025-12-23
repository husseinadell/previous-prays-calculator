type ValidationError = string;

export const validateProfileCreate = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!data.gender) {
    errors.push('Gender is required');
  } else if (!['MALE', 'FEMALE'].includes(data.gender)) {
    errors.push('Gender must be either MALE or FEMALE');
  }

  if (!data.pubertyDate) {
    errors.push('Puberty date is required');
  } else if (isNaN(Date.parse(data.pubertyDate))) {
    errors.push('Puberty date must be a valid date');
  }

  // Validate prayer percentages (0-100)
  const prayerFields = [
    'fajrMissPercent',
    'dhuhrMissPercent',
    'asrMissPercent',
    'maghribMissPercent',
    'ishaMissPercent',
  ];

  prayerFields.forEach(field => {
    if (data[field] !== undefined) {
      const value = parseFloat(data[field]);
      if (isNaN(value) || value < 0 || value > 100) {
        errors.push(`${field} must be a number between 0 and 100`);
      }
    }
  });

  // Jomaa percentage validation
  if (data.jomaaMissPercent !== undefined) {
    const value = parseFloat(data.jomaaMissPercent);
    if (isNaN(value) || value < 0 || value > 100) {
      errors.push('jomaaMissPercent must be a number between 0 and 100');
    }
  }

  // Period days average validation (for females)
  if (data.periodDaysAverage !== undefined) {
    const value = parseFloat(data.periodDaysAverage);
    if (isNaN(value) || value < 0 || value > 31) {
      errors.push('periodDaysAverage must be a number between 0 and 31');
    }
  }

  // Regular prayer start date validation
  if (data.regularPrayerStartDate !== undefined) {
    if (isNaN(Date.parse(data.regularPrayerStartDate))) {
      errors.push('regularPrayerStartDate must be a valid date');
    }
  }

  return errors;
};

export const validateProfileUpdate = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Gender validation (if provided)
  if (data.gender !== undefined && !['MALE', 'FEMALE'].includes(data.gender)) {
    errors.push('Gender must be either MALE or FEMALE');
  }

  // Puberty date validation (if provided)
  if (data.pubertyDate !== undefined && isNaN(Date.parse(data.pubertyDate))) {
    errors.push('Puberty date must be a valid date');
  }

  // Validate prayer percentages (0-100)
  const prayerFields = [
    'fajrMissPercent',
    'dhuhrMissPercent',
    'asrMissPercent',
    'maghribMissPercent',
    'ishaMissPercent',
  ];

  prayerFields.forEach(field => {
    if (data[field] !== undefined) {
      const value = parseFloat(data[field]);
      if (isNaN(value) || value < 0 || value > 100) {
        errors.push(`${field} must be a number between 0 and 100`);
      }
    }
  });

  // Jomaa percentage validation
  if (data.jomaaMissPercent !== undefined) {
    const value = parseFloat(data.jomaaMissPercent);
    if (isNaN(value) || value < 0 || value > 100) {
      errors.push('jomaaMissPercent must be a number between 0 and 100');
    }
  }

  // Period days average validation
  if (data.periodDaysAverage !== undefined) {
    const value = parseFloat(data.periodDaysAverage);
    if (isNaN(value) || value < 0 || value > 31) {
      errors.push('periodDaysAverage must be a number between 0 and 31');
    }
  }

  // Regular prayer start date validation
  if (data.regularPrayerStartDate !== undefined) {
    if (isNaN(Date.parse(data.regularPrayerStartDate))) {
      errors.push('regularPrayerStartDate must be a valid date');
    }
  }

  return errors;
};
