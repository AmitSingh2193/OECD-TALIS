
export const decodeBase64 = (encodedString: string): string => {
  try {
    // Handle both standard and URL-safe base64
    const base64 = encodedString
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Add padding if needed
    const pad = base64.length % 4;
    const paddedBase64 = pad > 0 
      ? base64 + '='.repeat(4 - pad)
      : base64;
    
    // Decode and return
    return decodeURIComponent(
      atob(paddedBase64)
        .split('')
        .map(char => '%' + ('00' + char.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch (error) {
    console.error('Error decoding base64 string:', error);
    throw new Error('Invalid base64 string');
  }
};

/**
 * Encodes a string to base64
 * @param str - The string to encode
 * @returns The base64 encoded string
 */
export const encodeBase64 = (str: string): string => {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, 
      (match, p1) => String.fromCharCode(parseInt(p1, 16))
    )
  );
};
