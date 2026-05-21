// components/ui/GoogleAuthButton.jsx
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../../context/AuthContext';
import { useAlert } from '../../context/AlertContext';

const GoogleAuthButton = ({ onSuccess, onError }) => {
  const { googleLogin } = useAuth();
  const { showAlert } = useAlert();

  const handleSuccess = async (credentialResponse) => {
    try {
      const result = await googleLogin(credentialResponse.credential);

      // Disable auto-select after successful login
      if (window.google && window.google.accounts) {
        window.google.accounts.id.disableAutoSelect();
      }
      
      if (result.success) {
        showAlert('Google login successful!', { type: 'success' });
        onSuccess?.(result.user);
      }
    } catch (error) {
      showAlert('Google login failed', { type: 'error' });
      onError?.(error.message);

      // Cancel One Tap on error
      if (window.google && window.google.accounts) {
        window.google.accounts.id.cancel();
      }
    }
  };

  const handleError = () => {
    showAlert('Google login failed. Please try again.', { type: 'error' });
    onError?.('Google login failed');

    if (window.google && window.google.accounts) {
      window.google.accounts.id.cancel();
    }
  };

  return (
    <div className="w-full">
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={handleError}
        useOneTap={false} // Disable One Tap here since we handle it separately
        shape="pill"
        size="large"
        text="continue_with"
        locale="en"
        // width="100%"
      />
    </div>
  );
};

export default GoogleAuthButton;