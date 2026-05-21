import { useState, useEffect, useMemo } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { AiOutlineMenu, AiOutlineClose, AiOutlineTrophy, AiOutlineClockCircle } from "react-icons/ai";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import DataFetchLoader from "../components/dashboard/DataFetchLoader";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { getChallenges } from "../api/challenges";

const Competitions = () => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [isLoading, setIsLoading] = useState(true);
  const [challenges, setChallenges] = useState([]);

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
    const fetchChallenges = async () => {
      setIsLoading(true);
      try {
        const response = await getChallenges();
        setChallenges(response?.data || []);
      } catch (error) {
        showAlert(error?.message || "Failed to load competitions", {
          type: "error",
          duration: 5000,
        });
        setChallenges([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChallenges();
  }, [showAlert]);

  const filteredChallenges = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return challenges.filter((challenge) => {
      const statusMatch = activeTab === "all" ? true : challenge.status === activeTab;
      const searchMatch = !query
        ? true
        : String(challenge.title || "").toLowerCase().includes(query) ||
          String(challenge.description || "").toLowerCase().includes(query);

      return statusMatch && searchMatch;
    });
  }, [activeTab, challenges, searchQuery]);

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
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Search competitions" />

        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-white">
                <AiOutlineTrophy className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Competitions Hub</h1>
            </div>
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
          ) : filteredChallenges.length > 0 ? (
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
              {filteredChallenges.map((challenge) => (
                <motion.div
                  key={challenge._id}
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
                      src={challenge.thumbnail}
                      alt={challenge.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                    <div className="absolute top-4 right-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        challenge.status === "active"
                          ? "bg-green-500/20 text-green-400"
                          : challenge.status === "upcoming"
                            ? "bg-amber-500/20 text-amber-400"
                            : "bg-red-500/20 text-red-400"
                      }`}>
                        {challenge.status}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 md:p-5">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-2 line-clamp-2">{challenge.title}</h3>
                    <p className="text-slate-400 text-sm mb-4 line-clamp-2">{challenge.description}</p>

                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-slate-300">
                        <AiOutlineClockCircle className="w-4 h-4 text-amber-400 mr-2" />
                        Due: {new Date(challenge.dueDate).toLocaleDateString()}
                      </div>
                      <div className="text-slate-300">
                        Prize: <span className="text-amber-400">{challenge.prize}</span>
                      </div>
                      <div className="text-slate-300">
                        Participants: <span className="text-white">{challenge.participants || 0}</span>
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
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12 flex flex-col items-center justify-center text-center"
            >
              <div className="w-24 h-24 bg-slate-700/30 rounded-full flex items-center justify-center mb-6">
                <AiOutlineTrophy className="w-12 h-12 text-amber-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">No competitions found</h2>
              <p className="text-slate-400 max-w-md">No competitions are available for the selected filter right now.</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Competitions;
