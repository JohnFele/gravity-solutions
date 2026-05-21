// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { AiOutlineLoading3Quarters, AiOutlineShoppingCart } from 'react-icons/ai';

const QuotationLoader = ({ message = "Processing your request..." }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 max-w-md w-full text-center"
      >
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center"
        >
          <AiOutlineShoppingCart className="w-8 h-8 text-white" />
        </motion.div>

        <h2 className="text-xl font-bold text-white mb-2">Generating Your Quote</h2>
        <p className="text-slate-400 mb-6">{message}</p>

        <div className="flex justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <AiOutlineLoading3Quarters className="w-6 h-6 text-emerald-400" />
          </motion.div>
        </div>

        <p className="text-xs text-slate-500 mt-6">
          This will only take a moment...
        </p>
      </motion.div>
    </div>
  );
};

export default QuotationLoader;