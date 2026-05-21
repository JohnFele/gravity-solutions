// Validates email format (RFC 5322 compliant basic version)
export const validateEmail = (email) => {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return pattern.test(String(email).toLowerCase());
};

// Password policy: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
export const validatePassword = (password) => {
  const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
  return pattern.test(password);
};

// Validates userNames (min 3 characters, letters, numbers, underscores only)
export const validateUserName = (username) => {
  const pattern = /^[a-zA-Z0-9_]{3,}$/;
  return pattern.test(username);
};

// Validates names (min 2 characters with letters only)
export const validateName = (name) => {
  const pattern = /^[a-zA-Z]{2,}$/;
  return pattern.test(name);
};

// Validates OTP (6 digits only)
export const validateOTP = (otp) => {
  const pattern = /^[0-9]{6}$/;
  return pattern.test(otp);
};
