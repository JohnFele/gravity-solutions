// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaSearch } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const { profileData: user } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden max-w-md w-full"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-600 p-6 text-center">
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="text-8xl font-bold text-white mb-2"
          >
            404
          </motion.div>
          <h1 className="text-2xl font-bold text-white">Page Not Found</h1>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex justify-center mb-6"
          >
            <svg
              width="160"
              height="160"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <motion.path
                d="M50 100C50 73.4903 71.4903 52 98 52C124.51 52 146 73.4903 146 100C146 126.51 124.51 148 98 148C71.4903 148 50 126.51 50 100Z"
                stroke="#F97316"
                strokeWidth="8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5 }}
                fill="none"
              />
              <motion.path
                d="M80 80L120 120"
                stroke="#EF4444"
                strokeWidth="8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
              <motion.path
                d="M120 80L80 120"
                stroke="#EF4444"
                strokeWidth="8"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1, delay: 0.7 }}
              />
              <motion.circle
                cx="150"
                cy="60"
                r="10"
                fill="#F97316"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, delay: 1.2 }}
              />
            </svg>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-300 text-center mb-8"
          >
            Oops! The page you're looking for doesn't exist or has been moved.
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link
                to={user?.role === 'Admin' ? '/admin/dashboard' : '/user/dashboard'}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
              >
                <FaHome />
                <span>Go Home</span>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Link
                to={user?.role === 'Admin' ? '/admin/dashboard' : '/user/dashboard'}
                className="flex items-center justify-center space-x-2 bg-slate-700/50 hover:bg-slate-700/70 text-white py-3 px-4 rounded-lg font-medium border border-slate-700/50 transition-all"
              >
                <FaSearch />
                <span>Explore Content</span>
              </Link>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-6 text-center"
          >
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-slate-400 hover:text-orange-400 text-sm transition-colors"
            >
              <FaArrowLeft className="mr-2" />
              <span>Return to previous page</span>
            </button>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-white/5 p-4 border-t border-slate-700/50">
          <p className="text-center text-white/50 text-xs">
            © {new Date().getFullYear()} ULink 360 Creations
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default NotFoundPage;