import { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaSpinner } from 'react-icons/fa';

const AuthLoading = () => {
  const [showDelayedMessage, setShowDelayedMessage] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowDelayedMessage(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-lg z-50 flex items-center justify-center">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full mx-4"
      >
        <div className="flex flex-col items-center justify-center space-y-6">
          {/* Logo or icon */}
          <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
            <svg 
              width="32" 
              height="32" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="text-white"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4l3 3" />
            </svg>
          </div>
          
          {/* Loading text */}
          <h2 className="text-xl font-bold text-white text-center">
            Preparing your experience
          </h2>
          <p className="text-slate-400 text-center">
            {showDelayedMessage
              ? "Still verifying... This is taking longer than expected. Please wait."
              : "Just a moment while we verify your details..."}
          </p>
          
          {/* Animated spinner */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="text-orange-500"
          >
            <FaSpinner className="w-8 h-8" />
          </motion.div>
          
          {/* Progress bar */}
          <div className="w-full bg-slate-700/50 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 2, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-orange-500 to-red-600 rounded-full"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthLoading;
