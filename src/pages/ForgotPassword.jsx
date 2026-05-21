import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { FaEnvelope, FaArrowLeft } from 'react-icons/fa'
import { AuthFormWrapper } from '../components/auth/AuthFormWrapper'
import AuthLoading from '../components/auth/AuthLoading'
import { requestPasswordReset } from '../api/auth'
import { validateEmail } from '../utils/validators'
import { useAlert } from '../context/AlertContext'

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const { showAlert } = useAlert()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: ''
  })
  const [errors, setErrors] = useState({
    email: ''
  })

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
    let isValid = true
    const errors = {}

    if (!formData.email) {
      errors.email = "Email is required";
      isValid = false;
    } else if (!validateEmail(formData.email)) {
      errors.email = "Please enter a valid email";
      isValid = false;
    }

    if (!isValid) {
    setErrors(errors);
    return false;
    }

    setIsLoading(true)
    try {
      const success = await requestPasswordReset(formData);

      setIsLoading(false)

      if (success) {
        navigate('/reset-password-otp', { state: { email: formData.email } });
        showAlert('Reset code sent successfully!', {
          type: 'success',
          duration: 5000
        })
      }
    } catch (error) {
      setIsLoading(false);
      console.error('Error sending reset code:', error);
      showAlert('Error sending code. Try again later.', {
        type: 'error',
        duration: 5000
      })
    }
  }

  return (
    <AuthFormWrapper 
      title="Reset Password" 
      subtitle="Enter your email to receive a reset code"
    >
      {/* Forgot password form */}
      {isLoading && <AuthLoading />}
      <div className="p-8 pt-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-white/80 text-sm mb-2" htmlFor="email">
              Email Address
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
                placeholder="Enter your registered email"
                autoFocus
              />
            </div>
            {errors.email && <p className="mt-1 text-red-400 text-xs">{errors.email}</p>}
          </div>
          
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-[#f57123cc] text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-primary/30 hover:cursor-pointer transition-all duration-300"
            >
              Send Reset Code
            </motion.button>
          </div>
          
          <div className="text-center">
            <Link 
              to="/auth/login" 
              className="text-white/70 hover:text-primary text-sm inline-flex items-center"
            >
              <FaArrowLeft className="mr-1" />
              Back to Sign In
            </Link>
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

export default ForgotPasswordPage
