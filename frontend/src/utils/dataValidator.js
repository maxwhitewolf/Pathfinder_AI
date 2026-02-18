// Utility to validate and sanitize data before rendering in React

/**
 * Validates if a career object is valid and safe to render
 */
export const isValidCareer = (career) => {
  if (!career || typeof career !== 'object') return false;
  if (!career.career || typeof career.career !== 'string') return false;
  return true;
};

/**
 * Validates if similarity_score is a valid number
 */
export const isValidSimilarityScore = (score) => {
  return typeof score === 'number' && !isNaN(score) && isFinite(score);
};

/**
 * Sanitizes a skill to ensure it's a string
 */
export const sanitizeSkill = (skill) => {
  if (typeof skill === 'string') return skill;
  if (typeof skill === 'number') return String(skill);
  if (skill && typeof skill === 'object') {
    // If it's an object, try to extract a meaningful string
    if (skill.name) return String(skill.name);
    if (skill.skill) return String(skill.skill);
    return JSON.stringify(skill);
  }
  return String(skill || '');
};

/**
 * Filters and validates an array of careers
 */
export const filterValidCareers = (careers) => {
  if (!Array.isArray(careers)) return [];
  
  return careers
    .filter(career => isValidCareer(career))
    .map(career => ({
      ...career,
      // Ensure required_skills is an array of strings
      required_skills: Array.isArray(career.required_skills)
        ? career.required_skills.map(sanitizeSkill)
        : [],
      // Ensure matching_skills is an array of strings
      matching_skills: Array.isArray(career.matching_skills)
        ? career.matching_skills.map(sanitizeSkill)
        : [],
      // Ensure missing_skills is an array of strings
      missing_skills: Array.isArray(career.missing_skills)
        ? career.missing_skills.map(sanitizeSkill)
        : [],
      // Ensure similarity_score is a number
      similarity_score: isValidSimilarityScore(career.similarity_score)
        ? career.similarity_score
        : undefined
    }));
};

