import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion'
import { FaShieldAlt, FaArrowLeft } from 'react-icons/fa'
import { AuthFormWrapper } from '../components/auth/AuthFormWrapper'
import AuthLoading from '../components/auth/AuthLoading'
import { verifyPasswordResetOTP, requestPasswordReset } from '../api/auth'
import { validateOTP } from '../utils/validators'
import { useAlert } from '../context/AlertContext'

const ResetPasswordOTP = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const { showAlert } = useAlert();
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    otp: '',
    email: location.state?.email || ''
  })
  const [errors, setErrors] = useState({
    otp: ''
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
    const errors = {}
    let isValid = true

    if (!formData.otp){
      errors.otp = "OTP is required";
      isValid = false;
    } else if (!validateOTP(formData.otp)) {
      errors.otp = "Please enter a valid OTP";
      isValid = false;
    }

    if (!isValid) {
      setErrors(errors);
      return false;
    }

    setIsLoading(true)
    try {
      const success = await verifyPasswordResetOTP(formData);

      setIsLoading(false)

      if (success) {
        navigate('/new-password', { state: { email: formData.email, otp: formData.otp } });
      }
    } catch (error) {
      setIsLoading(false)
      console.error('Error verifying OTP:', error);
      showAlert('Invalid OTP', { 
        type: 'error', 
        duration: 5000 
      });
    }
  }
  

  const handleResendOTP = async (e) => {
    e.preventDefault();
    try {
      await requestPasswordReset(formData);
      showAlert('Reset code sent successfully!', {
        type: 'success',
        duration: 5000
      })
    } catch (error) {
      console.error('Error resending OTP:', error);
      showAlert('Error resending OTP', {
        type: 'error',
        duration: 5000
      })
    }
  }

  return (
    <AuthFormWrapper 
      title="Verify OTP" 
      subtitle="Enter the 6-digit code sent to your email"
    >
      {/* OTP verification form */}
      {isLoading && <AuthLoading />}
      <div className="p-8 pt-4">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-white/80 text-sm mb-2" htmlFor="otp">
              Verification Code
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaShieldAlt className="text-primary" />
              </div>
              <input
                id="otp"
                name="otp"
                type="text"
                value={formData.otp}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-3 bg-white/5 border ${errors.otp ? 'border-red-400' : 'border-white/10'} rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all`}
                placeholder="Enter 6-digit code"
                maxLength="6"
                autoFocus
              />
            </div>
            {errors.otp && <p className="mt-1 text-red-400 text-xs">{errors.otp}</p>}
            <p className="mt-2 text-xs text-white/60">
              Didn't receive a code?  
              <button 
              className="text-primary hover:underline ml-1 hover:cursor-pointer"
              onClick={handleResendOTP}
              >
              Resend</button>
            </p>
          </div>
          
          <div className="mb-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full bg-gradient-to-r from-primary to-[#f57123cc] text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-primary/30 hover:cursor-pointer transition-all duration-300"
            >
              Verify Code
            </motion.button>
          </div>
          
          <div className="text-center">
            <button 
              onClick={() => navigate(-1)}
              className="text-white/70 hover:text-primary text-sm inline-flex items-center"
            >
              <FaArrowLeft className="mr-1" />
              Back to Email Entry
            </button>
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

export default ResetPasswordOTP
