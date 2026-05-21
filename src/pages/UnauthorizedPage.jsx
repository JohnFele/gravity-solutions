// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaHome, FaLock } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';

const UnauthorizedPage = () => {
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
        <div className="bg-gradient-to-r from-red-600 to-orange-600 p-8 text-center">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="w-24 h-24 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center"
          >
            <FaLock className="text-4xl text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">403</h1>
          <p className="text-orange-100">Access Forbidden</p>
        </div>

        {/* Content */}
        <div className="p-8 text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-slate-300 mb-6"
          >
            You don't have permission to access this page.
            {user && ` Your current role is ${user.role}.`}
          </motion.p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Link
                to={user?.role === 'Admin' ? '/admin/dashboard' : '/dashboard'}
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all"
              >
                <FaHome />
                <span>Home</span>
              </Link>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <button
                onClick={() => navigate(-1)}
                className="inline-flex items-center space-x-2 bg-slate-700/50 hover:bg-slate-700/70 text-white px-6 py-2 rounded-lg font-medium transition-all"
              >
                <FaArrowLeft />
                <span>Back</span>
              </button>
            </motion.div>
          </div>
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

export default UnauthorizedPage;