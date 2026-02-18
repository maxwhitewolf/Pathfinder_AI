// Utility function to extract error message from FastAPI error response
export const extractErrorMessage = (error) => {
  if (!error) return 'An error occurred';
  
  // If error is a string, return it
  if (typeof error === 'string') return error;
  
  // If error is an object with a detail property
  if (error.detail) {
    // If detail is an array (FastAPI validation errors)
    if (Array.isArray(error.detail)) {
      // Extract messages from validation errors
      return error.detail
        .map(err => {
          // Handle both object and string error formats
          if (typeof err === 'string') return err;
          if (typeof err === 'object' && err !== null) {
            const field = err.loc && Array.isArray(err.loc) ? err.loc.slice(1).join('.') : (err.loc || 'field');
            const msg = err.msg || err.message || 'Invalid value';
            return `${field}: ${msg}`;
          }
          return String(err);
        })
        .filter(msg => msg && msg.trim())
        .join(', ') || 'Validation error occurred';
    }
    // If detail is a string
    if (typeof error.detail === 'string') {
      return error.detail;
    }
    // If detail is an object, try to stringify it safely
    if (typeof error.detail === 'object' && error.detail !== null) {
      if (error.detail.message) return String(error.detail.message);
      if (error.detail.msg) return String(error.detail.msg);
      return 'An error occurred';
    }
  }
  
  // If error has a message property
  if (error.message) return String(error.message);
  
  // If error is an object, try to convert it to a string safely
  if (typeof error === 'object' && error !== null) {
    try {
      // Try to extract meaningful information
      if (error.msg) return String(error.msg);
      if (error.type && error.msg) return `${error.type}: ${error.msg}`;
      // Last resort: return a generic message
      return 'An error occurred';
    } catch (e) {
      return 'An error occurred';
    }
  }
  
  // Default fallback - ensure we always return a string
  return String(error) || 'An error occurred';
};

// Helper to extract error from axios error response
export const getErrorFromResponse = (error, defaultMessage = 'An error occurred') => {
  try {
    if (error?.response?.data) {
      const errorMsg = extractErrorMessage(error.response.data);
      // Ensure we always return a string
      return typeof errorMsg === 'string' ? errorMsg : String(errorMsg) || defaultMessage;
    }
    if (error?.message) {
      return String(error.message);
    }
    if (error && typeof error === 'object') {
      // Try to extract any meaningful error information
      const errorMsg = extractErrorMessage(error);
      return typeof errorMsg === 'string' ? errorMsg : String(errorMsg) || defaultMessage;
    }
    return defaultMessage;
  } catch (e) {
    // If anything goes wrong, return the default message
    console.error('Error extracting error message:', e);
    return defaultMessage;
  }
};

