import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  AiOutlineMenu, 
  AiOutlineClose, 
  AiOutlineQuestionCircle,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineSearch
} from "react-icons/ai";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import { useAuth } from "../context/AuthContext";
import FAQModal from "../components/modals/FAQModal";
import { getAllFAQs, createFaq, updateFaq, deleteFaq } from "../api/faq";
import { useAlert } from "../context/AlertContext";

const AdminSupport = () => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [modalState, setModalState] = useState({
    show: false,
    mode: "create",
    faq: null
  });
  const [faqs, setFaqs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = useMemo(() => [
    { id: "all", name: "All Categories" },
    { id: "general", name: "General" },
    { id: "uploading", name: "Uploading" },
    { id: "technical", name: "Technical" },
    { id: "sharing", name: "Sharing" },
    { id: "account", name: "Account" },
    { id: "billing", name: "Billing" },
    { id: "other", name: "Other" },
  ], []);

  const filteredFaqs = useMemo(() => {
    if (!faqs.length) return [];
    
    return faqs.filter(faq => {
      const matchesSearch = 
        faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        faq.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        categoryFilter === "all" || 
        faq.category === categoryFilter;
      
      return matchesSearch && matchesCategory;
    });
  }, [faqs, searchQuery, categoryFilter]);

  const fetchFaqs = useCallback(async () => {
      setIsLoading(true);
      try {
        const response = await getAllFAQs();
        setFaqs(response.data);
      } catch (error) {
        console.error("Error fetching FAQs:", error);
        showAlert("Failed to load FAQs. Please try again later.", {
          type: "error"
        });
      } finally {
        setIsLoading(false);
      }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

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

  const handleEdit = (faq) => {
    setModalState({
      show: true,
      mode: "edit",
      faq: faq
    });
    return;
  };

  const handleCreate = () => {
    setModalState({
      show: true,
      mode: "create",
      faq: null
    });
    return;
  };

  const handleSave = async (faqData) => {
    try {
      if (modalState.mode === "create") {
        const response = await createFaq(faqData);
        setFaqs(prev => [...prev, response.data]);
        showAlert("FAQ created successfully!",{
          type: "success",
          duration: 5000
        });
      } else {
        const response = await updateFaq(faqData._id, faqData);
        setFaqs(prev => prev.map(item => item.id === faqData.id ? response.data : item));
        showAlert("FAQ updated successfully!", {
          type: "success",
        });
      }
    } catch (error) {
      console.error(`Error ${modalState.mode === "create" ? "creating" : "updating"} FAQ:`, error);
      showAlert(`Failed to ${modalState.mode === "create" ? "create" : "update"} FAQ. Please try again later.`, {
        type: "error",
      });
    }
    setModalState({ show: false, mode: "create", faq: null });
  };

  const handleDelete = async (id) => {
    try {
      await deleteFaq(id);
      setFaqs(prev => prev.filter(item => item.id !== id));
      showAlert("FAQ deleted successfully!", {
        type: "success",
      });
    } catch (error) {
      console.error("Error deleting FAQ:", error);
      showAlert("Failed to delete FAQ. Please try again later.", {
        type: "error",
      });
    }
  };

  const handleDeleteButtonClick = (faqId) => {
    showAlert('Confirm you want to delete this FAQ', {
      type: 'warning',
      actionText: 'Delete',
      onAction: () => handleDelete(faqId),
      duration: 5000,
      position: 'top-center'
    });
  };

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
        {/* Header */}
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search FAQs..."
        />

        {/* Support Content */}
        <div className="p-4 md:p-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                <AiOutlineQuestionCircle className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                FAQ Management
              </h1>
            </div>
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl font-medium"
            >
              <AiOutlinePlus className="w-5 h-5" />
              <span>New FAQ</span>
            </motion.button>
          </motion.div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setCategoryFilter(category.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  categoryFilter === category.id
                    ? "bg-gradient-to-r from-amber-500 to-yellow-600 text-white"
                    : "bg-slate-700/50 text-slate-300 hover:bg-slate-700/70"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* FAQ List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 md:p-8"
          >
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                Manage FAQs
              </h2>
              <p className="text-slate-400">
                {isLoading ? "Loading..." : `${filteredFaqs.length} ${filteredFaqs.length === 1 ? 'entry' : 'entries'} found`}
              </p>
            </div>

            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
              </div>
            ) : filteredFaqs.length > 0 ? (
              <div className="space-y-4">
                {filteredFaqs.map((faq) => (
                  <motion.div
                    key={faq._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-4 md:p-5 hover:border-slate-600 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-bold text-white mb-1">{faq.question}</h3>
                        <p className="text-slate-400 text-sm mb-2">{faq.answer}</p>
                        <div className="flex items-center space-x-3">
                          <span className="bg-slate-700/50 text-amber-400 px-2 py-1 rounded text-xs">
                            {categories.find(c => c.id === faq.category)?.name || faq.category}
                          </span>
                          <span className="text-xs text-slate-500">
                            Last updated: {new Date(faq.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(faq)}
                          className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Edit"
                        >
                          <AiOutlineEdit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteButtonClick(faq._id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <AiOutlineDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <AiOutlineSearch className="w-12 h-12 text-slate-500 mb-4" />
                <h3 className="text-lg font-medium text-white mb-2">
                  No FAQs found
                </h3>
                <p className="text-slate-400 max-w-md">
                  {searchQuery || categoryFilter !== "all" 
                    ? "Try different search terms or clear filters" 
                    : "Create your first FAQ to get started"}
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* FAQ Modal */}
      {modalState.show && (
        <FAQModal
          mode={modalState.mode}
          faq={modalState.faq}
          categories={categories.filter(c => c.id !== "all")}
          onClose={() => setModalState({ show: false, mode: "create", faq: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminSupport;