// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { FaCheckCircle, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { AuthFormWrapper } from '../components/auth/AuthFormWrapper';
import { useAuth } from '../context/AuthContext';

const EmailVerifiedPage = () => {
  const { profileData: user } = useAuth();
  return (
    <AuthFormWrapper 
      title="Email Verified!" 
      subtitle="Your email has been successfully verified"
    >
      <div className="p-8 pt-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center text-center"
        >
          <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
            <FaCheckCircle className="w-12 h-12 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Verification Complete</h2>
          <p className="text-slate-400 mb-6">
            Thank you for verifying your email address. You now have full access to all features.
          </p>
          {user?.role ? (
            <Link
              to={user?.role === 'Admin' ? '/admin/dashboard' : '/user/dashboard'}
              className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Go to Dashboard <FaArrowRight className="ml-2" />
            </Link>
          ) : (
            <Link
              to="/auth/login"
              className="inline-flex items-center bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-6 py-3 rounded-lg font-medium"
            >
              Go to Login <FaArrowRight className="ml-2" />
            </Link>
          )}
        </motion.div>
      </div>
      
      <div className="bg-white/5 p-4">
        <p className="text-center text-white/50 text-xs">
          © {new Date().getFullYear()} 360 Creations. All rights reserved.
        </p>
      </div>
    </AuthFormWrapper>
  );
};

export default EmailVerifiedPage;
