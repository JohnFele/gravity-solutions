import { useState } from 'react'
import { Link } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { FaUser, FaLock, FaEnvelope, FaGoogle, FaEye, FaEyeSlash, FaCheck, FaSpinner } from 'react-icons/fa'
import AuthLoading from '../components/auth/AuthLoading'
import { AuthFormWrapper } from '../components/auth/AuthFormWrapper'
import { useAlert } from '../context/AlertContext'
import { useAuth } from '../context/AuthContext'
import authHandler from '../utils/authHandler'
import { useGoogleAuth } from '../hooks/useGoogleAuth'

const SignupPage = () => {
  const { signup, googleLogin } = useAuth()
  const { showAlert } = useAlert()

  async function handleGoogleCredential(response) {
    if (!response?.credential) {
      setIsGoogleLoading(false)
      return
    }

    let shouldUnlockGoogleButton = true

    try {
      setIsGoogleLoading(true)

      const result = await googleLogin(response.credential)

      if (result.success) {
        shouldUnlockGoogleButton = false
        return
      }

      showAlert('Google sign-in failed. Please try again or use normal sign-in.', {
        type: 'error',
        duration: 5000,
      })
    } catch (error) {
      if (error.message.includes('CORS') || error.message.includes('network')) {
        showAlert('Network error. Please check your connection and try again later.', {
          type: 'error',
          duration: 5000
        })
      } else {
        showAlert('Google sign-in failed. Please try again later.', {
          type: 'error',
          duration: 5000
        })
      }
    } finally {
      if (shouldUnlockGoogleButton) {
        setIsGoogleLoading(false)
      }
    }
  }

  const { setIsGoogleLoading, isGoogleInitialized, isGoogleLoading, triggerGoogleLogin } = useGoogleAuth({
    autoPrompt: true,
    context: 'signup',
    onCredential: handleGoogleCredential,
  })

  const [showPassword, setShowPassword] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isGoogleHovered, setIsGoogleHovered] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [errors, setErrors] = useState({
    firstName: '',
    lastName: '',
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const isGoogleButtonDisabled = !isGoogleInitialized || isGoogleLoading || isLoading
  const isGoogleButtonPending = !isGoogleInitialized || isGoogleLoading

  const handleGooglePromptFailure = () => {
    setIsGoogleLoading(false)
    showAlert('Google sign-in was cancelled or could not start. Please try again.', {
      type: 'error',
      duration: 5000,
    })
  }

  const handleGoogleSignup = () => {
    if (isGoogleButtonDisabled) {
      return
    }

    setIsGoogleLoading(true)

    const success = triggerGoogleLogin(handleGooglePromptFailure)

    if (!success) {
      setIsGoogleLoading(false)
      showAlert('Google sign-in is not ready yet. Please try again later.', {
        type: 'error',
        duration: 5000
      })
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    e.preventDefault()

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsLoading(true)
      const success = await authHandler({
        formData,
        action: signup,
        setErrors,
      })

      setIsLoading(false)

      if (success) {
        showAlert('Signup successful.', {
          type: 'success',
          duration: 5000
        })
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Signup failed:', error)
      showAlert('Signup failed. Try again later.', {
        type: 'error',
        duration: 5000
      })
    }
  }

  return (
    <AuthFormWrapper title="Create Account" subtitle="Join our Ulinker 360 community">
      {/* Signup form */}
      {(isLoading || isGoogleLoading) && <AuthLoading />}
      <div className="p-8 pt-4">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-white/80 text-sm mb-2" htmlFor="firstName">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-primary text-sm" />
                </div>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-3 bg-white/5 border ${errors.firstName ? 'border-red-400' : 'border-white/10'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                  placeholder="First name"
                />
              </div>
              {errors.firstName && <p className="mt-1 text-red-400 text-xs">{errors.firstName}</p>}
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2" htmlFor="lastName">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-primary text-sm" />
                </div>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-3 bg-white/5 border ${errors.lastName ? 'border-red-400' : 'border-white/10'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                  placeholder="Last name"
                />
              </div>
              {errors.lastName && <p className="mt-1 text-red-400 text-xs">{errors.lastName}</p>}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-white/80 text-sm mb-2" htmlFor="username">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-primary" />
              </div>
              <input
                id="userName"
                name="userName"
                type="text"
                value={formData.userName}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-3 bg-white/5 border ${errors.userName ? 'border-red-400' : 'border-white/10'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                placeholder="Choose a username"
              />
            </div>
            {errors.userName && <p className="mt-1 text-red-400 text-xs">{errors.userName}</p>}
          </div>

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

          <div className="grid grid-cols-1 md:grid-cols-1 gap-4 mb-4">
            <div>
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
                  placeholder="Create password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center hover:cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="text-primary" />
                  ) : (
                    <FaEye className="text-primary" />
                  )}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-red-400 text-xs">{errors.password}</p>}
              <div className="mt-2 space-y-1">
                <p className={`text-xs flex items-center ${formData.password.length >= 8 ? 'text-emerald-400' : 'text-white/50'}`}>
                  <FaCheck className="mr-1" /> At least 8 characters
                </p>
                <p className={`text-xs flex items-center ${formData.password.match(/[A-Z]/) ? 'text-emerald-400' : 'text-white/50'}`}>
                  <FaCheck className="mr-1" /> Contains uppercase letter
                </p>
                <p className={`text-xs flex items-center ${formData.password.match(/[a-z]/) ? 'text-emerald-400' : 'text-white/50'}`}>
                  <FaCheck className="mr-1" /> Contains lowercase letter
                </p>
                <p className={`text-xs flex items-center ${formData.password.match(/\d/) ? 'text-emerald-400' : 'text-white/50'}`}>
                  <FaCheck className="mr-1" /> Contains at least one number
                </p>
                <p className={`text-xs flex items-center ${formData.password.match(/[@$!%*?&#]/) ? 'text-emerald-400' : 'text-white/50'}`}>
                  <FaCheck className="mr-1" /> Contains special character
                </p>
              </div>
            </div>

            <div>
              <label className="block text-white/80 text-sm mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="text-primary" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-10 py-3 bg-white/5 border ${errors.confirmPassword ? 'border-red-400' : 'border-white/10'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                  placeholder="Confirm password"
                />
              </div>
              {errors.confirmPassword && <p className="mt-1 text-red-400 text-xs">{errors.confirmPassword}</p>}
              {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
                <p className="mt-1 text-emerald-400 text-xs flex items-center">
                  <FaCheck className="mr-1" /> Passwords match
                </p>
              )}
            </div>
          </div>

          <div className="mb-4">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-[#f57123cc] text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-primary/30 hover:cursor-pointer transition-all duration-300 relative overflow-hidden"
            >
              <span className="relative z-10">Create Account</span>
              {isHovered && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 10, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute z-0 w-4 h-4 bg-white/30 rounded-full"
                />
              )}
            </motion.button>
          </div>

          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-white/20"></div>
            <span className="mx-4 text-white/50 text-sm">OR</span>
            <div className="flex-grow border-t border-white/20"></div>
          </div>

          <motion.button
            whileHover={isGoogleButtonDisabled ? undefined : { scale: 1.03 }}
            whileTap={isGoogleButtonDisabled ? undefined : { scale: 0.98 }}
            onHoverStart={() => setIsGoogleHovered(true)}
            onHoverEnd={() => setIsGoogleHovered(false)}
            type="button"
            onClick={handleGoogleSignup}
            disabled={isGoogleButtonDisabled}
            aria-disabled={isGoogleButtonDisabled}
            aria-busy={isGoogleButtonPending}
            tabIndex={isGoogleButtonDisabled ? -1 : 0}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 relative overflow-hidden flex items-center justify-center gap-2 ${
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
            <span className="relative z-10">
              {!isGoogleInitialized ? 'Google is loading...' : isGoogleLoading ? 'Signing in with Google...' : 'Sign up with Google'}
            </span>
            {!isGoogleButtonDisabled && isGoogleHovered && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 10, opacity: 0 }}
                transition={{ duration: 0.6 }}
                className="absolute z-0 w-4 h-4 bg-gray-200/30 rounded-full"
              />
            )}
          </motion.button>
        </form>

        <div className="mt-6 text-center">
          <div className="text-white/70 text-sm">
            Already have an account?{' '}
            <Link to="/auth/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white/5 p-4">
        <p className="text-center text-white/50 text-xs">
          © {new Date().getFullYear()} 360 Creations. All rights reserved.
        </p>
      </div>
    </AuthFormWrapper>
  )
}

export default SignupPage

