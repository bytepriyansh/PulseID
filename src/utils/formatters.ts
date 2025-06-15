// Utility functions for consistent formatting across components

export const calculateBMI = (height: number | string | undefined | null, weight: number | string | undefined | null, heightUnit: 'cm' | 'ft', weightUnit: 'kg' | 'lbs') => {
  console.log('BMI Calculation Input:', { height, weight, heightUnit, weightUnit, 
    heightType: height ? typeof height : 'undefined/null',
    weightType: weight ? typeof weight : 'undefined/null'
  });
  
  // Early return if values are not present or empty strings
  if (!height || !weight || height === '' || weight === '') {
    console.log('BMI: Missing height or weight', { height, weight });
    return 'Not available';
  }
  
  // Convert height and weight to numbers if they're strings
  const heightNum = typeof height === 'string' ? parseFloat(height) : Number(height);
  const weightNum = typeof weight === 'string' ? parseFloat(weight) : Number(weight);

  console.log('Converted numbers:', { heightNum, weightNum });

  if (isNaN(heightNum) || isNaN(weightNum)) {
    console.log('BMI: Invalid number conversion');
    return 'Not available';
  }

  // Convert height to meters
  let heightInMeters: number;
  if (heightUnit === 'cm') {
    heightInMeters = heightNum / 100;
  } else if (heightUnit === 'ft') {
    // For feet format, we need to handle both the total feet value and the separate feet/inches format
    if (height.toString().includes("'")) {
      // Handle feet and inches format like "5'11"
      const [feet, inches] = height.toString().split("'");
      const totalInches = (parseInt(feet) * 12) + (parseInt(inches?.replace('"', '') || '0'));
      heightInMeters = totalInches * 0.0254; // Convert inches to meters
    } else {
      // Handle decimal feet format
      heightInMeters = heightNum * 0.3048;
    }
  } else {
    console.log('BMI: Invalid height unit');
    return 'Invalid height unit';
  }

  // Convert weight to kg
  let weightInKg = weightNum;
  if (weightUnit === 'lbs') {
    weightInKg = weightNum * 0.45359237;
  }

  // Calculate BMI
  const bmi = weightInKg / (heightInMeters * heightInMeters);
  
  if (isNaN(bmi) || !isFinite(bmi)) {
    return 'Not available';
  }

  // Format BMI with classification
  let classification = '';
  if (bmi < 18.5) classification = ' (Underweight)';
  else if (bmi < 25) classification = ' (Normal)';
  else if (bmi < 30) classification = ' (Overweight)';
  else classification = ' (Obese)';

  return `${bmi.toFixed(1)}${classification}`;
};

export const formatDate = (date: string | Date) => {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

export const formatDateOnly = (date: string | Date) => {
  try {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric'
    });
  } catch (e) {
    return 'Invalid date';
  }
};

export const formatDoctorName = (name: string) => {
  if (!name) return '';
  const normalizedName = name.trim();
  // If the name already starts with "Dr." or "Dr ", don't add another one
  if (normalizedName.toLowerCase().startsWith('dr.') || normalizedName.toLowerCase().startsWith('dr ')) {
    return normalizedName;
  }
  return `Dr. ${normalizedName}`;
};
