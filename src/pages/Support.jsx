import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  AiOutlineMenu, 
  AiOutlineClose, 
  AiOutlineQuestionCircle, 
  AiOutlineSearch,
  AiOutlineDown,
  AiOutlineUp
} from "react-icons/ai";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import FAQItem from "../components/support/FAQItem";
import { useAuth } from "../context/AuthContext";
// eslint-disable-next-line no-unused-vars
import { getAllFAQs, getFaqById } from "../api/faq";
import { useAlert } from "../context/AlertContext";
import ContactSupportModal from "../components/modals/ContactSupportModal";

const Support = () => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [faqs, setFaqs] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [expandedCategories, setExpandedCategories] = useState({});
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Categories with icons and colors
  const categories = useMemo(() => {
    return [
      { id: "all", name: "All FAQs", icon: "📋", color: "bg-purple-500" },
      { id: "general", name: "General", icon: "🌟", color: "bg-pink-500" },
      { id: "account", name: "Account", icon: "👤", color: "bg-blue-500" },
      { id: "uploading", name: "Uploading", icon: "📤", color: "bg-green-500" },
      { id: "technical", name: "Technical", icon: "🛠️", color: "bg-amber-500" },
      { id: "sharing", name: "Sharing", icon: "↗️", color: "bg-indigo-500" },
      { id: "billing", name: "Billing", icon: "💳", color: "bg-emerald-500" },
      { id: "other", name: "Other", icon: "❓", color: "bg-gray-500" },
    ];
  }, []);

  const handleGetAllFAQs = useCallback(async () => {
    try {
      const response = await getAllFAQs();
      setFaqs(response.data);
      return response.data;
    } catch (error) {
      showAlert({
        type: "error",
        message: error.response?.message || "Failed to fetch FAQs"
      });
      throw error.response?.data || error;
    }
  }, [showAlert]);

  useEffect(() => {
    handleGetAllFAQs();
  }, [handleGetAllFAQs]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const initialExpandedState = {};
    categories.forEach(cat => {
      initialExpandedState[cat.id] = true;
    });
    setExpandedCategories(initialExpandedState);
  }, [categories]);
  
  const filteredFaqs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return faqs.filter((faq) => {
      const matchesCategory = activeCategory === "all" || faq.category === activeCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return (
        String(faq.question || "").toLowerCase().includes(normalizedQuery) ||
        String(faq.answer || "").toLowerCase().includes(normalizedQuery)
      );
    });
  }, [activeCategory, faqs, searchQuery]);

  const filteredCategoryFaqsMap = useMemo(() => {
    const faqsByCategory = {};

    categories.forEach((category) => {
      if (category.id === "all") {
        return;
      }

      faqsByCategory[category.id] = filteredFaqs.filter((faq) => faq.category === category.id);
    });

    return faqsByCategory;
  }, [categories, filteredFaqs]);

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // const handleGetFaqById = async (faqId) => {
  //   try {
  //     const response = await getFaqById(faqId);
  //     return response.data;
  //   } catch (error) {
  //     showAlert({
  //       type: "error",
  //       message: error.response?.message || "Failed to fetch FAQ"
  //     });
  //     throw error.response?.data || error;
  //   }
  // };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-2 right-4 z-50 md:hidden bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl text-white shadow-lg"
        >
          {mobileMenuOpen ? (
            <AiOutlineClose size={20} />
          ) : (
            <AiOutlineMenu size={20} />
          )}
        </motion.button>
      )}

      {/* Sidebar */}
      <Sidebar
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        userRole={user?.role}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
        }`}
      >
        {/* Custom Header with FAQ Search */}
        <motion.header
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 p-4 md:p-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
            <div className="flex items-center space-x-6">
              <h1 className="text-xl md:text-2xl font-bold text-white flex items-center">
                <AiOutlineQuestionCircle className="mr-3 text-amber-400" />
                Support Center
              </h1>
            </div>

            <div className="relative flex-1 lg:flex-none max-w-xl">
              <AiOutlineSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-xl pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent w-full"
              />
            </div>
          </div>
        </motion.header>

        {/* FAQ Content */}
        <div className="p-4 md:p-6">
          {/* Category Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeCategory === category.id
                      ? `${category.color} text-white`
                      : "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70"
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.name}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 md:p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                {activeCategory === "all" 
                  ? "All Frequently Asked Questions" 
                  : `${categories.find(c => c.id === activeCategory)?.name} FAQs`}
              </h2>
              <p className="text-slate-400">
                {`${filteredFaqs.length} ${filteredFaqs.length === 1 ? 'result' : 'results'} found`}
              </p>
            </div>

            {activeCategory === "all" ? (
              filteredFaqs.length > 0 ? (
                <div className="space-y-6">
                  {categories.filter(c => c.id !== "all").map((category) => {
                    const categoryFAQs = filteredCategoryFaqsMap[category.id] || [];
                    
                    if (categoryFAQs.length === 0) return null;
                    
                    return (
                      <div key={category.id} className="space-y-3">
                        <button
                          onClick={() => toggleCategory(category.id)}
                          className="flex items-center justify-between w-full text-left mb-2"
                        >
                          <div className="flex items-center">
                            <span className={`${category.color} text-white p-2 rounded-lg mr-3`}>
                              {category.icon}
                            </span>
                            <h3 className="text-lg font-bold text-white">
                              {category.name} ({categoryFAQs.length})
                            </h3>
                          </div>
                          {expandedCategories[category.id] ? (
                            <AiOutlineUp className="text-slate-400" />
                          ) : (
                            <AiOutlineDown className="text-slate-400" />
                          )}
                        </button>
                        
                        {expandedCategories[category.id] && (
                          <div className="space-y-3 pl-4 border-l-2 border-slate-700/50">
                            {categoryFAQs.map((faq) => (
                              <FAQItem 
                                key={faq.id}
                                question={faq.question}
                                answer={faq.answer}
                              />
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-12 text-center"
                >
                  <AiOutlineSearch className="w-12 h-12 text-slate-500 mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    No results found
                  </h3>
                  <p className="text-slate-400 max-w-md">
                    Try different search terms or browse another support category.
                  </p>
                </motion.div>
              )
            ) : (
              <div className="space-y-3">
                {filteredFaqs.length > 0 ? (
                  filteredFaqs.map((faq) => (
                    <FAQItem 
                      key={faq.id}
                      question={faq.question}
                      answer={faq.answer}
                    />
                  ))
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-12 text-center"
                  >
                    <AiOutlineSearch className="w-12 h-12 text-slate-500 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">
                      No results found
                    </h3>
                    <p className="text-slate-400 max-w-md">
                      Try different search terms or check our documentation for more help
                    </p>
                  </motion.div>
                )}
              </div>
            )}
          </motion.div>

          {/* Contact Support Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-2xl border border-amber-500/20 p-6 md:p-8 mt-6"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white mb-2">
                  Still need help?
                </h3>
                <p className="text-amber-100">
                  Our support team is available 24/7 to assist you
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsContactModalOpen(true)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-medium whitespace-nowrap cursor-pointer"
              >
                Contact Support
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
      <ContactSupportModal 
        isOpen={isContactModalOpen} 
        onClose={() => setIsContactModalOpen(false)} 
      />
    </div>
  );
};

export default Support;
