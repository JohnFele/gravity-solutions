import {
  validateName,
  validateUserName,
  validateEmail,
  validatePassword,
} from "./validators";

/**
 * Validates form data for both signup and signin forms.
 * @param {Object} formData - The form data object.
 * @param {string} type - "signup" or "signin"
 * @returns {{ isValid: boolean, errors: Object }}
 */
const validateForm = (formData, type = "signin") => {
  let isValid = true;
  const errors = {};

  if (!formData || typeof formData !== "object") {
    throw new Error("Invalid form data");
  }

  if (!type || (type !== "signup" && type !== "signin")) {
    throw new Error("Invalid form type. Use 'signup' or 'signin'.");
  }

  // Email
  if (!formData.email) {
    errors.email = "Email is required";
    isValid = false;
  } else if (!validateEmail(formData.email)) {
    errors.email = "Please enter a valid email";
    isValid = false;
  }

  // Password
  if (!formData.password) {
    errors.password = "Password is required";
    isValid = false;
  } else if (type === "signup" && !validatePassword(formData.password)) {
    errors.password =
      "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
    isValid = false;
  }

  if (type === "signup") {
    // First Name
    if (!formData.firstName) {
      errors.firstName = "First name is required";
      isValid = false;
    } else if (!validateName(formData.firstName)) {
      errors.firstName = "First name must be at least 2 characters";
      isValid = false;
    }

    // Last Name
    if (!formData.lastName) {
      errors.lastName = "Last name is required";
      isValid = false;
    } else if (!validateName(formData.lastName)) {
      errors.lastName = "Last name must be at least 2 characters";
      isValid = false;
    }

    // Username
    if (!formData.userName) {
      errors.userName = "Username is required";
      isValid = false;
    } else if (!validateUserName(formData.userName)) {
      errors.userName =
        "Username must be at least 3 characters and contain only letters, numbers, and underscores";
      isValid = false;
    }

    // Confirm Password
    if (!formData.confirmPassword) {
      errors.confirmPassword = "Please confirm your password";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
      isValid = false;
    }
  }

  return { isValid, errors };
};

export default validateForm;
