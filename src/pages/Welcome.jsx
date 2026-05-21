// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { FaArrowRight, FaCrown, FaLock, FaImage, FaVideo } from 'react-icons/fa';
import { Md360 } from 'react-icons/md';
import { AiOutlineDashboard, AiOutlineTrophy } from 'react-icons/ai';
import logo from '../assets/img/U.png';

const WelcomePage = ({ isAuthenticated }) => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <AiOutlineDashboard className="w-6 h-6" />,
      title: "Full Dashboard Access",
      pro: true
    },
    {
      icon: <FaImage className="w-5 h-5" />,
      title: "Unlimited Gallery Uploads",
      pro: true
    },
    {
      icon: <FaVideo className="w-5 h-5" />,
      title: "HD 360° Video Support",
      pro: true
    },
    {
      icon: <AiOutlineTrophy className="w-6 h-6" />,
      title: "Exclusive Challenges",
      pro: true
    },
    {
      icon: <Md360 className="w-5 h-5" />,
      title: "Advanced Creation Tools",
      pro: true
    }
  ];

  const freeTier = [
    {
      name: "Basic Gallery",
      description: "Get access to up to 5 creations"
    },
    {
      name: "Community Access",
      description: "Browse public creations",
    },
    {
      name: "Creations Locker",
      description: "Upload up to 5 creations to your locker",
    },

  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden max-w-4xl w-full"
      >
        {/* Hero Section */}
        <div className="bg-gradient-to-r from-orange-500/20 to-red-600/20 p-8 md:p-12 text-center border-b border-slate-700/50">
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center text-white p-4 rounded-xl"
          >
            {/* <FaCrown className="w-8 h-8" /> */}
            <img src={logo} alt="Ulinker Logo" className="w-30" />
          </motion.div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Unlock the Full Ulinker Experience
          </h1>
          <p className="text-slate-300 max-w-2xl mx-auto">
            Your free account gives you a taste of what's possible. Upgrade to Pro Ulinker for unlimited access to all features and content.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Features List */}
            <div>
              <h2 className="text-xl font-bold text-white mb-6 flex items-center">
                <FaLock className="text-orange-500 mr-3" />
                Pro Features
              </h2>
              
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start space-x-3"
                  >
                    <span className={`flex-shrink-0 mt-1 ${feature.pro ? 'text-orange-500' : 'text-slate-400'}`}>
                      {feature.icon}
                    </span>
                    <span className={`${feature.pro ? 'text-white' : 'text-slate-400'}`}>
                      {feature.title}
                    </span>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Upgrade Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-700/50 border border-slate-700/50 rounded-xl p-6"
            >
              <h3 className="text-xl font-bold text-white mb-4">Pro Plan</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">R99</span>
                <span className="text-slate-400">/month</span>
              </div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-center text-slate-300">
                  <FaCrown className="text-orange-500 mr-3" />
                  All premium features unlocked
                </li>
                <li className="flex items-center text-slate-300">
                  <FaCrown className="text-orange-500 mr-3" />
                  Priority support
                </li>
                <li className="flex items-center text-slate-300">
                  <FaCrown className="text-orange-500 mr-3" />
                  Cancel anytime
                </li>
              </ul>

              {isAuthenticated ? (
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/user/profile')}
                  className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-orange-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  <span>Upgrade to Pro</span>
                  <FaArrowRight />
                </motion.button>
              ) : (
                <div className="space-y-3">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => navigate('/auth/register')}
                    className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 px-4 rounded-lg font-medium shadow-lg hover:shadow-orange-500/30 transition-all"
                  >
                    Sign Up for Pro
                  </motion.button>
                  <div className="text-center text-slate-400 text-sm">
                    Already have an account?{' '}
                    <Link to="/auth/login" className="text-orange-400 hover:underline">
                      Log In
                    </Link>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Free Tier Features */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-12 border-t border-slate-700/50 pt-8"
          >
            <h2 className="text-xl font-bold text-white mb-6">Your Free Account Includes</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {freeTier.map((feature, index) => (
                <div
                  key={index}
                  className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50 hover:border-1 hover:border-orange-500"
                >
                  <h3 className="text-white font-medium mb-2">{feature.name}</h3>
                  <p className="text-slate-400 text-sm">{feature.description}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="bg-white/5 p-4 border-t border-slate-700/50">
          <p className="text-center text-white/50 text-xs">
            © {new Date().getFullYear()} Ulink 360 Creations. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomePage;
