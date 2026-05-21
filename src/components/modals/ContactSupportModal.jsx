import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { 
  AiOutlineClose, 
  AiOutlineMail, 
  AiOutlinePhone, 
  AiOutlineMessage,
  AiOutlineCheckCircle,
  AiOutlineExclamationCircle
} from "react-icons/ai";
import { sendContactForm } from "../../api/faq";
import { useAuth } from "../../context/AuthContext";
import { useAlert } from "../../context/AlertContext";

const ContactSupportModal = ({ isOpen, onClose }) => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    urgency: "normal"
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    subject: false,
    message: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      name: prev.name || [user.firstName, user.lastName].filter(Boolean).join(" ").trim(),
      email: prev.email || user.email || "",
    }));
  }, [isOpen, user]);

  // Validation rules
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        return value.trim() === "" ? "Name is required" : "";
      case "email":
        if (value.trim() === "") return "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return "Invalid email format";
        return "";
      case "subject":
        return value.trim() === "" ? "Subject is required" : "";
      case "message":
        return value.trim() === "" ? "Message is required" : 
               value.length < 20 ? "Message should be at least 20 characters" : "";
      default:
        return "";
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {
      name: validateField("name", formData.name),
      email: validateField("email", formData.email),
      subject: validateField("subject", formData.subject),
      message: validateField("message", formData.message)
    };
    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== "");
  };

  // Validate on blur
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Real-time validation after first touch
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      name: true,
      email: true,
      subject: true,
      message: true
    });

    if (!validateForm()) return;

    setIsSubmitting(true);
    
    try {
      await sendContactForm(formData);
      setSubmitSuccess(true);
      showAlert("Support request sent. Check your email for confirmation.", {
        type: "success",
        duration: 4000,
      });
      setTimeout(() => {
        onClose();
        setFormData({
          name: "",
          email: "",
          subject: "",
          message: "",
          urgency: "normal"
        });
        setTouched({
          name: false,
          email: false,
          subject: false,
          message: false
        });
        setSubmitSuccess(false);
      }, 2000);
    } catch (error) {
      showAlert(error?.message || "Failed to send support request", {
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm overflow-hidden"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-slate-800 rounded-2xl border border-slate-700/50 w-full max-w-md mx-4 overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          aria-label="Close contact form"
        >
          <AiOutlineClose size={20} />
        </button>

        <div className="p-6">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
              <AiOutlineMessage className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">Contact Support</h2>
          </div>

          {submitSuccess ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center py-8 text-center"
            >
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mb-4">
                <AiOutlineCheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">
                Message Sent Successfully!
              </h3>
              <p className="text-slate-400">
                Our team will get back to you within 24 hours.
              </p>
            </motion.div>
          ) : (
            <>
              <div className="mb-6">
                <div className="flex flex-wrap gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <AiOutlineMail className="w-4 h-4" />
                    <span>info@ulink.co.za</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <AiOutlinePhone className="w-4 h-4" />
                    <span>+27 (11) 465-5973</span>
                  </div>
                </div>
                <p className="text-slate-400 text-sm">
                  Fill out the form below and our support team will get back to you as soon as possible.
                </p>
              </div>

              <form onSubmit={handleSubmit} noValidate>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                      Your Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                          errors.name && touched.name
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-600 focus:ring-amber-500 focus:border-transparent"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.name && touched.name && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <AiOutlineExclamationCircle className="text-red-500 w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {errors.name && touched.name && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-xs mt-1"
                        >
                          {errors.name}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                          errors.email && touched.email
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-600 focus:ring-amber-500 focus:border-transparent"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.email && touched.email && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <AiOutlineExclamationCircle className="text-red-500 w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {errors.email && touched.email && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-xs mt-1"
                        >
                          {errors.email}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-1">
                      Subject
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                          errors.subject && touched.subject
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-600 focus:ring-amber-500 focus:border-transparent"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.subject && touched.subject && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                          >
                            <AiOutlineExclamationCircle className="text-red-500 w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {errors.subject && touched.subject && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-xs mt-1"
                        >
                          {errors.subject}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div>
                    <label htmlFor="urgency" className="block text-sm font-medium text-slate-300 mb-1">
                      Urgency
                    </label>
                    <select
                      id="urgency"
                      name="urgency"
                      value={formData.urgency}
                      onChange={handleChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-slate-300 mb-1">
                      Message
                    </label>
                    <div className="relative">
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        rows={4}
                        className={`w-full bg-slate-700/50 border rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 ${
                          errors.message && touched.message
                            ? "border-red-500 focus:ring-red-500"
                            : "border-slate-600 focus:ring-amber-500 focus:border-transparent"
                        }`}
                      />
                      <AnimatePresence>
                        {errors.message && touched.message && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -5 }}
                            className="absolute right-3 top-4"
                          >
                            <AiOutlineExclamationCircle className="text-red-500 w-5 h-5" />
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                    <AnimatePresence>
                      {errors.message && touched.message && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-red-400 text-xs mt-1"
                        >
                          {errors.message}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="pt-2">
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={isSubmitting}
                      className={`w-full py-3 rounded-xl font-medium text-white ${
                        isSubmitting
                          ? "bg-slate-600 cursor-not-allowed"
                          : "bg-gradient-to-r from-amber-500 to-yellow-600"
                      }`}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Sending...
                        </span>
                      ) : "Send Message"}
                    </motion.button>
                  </div>
                </div>
              </form>
            </>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContactSupportModal;
