import { useState, useEffect, useCallback } from "react";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineTrophy,
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineClockCircle,
} from "react-icons/ai";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import DataFetchLoader from "../components/dashboard/DataFetchLoader";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import CreateCompetitionModal from "../components/modals/CreateCompetitionModal";
import { getChallenges, createChallenge, updateChallenge, deleteChallenge } from "../api/challenges";

const AdminCompetitions = () => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [modalState, setModalState] = useState({
    show: false,
    mode: "create",
    competition: null,
  });
  const [competitions, setCompetitions] = useState([]);

  const loadChallenges = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getChallenges();
      setCompetitions(response?.data || []);
    } catch (error) {
      setCompetitions([]);
      showAlert(error?.message || "Failed to load competitions", {
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [showAlert]);

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
    loadChallenges();
  }, [loadChallenges]);

  const filteredCompetitions = competitions.filter((comp) => {
    const statusMatch = activeTab === "all" ? true : comp.status === activeTab;
    if (!searchQuery.trim()) return statusMatch;

    const query = searchQuery.toLowerCase();
    return (
      statusMatch &&
      (String(comp.title || "").toLowerCase().includes(query) ||
        String(comp.description || "").toLowerCase().includes(query))
    );
  });

  const handleEdit = (competition) => {
    setModalState({
      show: true,
      mode: "edit",
      competition,
    });
  };

  const handleCreate = () => {
    setModalState({
      show: true,
      mode: "create",
      competition: null,
    });
  };

  const handleSave = async (competitionData) => {
    try {
      const payload = { ...competitionData };
      delete payload.id;
      delete payload._id;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.createdBy;

      if (modalState.mode === "create") {
        await createChallenge(payload);
        showAlert("Competition created successfully", { type: "success", duration: 3000 });
      } else {
        const competitionId = modalState.competition?._id || competitionData._id || competitionData.id;
        await updateChallenge(competitionId, payload);
        showAlert("Competition updated successfully", { type: "success", duration: 3000 });
      }

      setModalState({ show: false, mode: "create", competition: null });
      await loadChallenges();
    } catch (error) {
      showAlert(error?.message || "Failed to save competition", {
        type: "error",
        duration: 5000,
      });
    }
  };

  const endCompetition = async (id) => {
    try {
      await updateChallenge(id, { status: "ended" });
      setCompetitions((prev) => prev.map((comp) => (comp._id === id ? { ...comp, status: "ended" } : comp)));
      showAlert("Competition ended", { type: "success", duration: 3000 });
    } catch (error) {
      showAlert(error?.message || "Failed to end competition", {
        type: "error",
        duration: 5000,
      });
    }
  };

  const removeCompetition = async (id) => {
    try {
      await deleteChallenge(id);
      setCompetitions((prev) => prev.filter((comp) => comp._id !== id));
      showAlert("Competition deleted", { type: "success", duration: 3000 });
    } catch (error) {
      showAlert(error?.message || "Failed to delete competition", {
        type: "error",
        duration: 5000,
      });
    }
  };

  const confirmEndCompetition = (competitionId) => {
    showAlert("Are you sure you want to end this competition?", {
      type: "warning",
      actionText: "End",
      onAction: () => endCompetition(competitionId),
      duration: 5000,
      position: "top-center",
    });
  };

  const confirmDeleteCompetition = (competitionId) => {
    showAlert("Are you sure you want to delete this competition?", {
      type: "warning",
      actionText: "Delete",
      onAction: () => removeCompetition(competitionId),
      duration: 5000,
      position: "top-center",
    });
  };

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
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Search competitions..." />

        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                <AiOutlineTrophy className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Competitions Management</h1>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl font-medium"
            >
              <AiOutlinePlus className="w-5 h-5" />
              <span>New Competition</span>
            </motion.button>
          </motion.div>

          <div className="flex border-b border-slate-700/50 mb-6">
            {["active", "upcoming", "ended", "all"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? "text-amber-500 border-b-2 border-amber-500"
                    : "text-slate-400 hover:text-slate-300"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <DataFetchLoader message="Loading competitions..." />
          ) : filteredCompetitions.length > 0 ? (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredCompetitions.map((competition) => (
                <motion.div
                  key={competition._id}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.5,
                        ease: "easeOut",
                      },
                    },
                  }}
                  className="group relative overflow-hidden bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={competition.thumbnail}
                      alt={competition.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 group-hover:bg-black/20 group-hover:opacity-60"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        competition.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : competition.status === "upcoming"
                            ? "bg-primary/20 text-primary"
                            : "bg-red-500/20 text-red-600"
                      }`}>
                        {competition.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 md:p-5">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg md:text-xl font-bold text-white line-clamp-2">{competition.title}</h3>
                    </div>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{competition.description}</p>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center text-sm">
                        <AiOutlineClockCircle className="w-4 h-4 text-amber-400 mr-2" />
                        <span className="text-slate-300">Due: {new Date(competition.dueDate).toLocaleDateString()}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-300">Prize: </span>
                        <span className="text-amber-400">{competition.prize}</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-slate-300">Entry Fee: </span>
                        <span className={competition.fee === "Free" ? "text-emerald-400" : "text-amber-400"}>
                          {competition.fee}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <span className="text-xs text-slate-400">{competition.participants || 0} participants</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(competition)}
                          className="text-xs bg-slate-700/50 hover:bg-blue-600/50 px-3 py-1 rounded-lg transition-colors flex items-center"
                        >
                          <AiOutlineEdit className="mr-1" /> Edit
                        </button>
                        {competition.status !== "ended" ? (
                          <button
                            onClick={() => confirmEndCompetition(competition._id)}
                            className="text-xs bg-slate-700/50 hover:bg-red-600/50 px-3 py-1 rounded-lg transition-colors flex items-center"
                          >
                            <AiOutlineDelete className="mr-1" /> End
                          </button>
                        ) : (
                          <button
                            onClick={() => confirmDeleteCompetition(competition._id)}
                            className="text-xs bg-slate-700/50 hover:bg-red-600/50 px-3 py-1 rounded-lg transition-colors flex items-center"
                          >
                            <AiOutlineDelete className="mr-1" /> Delete
                          </button>
                        )}
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
                <AiOutlineTrophy className="w-12 h-12 text-amber-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">No competitions found</h2>
              <p className="text-slate-400 max-w-md">
                {activeTab === "all"
                  ? "Create your first competition to get started"
                  : `There are currently no ${activeTab} competitions`}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {modalState.show && (
        <CreateCompetitionModal
          mode={modalState.mode}
          competition={modalState.competition}
          onClose={() => setModalState({ show: false, mode: "create", competition: null })}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default AdminCompetitions;
