import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { 
  AiOutlineClose, 
  AiOutlineQuestionCircle,
  AiOutlineCheckCircle
} from "react-icons/ai";
import { useScrollLock } from "../../hooks/useScrollLock";

const FAQModal = ({ mode, faq, categories, onClose, onSave }) => {
  useScrollLock(true);
  const [formData, setFormData] = useState(faq || {
    question: "",
    answer: "",
    category: "general"
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.question.trim() || !formData.answer.trim()) return;
    onSave(formData);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => { e.stopPropagation(); }}
      >
        <div className="sticky top-0 bg-slate-800/90 backdrop-blur-xl z-10 p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
              <AiOutlineQuestionCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === "edit" ? "Edit FAQ" : "Create New FAQ"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-700/50 transition-colors"
          >
            <AiOutlineClose className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Question</label>
            <input
              type="text"
              name="question"
              value={formData.question}
              onChange={handleChange}
              required
              className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="Enter the question users will see"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Answer</label>
            <textarea
              name="answer"
              value={formData.answer}
              onChange={handleChange}
              required
              rows={6}
              className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="Provide a detailed answer to the question"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white hover:opacity-90 transition-opacity flex items-center"
            >
              <AiOutlineCheckCircle className="mr-2" />
              {mode === "edit" ? "Save Changes" : "Create FAQ"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default FAQModal;