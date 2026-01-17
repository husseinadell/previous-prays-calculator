type ValidationError = string;

export const validateGoalCreate = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate goal values (must be non-negative integers)
  const goalFields = ['fajrGoal', 'dhuhrGoal', 'asrGoal', 'maghribGoal', 'ishaGoal', 'witrGoal'];

  goalFields.forEach(field => {
    if (data[field] !== undefined) {
      const value = parseInt(data[field], 10);
      if (isNaN(value) || value < 0) {
        errors.push(`${field} must be a non-negative integer`);
      }
    }
  });

  // At least one goal should be set
  const hasAnyGoal = goalFields.some(
    field => data[field] !== undefined && parseInt(data[field], 10) > 0
  );
  if (!hasAnyGoal) {
    errors.push('At least one prayer goal must be set');
  }

  // Validate dates if provided
  if (data.startDate !== undefined && isNaN(Date.parse(data.startDate))) {
    errors.push('startDate must be a valid date');
  }

  if (data.endDate !== undefined && data.endDate !== null) {
    if (isNaN(Date.parse(data.endDate))) {
      errors.push('endDate must be a valid date');
    } else if (data.startDate) {
      const start = new Date(data.startDate);
      const end = new Date(data.endDate);
      if (end < start) {
        errors.push('endDate must be after startDate');
      }
    }
  }

  return errors;
};

export const validateGoalUpdate = (data: any): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Validate goal values (must be non-negative integers)
  const goalFields = ['fajrGoal', 'dhuhrGoal', 'asrGoal', 'maghribGoal', 'ishaGoal', 'witrGoal'];

  goalFields.forEach(field => {
    if (data[field] !== undefined) {
      const value = parseInt(data[field], 10);
      if (isNaN(value) || value < 0) {
        errors.push(`${field} must be a non-negative integer`);
      }
    }
  });

  // Validate dates if provided
  if (data.startDate !== undefined && isNaN(Date.parse(data.startDate))) {
    errors.push('startDate must be a valid date');
  }

  if (data.endDate !== undefined && data.endDate !== null) {
    if (isNaN(Date.parse(data.endDate))) {
      errors.push('endDate must be a valid date');
    }
  }

  // Validate endDate is after startDate if both are provided
  if (data.startDate !== undefined && data.endDate !== undefined && data.endDate !== null) {
    const start = new Date(data.startDate);
    const end = new Date(data.endDate);
    if (end < start) {
      errors.push('endDate must be after startDate');
    }
  }

  return errors;
};
