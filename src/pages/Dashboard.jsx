import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlinePicture,
  AiOutlineFileText,
  AiOutlineAppstore,
  AiOutlineEye,
  AiOutlineHeart,
} from "react-icons/ai";
import { FiInbox, FiTrendingUp } from "react-icons/fi";

import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import StatsContainer from "../components/dashboard/stats/StatsContainer";
import CreationsContainer from "../components/dashboard/creations/CreationsContainer";
import CreationPreviewModal from "../components/modals/CreationPreviewModal";
import ActivitiesContainer from "../components/dashboard/activities/ActivitiesContainer";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { getCreations, incrementCreationView } from "../api/creations";
import { getUserRecentActivity, getUserStats } from "../api/user";

const formatCompactNumber = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0";

  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return `${num}`;
};

const formatPercentChange = (value) => {
  const num = Number(value || 0);
  if (!Number.isFinite(num)) return "0%";
  return `${num > 0 ? "+" : ""}${Math.round(num)}%`;
};

const formatRelativeTime = (value) => {
  const date = new Date(value);
  const diffMs = date.getTime() - Date.now();
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const minutes = Math.round(diffMs / (60 * 1000));
  if (Math.abs(minutes) < 60) return formatter.format(minutes, "minute");

  const hours = Math.round(diffMs / (60 * 60 * 1000));
  if (Math.abs(hours) < 24) return formatter.format(hours, "hour");

  const days = Math.round(diffMs / (24 * 60 * 60 * 1000));
  return formatter.format(days, "day");
};

const StatsCardsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {[1, 2, 3].map((item) => (
        <div
          key={item}
          className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-slate-700/50"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 rounded-xl bg-slate-700/50 animate-pulse"></div>
            <div className="text-right">
              <div className="h-6 w-16 bg-slate-700/50 rounded mb-2 animate-pulse"></div>
              <div className="h-4 w-10 bg-slate-700/50 rounded animate-pulse"></div>
            </div>
          </div>
          <div className="h-4 w-24 bg-slate-700/50 rounded animate-pulse"></div>
        </div>
      ))}
    </div>
  );
};

const CreationsSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden animate-pulse"
        >
          <div className="h-48 bg-slate-700/50"></div>
          <div className="p-4">
            <div className="h-5 bg-slate-700/50 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-slate-700/50 rounded w-full mb-2"></div>
            <div className="h-4 bg-slate-700/50 rounded w-2/3 mb-4"></div>
            <div className="flex justify-between items-center">
              <div className="h-3 bg-slate-700/50 rounded w-20"></div>
              <div className="h-8 bg-slate-700/50 rounded w-20"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const ActivitiesSkeleton = () => {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((item) => (
        <div
          key={item}
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl border border-slate-700/50 p-4 animate-pulse"
        >
          <div className="flex items-start space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-700/50"></div>
            <div className="flex-1">
              <div className="h-4 bg-slate-700/50 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-700/50 rounded w-1/4"></div>
            </div>
            <div className="h-3 bg-slate-700/50 rounded w-16"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

const EmptyCreations = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12 text-center min-h-[320px] flex flex-col items-center justify-center"
    >
      <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mb-4">
        <AiOutlinePicture className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No Creations Yet</h3>
      <p className="text-slate-400 max-w-md mb-6">
        Your locker is empty. Start creating amazing 360 content and it will appear here.
      </p>
      <Link
        to="/user/creations-locker"
        className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg font-medium hover:shadow-lg hover:shadow-orange-500/30 transition-all"
      >
        <AiOutlineFileText className="mr-2" />
        Go to Locker
      </Link>
    </motion.div>
  );
};

const EmptyActivities = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12 text-center min-h-[280px] flex flex-col items-center justify-center"
    >
      <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mb-4">
        <FiInbox className="w-8 h-8 text-slate-500" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">No Activity Yet</h3>
      <p className="text-slate-400 max-w-md">
        Your recent activity will appear here as you interact with the platform.
      </p>
    </motion.div>
  );
};

const Dashboard = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [statsLoading, setStatsLoading] = useState(true);
  const [statsData, setStatsData] = useState({
    totalCreations: 0,
    totalCreationsChange: 0,
    monthlyViews: 0,
    monthlyViewsChange: 0,
    engagementRate: 0,
    engagementRateChange: 0,
  });

  const [recentCreations, setRecentCreations] = useState([]);
  const [creationsLoading, setCreationsLoading] = useState(true);
  const [previewCreation, setPreviewCreation] = useState(null);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);

  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();

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
    const fetchStats = async () => {
      setStatsLoading(true);
      try {
        const response = await getUserStats();
        setStatsData(response?.data || {});
      } catch (error) {
        showAlert(error?.message || "Failed to load dashboard stats", {
          type: "error",
          duration: 5000,
        });
        setStatsData({
          totalCreations: 0,
          totalCreationsChange: 0,
          monthlyViews: 0,
          monthlyViewsChange: 0,
          engagementRate: 0,
          engagementRateChange: 0,
        });
      } finally {
        setStatsLoading(false);
      }
    };

    fetchStats();
  }, [showAlert]);

  useEffect(() => {
    const fetchRecentCreations = async () => {
      setCreationsLoading(true);
      try {
        const response = await getCreations({ scope: "locker", limit: 8 });
        setRecentCreations(response?.data || []);
      } catch (error) {
        setRecentCreations([]);
        showAlert(error?.message || "Failed to load recent creations", {
          type: "error",
          duration: 5000,
        });
      } finally {
        setCreationsLoading(false);
      }
    };

    fetchRecentCreations();
  }, [showAlert]);

  useEffect(() => {
    const fetchActivities = async () => {
      setActivitiesLoading(true);
      try {
        const response = await getUserRecentActivity({ limit: 10 });
        const mappedActivities = (response?.data || []).map((activity, index) => ({
          id: activity._id || `${activity.type}-${index}`,
          actorName: activity.actorName,
          action:
            activity.type === "creation_liked" ? "liked your creation" : "viewed your creation",
          target: activity.creationTitle,
          time: formatRelativeTime(activity.createdAt),
          type: activity.type,
          color: activity.type === "creation_liked" ? "text-red-500" : "text-emerald-400",
          icon: activity.type === "creation_liked" ? AiOutlineHeart : AiOutlineEye,
        }));
        setActivities(mappedActivities);
      } catch (error) {
        setActivities([]);
        showAlert(error?.message || "Failed to load recent activities", {
          type: "error",
          duration: 5000,
        });
      } finally {
        setActivitiesLoading(false);
      }
    };

    fetchActivities();
  }, [showAlert]);

  const openCreationLink = async (creation) => {
    const targetUrl = creation?.contentUrl || creation?.url || creation?.thumbnail;

    if (!targetUrl) {
      showAlert("No external link configured for this creation yet.", {
        type: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await incrementCreationView(creation._id);
      const updatedCreation = response?.data;

      if (updatedCreation) {
        setRecentCreations((prev) =>
          prev.map((item) => (item._id === creation._id ? { ...item, ...updatedCreation } : item))
        );
        setPreviewCreation((prev) =>
          prev && prev._id === creation._id ? { ...prev, ...updatedCreation } : prev
        );
      }
    } catch {
      // Opening the creation is the primary action; do not block it on view tracking failure.
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const handleCreationPreview = (creation) => {
    setPreviewCreation(creation);
  };

  const statsCards = useMemo(
    () => [
      {
        title: "Total Creations",
        value: formatCompactNumber(statsData.totalCreations),
        change: formatPercentChange(statsData.totalCreationsChange),
        icon: AiOutlineAppstore,
        gradient: "from-blue-500 to-cyan-600",
      },
      {
        title: "Monthly Views",
        value: formatCompactNumber(statsData.monthlyViews),
        change: formatPercentChange(statsData.monthlyViewsChange),
        icon: AiOutlineEye,
        gradient: "from-emerald-500 to-teal-600",
      },
      {
        title: "Engagement Rate",
        value: `${Number(statsData.engagementRate || 0).toFixed(2)}%`,
        change: formatPercentChange(statsData.engagementRateChange),
        icon: FiTrendingUp,
        gradient: "from-orange-500 to-red-600",
      },
    ],
    [statsData]
  );

  const filteredRecentCreations = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return recentCreations;

    return recentCreations.filter((creation) => {
      const tagsText = Array.isArray(creation.tags) ? creation.tags.join(" ") : "";
      return (
        String(creation.title || "").toLowerCase().includes(query) ||
        String(creation.description || "").toLowerCase().includes(query) ||
        String(creation.hostingPlatform || "").toLowerCase().includes(query) ||
        tagsText.toLowerCase().includes(query)
      );
    });
  }, [recentCreations, searchQuery]);

  const filteredActivities = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) return activities;

    return activities.filter((activity) => {
        return (
        String(activity.actorName || "").toLowerCase().includes(query) ||
        String(activity.action || "").toLowerCase().includes(query) ||
        String(activity.target || "").toLowerCase().includes(query) ||
        String(activity.time || "").toLowerCase().includes(query)
      );
    });
  }, [activities, searchQuery]);

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
        customItems={null}
      />

      <div
        className={`transition-all duration-300 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
        }`}
      >
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          {statsLoading ? <StatsCardsSkeleton /> : <StatsContainer statsCards={statsCards} />}

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center space-x-2">
                <h2 className="text-xl md:text-2xl font-bold text-white">Your Recent Creations</h2>
                {creationsLoading && <span className="text-xs text-slate-400 animate-pulse">(Loading...)</span>}
              </div>
              {!creationsLoading && filteredRecentCreations.length > 0 && (
                <Link
                  to="/user/creations-locker"
                  className="text-orange-500 hover:text-orange-400 font-medium text-sm md:text-base transition-colors"
                >
                  View All
                </Link>
              )}
            </motion.div>

            {creationsLoading && <CreationsSkeleton />}
            {!creationsLoading && filteredRecentCreations.length === 0 && (searchQuery.trim() ? (<div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center text-slate-300">No creations match "{searchQuery}".</div>) : <EmptyCreations />)}
            {!creationsLoading && filteredRecentCreations.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
                <CreationsContainer creations={filteredRecentCreations} onPreview={handleCreationPreview} />
              </motion.div>
            )}
          </div>

          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center justify-between mb-6"
            >
              <div className="flex items-center space-x-2">
                <h2 className="text-xl md:text-2xl font-bold text-white">Recent Activity</h2>
                {activitiesLoading && <span className="text-xs text-slate-400 animate-pulse">(Loading...)</span>}
              </div>
              {!activitiesLoading && filteredActivities.length > 0 && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="text-orange-500 hover:text-orange-400 font-medium text-sm md:text-base transition-colors"
                >
                  View All
                </motion.button>
              )}
            </motion.div>

            {activitiesLoading && <ActivitiesSkeleton />}
            {!activitiesLoading && filteredActivities.length === 0 && (searchQuery.trim() ? (<div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 text-center text-slate-300">No activity matches "{searchQuery}".</div>) : <EmptyActivities />)}
            {!activitiesLoading && filteredActivities.length > 0 && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                <ActivitiesContainer activities={filteredActivities} />
              </motion.div>
            )}
          </div>
        </div>
      </div>

      <CreationPreviewModal
        creation={previewCreation}
        onClose={() => setPreviewCreation(null)}
        onView={openCreationLink}
      />
    </div>
  );
};

export default Dashboard;



