import { useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheckCircle, 
  FaExclamationTriangle, 
  FaInfoCircle, 
  FaTimes,
  FaExclamationCircle
} from 'react-icons/fa';

const Alert = ({ 
  message, 
  type = 'info', 
  onClose, 
  actionText, 
  onAction,
  position = 'top-right',
  duration = 5000,
  showClose = true,
  title
}) => {
  // Auto-dismiss after duration if onClose is provided
  useEffect(() => {
    if (onClose && duration) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [onClose, duration]);

  const alertConfig = {
    info: {
      icon: <FaInfoCircle className="h-5 w-5" />,
      bg: 'bg-blue-500/90 backdrop-blur-md',
      border: 'border-blue-600/30',
      text: 'text-blue-50',
      accent: 'bg-blue-400',
      titleColor: 'text-white'
    },
    success: {
      icon: <FaCheckCircle className="h-5 w-5" />,
      bg: 'bg-emerald-500/90 backdrop-blur-md',
      border: 'border-emerald-600/30',
      text: 'text-emerald-50',
      accent: 'bg-emerald-400',
      titleColor: 'text-white'
    },
    warning: {
      icon: <FaExclamationTriangle className="h-5 w-5" />,
      bg: 'bg-amber-500/90 backdrop-blur-md',
      border: 'border-amber-600/30',
      text: 'text-amber-50',
      accent: 'bg-amber-400',
      titleColor: 'text-white'
    },
    error: {
      icon: <FaExclamationCircle className="h-5 w-5" />,
      bg: 'bg-red-500/90 backdrop-blur-md',
      border: 'border-red-600/30',
      text: 'text-red-50',
      accent: 'bg-red-400',
      titleColor: 'text-white'
    }
  };

  const positionClasses = {
    'top-right': 'top-4 right-4 sm:right-6',
    'top-left': 'top-4 left-4 sm:left-6',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4 sm:right-6',
    'bottom-left': 'bottom-4 left-4 sm:left-6',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const config = alertConfig[type] || alertConfig.info;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: position.includes('bottom') ? 20 : -20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: position.includes('bottom') ? 20 : -20, scale: 0.95, transition: { duration: 0.2 } }}
        className={`fixed ${positionClasses[position]} z-[9999] w-full max-w-xs sm:max-w-sm px-4`}
      >
        <div className={`${config.bg} ${config.border} border rounded-xl shadow-xl overflow-hidden backdrop-blur-lg`}>
          {/* Accent bar */}
          <div className={`h-1 ${config.accent}`}></div>
          
          <div className="p-4">
            <div className="flex items-start">
              <div className={`flex-shrink-0 ${config.text} mt-0.5`}>
                {config.icon}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                {title && (
                  <h3 className={`text-sm font-semibold ${config.titleColor} mb-1`}>
                    {title}
                  </h3>
                )}
                <p className={`text-sm ${config.text}`}>
                  {message}
                </p>
              </div>
              {showClose && onClose && (
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    onClick={onClose}
                    className={`inline-flex rounded-full p-1 ${config.text} hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50 transition-colors`}
                  >
                    <FaTimes className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
            {onAction && actionText && (
              <div className="mt-3 flex justify-end space-x-3">
                {showClose && onClose && (
                  <button
                    onClick={onClose}
                    className={`text-xs font-medium px-3 py-1 rounded-lg ${config.text} hover:bg-white/10 transition-colors`}
                  >
                    Dismiss
                  </button>
                )}
                <button
                  onClick={() => {
                    onAction();
                    onClose?.();
                  }}
                  className={`text-xs font-medium px-3 py-1 rounded-lg bg-white/20 ${config.text} hover:bg-white/30 transition-colors`}
                >
                  {actionText}
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Alert;