import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineBook,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineRead,
} from "react-icons/ai";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import PageFilterBar from "../components/dashboard/PageFilterBar";
import { useAuth } from "../context/AuthContext";
import TutorialModal from "../components/modals/TutorialModal";
import TutorialContentModal from "../components/modals/TutorialContentModal";
import {
  getAllTutorials,
  createTutorial,
  updateTutorial,
  deleteTutorial as deleteTutorialRequest,
} from "../api/tutorials";
import { useAlert } from "../context/AlertContext";

const AdminTutorials = () => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("delightex");
  const [sortBy, setSortBy] = useState("newest");
  const [modalState, setModalState] = useState({
    show: false,
    mode: "create",
    tutorial: null,
  });
  const [tutorialPreview, setTutorialPreview] = useState({
    show: false,
    tutorial: null,
  });
  const [tutorials, setTutorials] = useState([]);

  const fetchTutorials = useCallback(async () => {
    try {
      const response = await getAllTutorials();
      const tutorialsData = response.data.map((tutorial) => ({
        id: tutorial._id,
        ...tutorial,
      }));

      setTutorials(tutorialsData);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      showAlert("Error fetching tutorials", { type: "error", duration: 5000 });
    }
  }, [showAlert]);

  useEffect(() => {
    fetchTutorials();
  }, [fetchTutorials]);

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
    if (!tutorialPreview.show) {
      fetchTutorials();
    }
  }, [tutorialPreview.show, fetchTutorials]);

  const getProgressPercent = (tutorial) => {
    const stepsCount = tutorial.steps?.length || 0;
    const completedCount = tutorial.progress?.completedSteps?.length || 0;

    if (!stepsCount) {
      return tutorial.progress?.status === "completed" ? 100 : 0;
    }

    return Math.round((completedCount / stepsCount) * 100);
  };

  const filteredTutorials = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filteredItems = tutorials.filter((tutorial) => {
      const matchesCategory =
        activeCategory === "all" ? true : tutorial.category === activeCategory;

      if (!query) {
        return matchesCategory;
      }

      return (
        matchesCategory &&
        (
          String(tutorial.title || "").toLowerCase().includes(query) ||
          String(tutorial.description || "").toLowerCase().includes(query) ||
          String(tutorial.category || "").toLowerCase().includes(query) ||
          String(tutorial.platform || "").toLowerCase().includes(query) ||
          String(tutorial.coreSkill || "").toLowerCase().includes(query) ||
          String(tutorial.status || "").toLowerCase().includes(query) ||
          String(tutorial.duration || "").toLowerCase().includes(query)
        )
      );
    });

    return [...filteredItems].sort((left, right) => {
      switch (sortBy) {
        case "oldest":
          return new Date(left.createdAt || 0) - new Date(right.createdAt || 0);
        case "most-viewed":
          return Number(right.views || 0) - Number(left.views || 0);
        case "status":
          return String(left.status || "").localeCompare(String(right.status || ""));
        case "title-asc":
          return String(left.title || "").localeCompare(String(right.title || ""));
        case "title-desc":
          return String(right.title || "").localeCompare(String(left.title || ""));
        case "newest":
        default:
          return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      }
    });
  }, [activeCategory, searchQuery, sortBy, tutorials]);

  const handleOpenPreview = (tutorial) => {
    setTutorialPreview({
      show: true,
      tutorial,
    });
  };

  const handleProgressSaved = (tutorialId, progress) => {
    setTutorials((items) =>
      items.map((item) => (item.id === tutorialId ? { ...item, progress } : item))
    );
  };

  const handleEdit = (tutorial) => {
    setModalState({
      show: true,
      mode: "edit",
      tutorial,
    });
  };

  const handleCreate = () => {
    setModalState({
      show: true,
      mode: "create",
      tutorial: null,
    });
  };

  const handleSaveConfirmation = (tutorialData) => {
    showAlert(
      modalState.mode === "edit" ? "Save changes to this tutorial?" : "Create new tutorial?",
      {
        type: "warning",
        actionText: modalState.mode === "edit" ? "Save Changes" : "Create",
        onAction: () => handleSave(tutorialData),
        duration: 5000,
        position: "top-center",
      }
    );
  };

  const handleSave = async (tutorialData) => {
    try {
      if (modalState.mode === "create") {
        await createTutorial(tutorialData);
        showAlert("Tutorial created successfully", {
          type: "success",
          duration: 5000,
        });
      } else {
        await updateTutorial(modalState.tutorial.id, tutorialData);
        showAlert("Tutorial updated successfully", {
          type: "success",
          duration: 5000,
        });
      }

      fetchTutorials();
      setModalState({ show: false, mode: "create", tutorial: null });
    } catch (error) {
      console.error("Error saving tutorial:", error);
      showAlert("Error saving tutorial", {
        type: "error",
        duration: 5000,
      });
    }
  };

  const deleteTutorial = async (id) => {
    try {
      await deleteTutorialRequest(id);
      setTutorials((items) => items.filter((tutorial) => tutorial.id !== id));
      showAlert("Tutorial deleted successfully", {
        type: "success",
        duration: 5000,
      });
    } catch (error) {
      console.error("Error deleting tutorial:", error);
      showAlert("Error deleting tutorial", {
        type: "error",
        duration: 5000,
      });
    }
  };

  const confirmDeleteTutorial = (tutorialId) => {
    showAlert("Are you sure you want to delete this tutorial?", {
      type: "warning",
      actionText: "Delete",
      onAction: () => deleteTutorial(tutorialId),
      duration: 5000,
      position: "top-center",
    });
  };

  const categories = [
    { id: "all", name: "All" },
    { id: "delightex", name: "DelightEX" },
    { id: "thinglink", name: "ThingLink" },
    { id: "getting-started", name: "Getting Started" },
    { id: "advanced", name: "Advanced" },
    { id: "equipment", name: "Equipment" },
    { id: "software", name: "Software" },
  ];

  const sortOptions = [
    { id: "newest", name: "Newest First" },
    { id: "oldest", name: "Oldest First" },
    { id: "most-viewed", name: "Most Viewed" },
    { id: "status", name: "Status" },
    { id: "title-asc", name: "Title A-Z" },
    { id: "title-desc", name: "Title Z-A" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-2 right-4 z-50 md:hidden bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl text-white shadow-lg"
        >
          {mobileMenuOpen ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </motion.button>
      )}

      <Sidebar
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        userRole={user?.role}
      />

      <div
        className={`transition-all duration-300 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
        }`}
      >
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search tutorials..."
        />

        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950">
                <AiOutlineBook className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">
                Tutorials Management
              </h1>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 px-4 py-2 rounded-xl font-semibold"
            >
              <AiOutlinePlus className="w-5 h-5" />
              <span>New Tutorial</span>
            </motion.button>
          </motion.div>

          <PageFilterBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortOptions={sortOptions}
            activeSort={sortBy}
            onSortChange={setSortBy}
          />

          {filteredTutorials.length > 0 ? (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: { staggerChildren: 0.1 },
                },
              }}
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredTutorials.map((tutorial) => (
                <motion.div
                  key={tutorial.id}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: { duration: 0.5, ease: "easeOut" },
                    },
                  }}
                  className="group relative overflow-hidden bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50"
                  onClick={() => handleOpenPreview(tutorial)}
                >
                  <div className="relative h-48 overflow-hidden">
                    {tutorial.thumbnail ? (
                      <img
                        src={tutorial.thumbnail}
                        alt={tutorial.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-900 flex items-center justify-center">
                        <AiOutlineRead className="w-16 h-16 text-cyan-300" />
                      </div>
                    )}
                    <div
                      className={`absolute inset-0 bg-gradient-to-t ${
                        tutorial.gradient || "from-cyan-600 to-emerald-700"
                      } opacity-60`}
                    />
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          tutorial.status === "published"
                            ? "bg-green-500/20 text-green-300"
                            : "bg-amber-500/20 text-amber-300"
                        }`}
                      >
                        {tutorial.status}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <AiOutlineBook className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                      {tutorial.platform || tutorial.category}
                    </div>
                  </div>

                  <div className="p-4 md:p-5">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">
                      {tutorial.title}
                    </h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                      {tutorial.description}
                    </p>
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                        <span>{tutorial.type || "tutorial"}</span>
                        <span>{getProgressPercent(tutorial)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-slate-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400"
                          style={{ width: `${getProgressPercent(tutorial)}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-slate-400">
                      <div className="flex items-center space-x-1">
                        <AiOutlineEye className="w-4 h-4" />
                        <span className="text-xs">
                          {tutorial.steps?.length
                            ? `${tutorial.steps.length} steps`
                            : `${tutorial.views || 0} views`}
                        </span>
                      </div>
                      <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEdit(tutorial)}
                          className="text-xs bg-slate-700/50 hover:bg-blue-600/50 px-3 py-1 rounded-lg transition-colors flex items-center"
                        >
                          <AiOutlineEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => confirmDeleteTutorial(tutorial.id)}
                          className="text-xs bg-slate-700/50 hover:bg-red-600/50 px-3 py-1 rounded-lg transition-colors flex items-center"
                        >
                          <AiOutlineDelete className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <div className="w-24 h-24 bg-slate-700/30 rounded-full flex items-center justify-center mb-6">
                <AiOutlineBook className="w-12 h-12 text-cyan-300" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                No Tutorials Found
              </h2>
              <p className="text-slate-400 max-w-md">
                {activeCategory === "all"
                  ? "Create your first tutorial to get started"
                  : `There are no tutorials in ${
                      categories.find((category) => category.id === activeCategory)?.name
                    } category`}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {modalState.show && (
        <TutorialModal
          mode={modalState.mode}
          tutorial={modalState.tutorial}
          onClose={() => setModalState({ show: false, mode: "create", tutorial: null })}
          onSave={handleSaveConfirmation}
        />
      )}

      {tutorialPreview.show && (
        <TutorialContentModal
          tutorial={tutorialPreview.tutorial}
          onClose={() => setTutorialPreview({ show: false, tutorial: null })}
          onProgressSaved={handleProgressSaved}
        />
      )}
    </div>
  );
};

export default AdminTutorials;
