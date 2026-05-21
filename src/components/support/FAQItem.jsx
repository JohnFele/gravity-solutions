import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

const FAQItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div 
      className="border border-slate-700/50 rounded-xl overflow-hidden mb-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full text-left p-4 md:p-5 flex justify-between items-center ${
          isOpen ? 'bg-slate-700/30' : 'bg-slate-800/50 hover:bg-slate-700/30'
        } transition-colors`}
        whileHover={{ x: 4 }}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
      >
        <h3 className="font-medium text-white text-sm md:text-base">{question}</h3>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-slate-400"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </motion.button>

      <motion.div
        id={`faq-answer-${question.replace(/\s+/g, '-').toLowerCase()}`}
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0
        }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="p-4 md:p-5 pt-0 text-slate-300 text-sm md:text-base">
          {answer}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default FAQItem;