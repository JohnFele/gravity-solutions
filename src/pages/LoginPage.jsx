import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaEnvelope, FaLock, FaGoogle, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';
import AuthLoading from '../components/auth/AuthLoading';
import { AuthFormWrapper } from '../components/auth/AuthFormWrapper';
import { useAlert } from '../context/AlertContext';
import { useAuth } from '../context/AuthContext';
import authHandler from '../utils/authHandler';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

const LoginPage = () => {
  const { login, googleLogin, user, authReady, navigateByRole } = useAuth();
  const { showAlert } = useAlert();

  async function handleGoogleCredential(response) {
    if (!response?.credential) {
      setIsGoogleLoading(false);
      return;
    }

    let shouldUnlockGoogleButton = true;

    try {
      setIsGoogleLoading(true);

      const result = await googleLogin(response.credential);

      if (result.success) {
        shouldUnlockGoogleButton = false;
        return;
      }

      showAlert(result.message || 'Google sign-in failed. Please try again.', {
        type: 'error',
        duration: 5000,
      });
    } catch (error) {
      console.error('Google login failed:', error);
      showAlert('Google sign-in failed. Please try again later.', {
        type: 'error',
        duration: 5000,
      });
    } finally {
      if (shouldUnlockGoogleButton) {
        setIsGoogleLoading(false);
      }
    }
  }

  const { setIsGoogleLoading, isGoogleInitialized, isGoogleLoading, triggerGoogleLogin } = useGoogleAuth({
    autoPrompt: true,
    context: 'signin',
    onCredential: handleGoogleCredential,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: '',
  });
  const isGoogleButtonDisabled = !isGoogleInitialized || isGoogleLoading || isLoading;
  const isGoogleButtonPending = !isGoogleInitialized || isGoogleLoading;

  useEffect(() => {
    if (authReady && user) {
      navigateByRole(user);
    }
  }, [authReady, user, navigateByRole]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name] || errors.general) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
        general: '',
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      const success = await authHandler({
        formData,
        action: login,
        setErrors,
      });

      if (success) {
        showAlert('Login successful.', {
          type: 'success',
          duration: 3000,
        });
      }
    } catch (error) {
      console.error('Login failed:', error);
      showAlert('Login failed. Try again later.', {
        type: 'error',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGooglePromptFailure = () => {
    setIsGoogleLoading(false);
    showAlert('Google sign-in was cancelled or could not start. Please try again.', {
      type: 'error',
      duration: 5000,
    });
  };

  const handleGoogleLogin = () => {
    if (isGoogleButtonDisabled) {
      return;
    }

    setIsGoogleLoading(true);

    const success = triggerGoogleLogin(handleGooglePromptFailure);

    if (!success) {
      setIsGoogleLoading(false);
      showAlert('Google sign-in is not ready yet. Please try again later.', {
        type: 'error',
        duration: 5000,
      });
    }
  };

  return (
    <AuthFormWrapper title="Welcome Back" subtitle="Sign in to your account">
      {(isLoading || isGoogleLoading) && <AuthLoading />}

      <div className="p-8 pt-4">
        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 rounded-lg border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errors.general}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-white/80 text-sm mb-2" htmlFor="email">
              Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="text-primary" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-3 bg-white/5 border ${errors.email ? 'border-red-400' : 'border-white/10'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                placeholder="Enter your email"
              />
            </div>
            {errors.email && <p className="mt-1 text-red-400 text-xs">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-white/80 text-sm mb-2" htmlFor="password">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-primary" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-3 bg-white/5 border ${errors.password ? 'border-red-400' : 'border-white/10'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash className="text-primary" /> : <FaEye className="text-primary" />}
              </button>
            </div>
            {errors.password && <p className="mt-1 text-red-400 text-xs">{errors.password}</p>}
          </div>

          <div className="mb-4 text-right">
            <Link to="/forgot-password" className="text-primary text-sm hover:underline">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-[#f57123cc] text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-primary/30 hover:cursor-pointer transition-all duration-300"
          >
            Sign In
          </button>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="mx-4 text-white/50 text-sm">OR</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isGoogleButtonDisabled}
            aria-disabled={isGoogleButtonDisabled}
            aria-busy={isGoogleButtonPending}
            tabIndex={isGoogleButtonDisabled ? -1 : 0}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
              isGoogleButtonPending
                ? 'bg-slate-200/10 text-slate-300 border border-slate-600/60 shadow-none cursor-not-allowed pointer-events-none'
                : isLoading
                  ? 'bg-slate-200/10 text-slate-300 border border-slate-600/60 shadow-none cursor-not-allowed pointer-events-none'
                  : 'bg-white text-gray-800 shadow-lg hover:shadow-white/30 hover:cursor-pointer'
            }`}
          >
            {isGoogleButtonPending ? (
              <FaSpinner className="animate-spin text-slate-300" />
            ) : (
              <FaGoogle className="text-red-500" />
            )}
            {!isGoogleInitialized ? 'Google is loading...' : isGoogleLoading ? 'Signing in with Google...' : 'Sign in with Google'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-white/70 text-sm">
            Don&apos;t have an account?{' '}
            <Link to="/auth/register" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </AuthFormWrapper>
  );
};

export default LoginPage;
