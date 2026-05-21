import validateForm from './validateForm';

const authHandler = async ({ formData, action, setErrors }) => {
  const type = formData?.confirmPassword !== undefined ? 'signup' : 'signin';

  const { isValid, errors } = validateForm(formData, type);

  if (!isValid) {
    setErrors((prev) => ({
      ...prev,
      ...errors,
      general: '',
    }));
    return false;
  }

  setErrors((prev) => ({
    ...prev,
    general: '',
  }));

  const response = await action(formData);

  if (!response?.success) {
    const error = response?.error ?? response ?? {};
    const status = error?.statusCode ?? error?.status;
    const message = response?.message ?? error?.message ?? 'An error occurred';
    const code = error?.code;

    console.error('Error in authHandler:', { status, message, code });

    switch (code) {
      case 'INVALID_CREDENTIALS':
        setErrors((prev) => ({ ...prev, general: message }));
        break;
      case 'EMAIL_ALREADY_EXISTS':
        setErrors((prev) => ({ ...prev, email: message, general: '' }));
        break;
      case 'USERNAME_ALREADY_EXISTS':
        setErrors((prev) => ({ ...prev, userName: message, general: '' }));
        break;
      default:
        switch (status) {
          case 409:
            setErrors((prev) => ({ ...prev, general: message }));
            break;
          case 401:
            setErrors((prev) => ({ ...prev, general: message }));
            break;
          default:
            setErrors((prev) => ({ ...prev, general: message }));
        }
    }

    return false;
  }

  return true;
};

export default authHandler;
