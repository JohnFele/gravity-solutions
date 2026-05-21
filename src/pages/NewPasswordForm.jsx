import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { FaLock, FaEye, FaEyeSlash, FaCheck } from 'react-icons/fa'
import { AuthFormWrapper } from '../components/auth/AuthFormWrapper'
import AuthLoading from '../components/auth/AuthLoading'
import { resetPassword } from '../api/auth'
import { validatePassword } from '../utils/validators'
// import authHandler from '../utils/authHandler'

const NewPasswordForm = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
    email: location.state?.email || '',
    otp: location.state?.otp || ''
  })
  const [errors, setErrors] = useState({
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    e.preventDefault()
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validatePasswordField = () => {
    let isValid = true
    
    if (!validatePassword(formData.password)) {
      setErrors(prev => ({ ...prev, password: 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character' }))
      isValid = false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: 'Passwords do not match' }))
      isValid = false
    }
    
    return isValid
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validatePasswordField()) return
    
    setIsLoading(true)
    const success = await resetPassword(formData)

    setIsLoading(false)

    if (success) {
      navigate('/auth/login', { state: { passwordResetSuccess: true } });
    }
  }

  return (
    <AuthFormWrapper 
      title="New Password" 
      subtitle="Create a new password for your account"
    >
      {/* New password form */}
      {isLoading && <AuthLoading />}
      <div className="p-8 pt-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-white/80 text-sm mb-2" htmlFor="password">
              New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-primary" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-3 bg-white/5 border ${errors.password ? 'border-red-400' : 'border-white/10'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                placeholder="Enter new password"
                autoFocus
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
          
          <div className="mb-6">
            <label className="block text-white/80 text-sm mb-2" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-primary" />
              </div>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-10 py-3 bg-white/5 border ${errors.confirmPassword ? 'border-red-400' : 'border-white/10'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                placeholder="Confirm new password"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:cursor-pointer"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <FaEyeSlash className="text-primary" />
                ) : (
                  <FaEye className="text-primary" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="mt-1 text-red-400 text-xs">{errors.confirmPassword}</p>}
            {!errors.confirmPassword && formData.confirmPassword && formData.password === formData.confirmPassword && (
              <p className="mt-1 text-emerald-400 text-xs flex items-center">
                <FaCheck className="mr-1" /> Passwords match
              </p>
            )}
          </div>
          
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-[#f57123cc] text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-primary/30 hover:cursor-pointer transition-all duration-300"
            >
              Reset Password
            </motion.button>
          </div>
        </form>
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

export default NewPasswordForm



