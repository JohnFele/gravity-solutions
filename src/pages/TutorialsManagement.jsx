import { useState, useEffect } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { 
  AiOutlineMenu, 
  AiOutlineClose, 
  AiOutlineBook,
  AiOutlineCheckCircle,
  AiOutlineEye,
  AiOutlineRead,
} from "react-icons/ai";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import PageFilterBar from "../components/dashboard/PageFilterBar";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { getAllTutorials } from "../api/tutorials";
import TutorialContentModal from "../components/modals/TutorialContentModal";

const Tutorials = () => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("delightex");
  const [sortBy, setSortBy] = useState("newest");
  const [tutorialModal, setTutorialModal] = useState({
    show: false,
    tutorial: null
  });

  const [tutorials, setTutorials] = useState([]);

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

  const fetchTutorials = async () => {
    try {
      const response = await getAllTutorials();
      const tutorialsData = response.data;
      setTutorials(tutorialsData);
    } catch (error) {
      console.error("Error fetching tutorials:", error);
      showAlert("Error fetching tutorials", { type: "error", duration: 5000 });
    }
  };

  useEffect(() => {
    fetchTutorials();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleOpenTutorial = (tutorial) => {
    setTutorialModal({
      show: true,
      tutorial
    });
  };

  const handleProgressSaved = (tutorialId, progress) => {
    setTutorials((items) =>
      items.map((item) =>
        (item._id || item.id) === tutorialId ? { ...item, progress } : item
      )
    );
  };

  const categories = [
    { id: "all", name: "All" },
    { id: "delightex", name: "DelightEX" },
    { id: "thinglink", name: "ThingLink" },
    { id: "getting-started", name: "Getting Started" },
    { id: "advanced", name: "Advanced" },
    { id: "equipment", name: "Equipment" },
    { id: "software", name: "Software" }
  ];

  const sortOptions = [
    { id: "newest", name: "Newest First" },
    { id: "oldest", name: "Oldest First" },
    { id: "most-viewed", name: "Most Viewed" },
    { id: "progress", name: "Progress" },
    { id: "title-asc", name: "Title A-Z" },
    { id: "title-desc", name: "Title Z-A" },
  ];

  const getProgressPercent = (tutorial) => {
    const stepsCount = tutorial.steps?.length || 0;
    const completedCount = tutorial.progress?.completedSteps?.length || 0;

    if (!stepsCount) {
      return tutorial.progress?.status === "completed" ? 100 : 0;
    }

    return Math.round((completedCount / stepsCount) * 100);
  };

  const searchedTutorials = tutorials
    .filter((tutorial) => {
      const matchesCategory = activeCategory === "all" ? true : tutorial.category === activeCategory;
      if (!matchesCategory) {
        return false;
      }

      const query = searchQuery.trim().toLowerCase();
      if (!query) {
        return true;
      }

      return (
        String(tutorial.title || "").toLowerCase().includes(query) ||
        String(tutorial.description || "").toLowerCase().includes(query) ||
        String(tutorial.category || "").toLowerCase().includes(query) ||
        String(tutorial.platform || "").toLowerCase().includes(query) ||
        String(tutorial.coreSkill || "").toLowerCase().includes(query)
      );
    })
    .sort((left, right) => {
      switch (sortBy) {
        case "oldest":
          return new Date(left.createdAt || 0) - new Date(right.createdAt || 0);
        case "most-viewed":
          return Number(right.views || 0) - Number(left.views || 0);
        case "progress":
          return getProgressPercent(right) - getProgressPercent(left);
        case "title-asc":
          return String(left.title || "").localeCompare(String(right.title || ""));
        case "title-desc":
          return String(right.title || "").localeCompare(String(left.title || ""));
        case "newest":
        default:
          return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      }
    });

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
        {/* Header with Custom Search Placeholder */}
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search tutorials..."
        />

        {/* Tutorials Content */}
        <div className="p-4 md:p-6">
          {/* Page Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <AiOutlineBook className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white">
                  DelightEX Tutorials
                </h1>
                <p className="text-sm text-slate-400 mt-1">
                  Progressive Python missions from the DelightEX handbook
                </p>
              </div>
            </div>
          </motion.div>

          <PageFilterBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortOptions={sortOptions}
            activeSort={sortBy}
            onSortChange={setSortBy}
          />

          {/* Tutorials Grid */}
          {searchedTutorials.length > 0 ? (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              // initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {searchedTutorials.map((tutorial) => (
                <motion.div
                  key={tutorial._id || tutorial.id}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.5,
                        ease: "easeOut"
                      }
                    }
                  }}
                  whileHover={{ y: -5 }}
                  className="group relative overflow-hidden bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 cursor-pointer"
                  onClick={() => handleOpenTutorial(tutorial)}
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
                      className={`absolute inset-0 bg-gradient-to-t ${tutorial.gradient || "from-blue-600 to-purple-700"} opacity-60`}
                    ></div>
                    <div className="absolute top-4 right-4">
                      <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium">
                        {tutorial.platform || tutorial.category}
                      </span>
                    </div>
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <AiOutlineBook className="w-12 h-12 text-white" />
                    </div>
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                      {tutorial.coreSkill || tutorial.duration || tutorial.type}
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
                        <span>{tutorial.progress?.status || "not-started"}</span>
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
                        {tutorial.progress?.status === "completed" ? (
                          <AiOutlineCheckCircle className="w-4 h-4 text-emerald-300" />
                        ) : (
                          <AiOutlineEye className="w-4 h-4" />
                        )}
                        <span className="text-xs">
                          {tutorial.steps?.length ? `${tutorial.steps.length} steps` : `${tutorial.views || 0} views`}
                        </span>
                      </div>
                      <button className="text-xs bg-slate-700/50 hover:bg-slate-600/50 px-3 py-1 rounded-lg transition-colors">
                        Open
                      </button>
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
                <AiOutlineBook className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                {searchQuery ? "No matching tutorials found" : "No Tutorials Available"}
              </h2>
              <p className="text-slate-400 max-w-md">
                {searchQuery 
                  ? `No tutorials match your search for "${searchQuery}"`
                  : "New tutorials will be added soon. Check back later!"}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 text-white rounded-lg transition-colors"
                >
                  Clear Search
                </button>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {tutorialModal.show && (
        <TutorialContentModal
          tutorial={tutorialModal.tutorial}
          onClose={() => setTutorialModal({ show: false, tutorial: null })}
          onProgressSaved={handleProgressSaved}
        />
      )}
    </div>
  );
};

export default Tutorials;
