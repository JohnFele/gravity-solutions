import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AiOutlineMenu, 
  AiOutlineClose,
  AiOutlineUser,
  AiOutlineRise,
  AiOutlineFall
} from "react-icons/ai";
import { 
  FiUsers,
  FiSettings,
  FiActivity,
  FiBarChart2,
  FiDatabase,
  FiServer
} from "react-icons/fi";
import { BsCalendarCheck, BsGraphUp } from "react-icons/bs";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Pie, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import { useAlert } from "../context/AlertContext";
import { useAuth } from "../context/AuthContext";
import { getDashboardStats, getChartData } from "../api/stats";

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { profileData: user } = useAuth();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  // eslint-disable-next-line no-unused-vars
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [statsLoading, setStatsLoading] = useState(true);
  const [chartsLoading, setChartsLoading] = useState(true);
  // const [hoveredCard, setHoveredCard] = useState(null);

  // Sample data for charts
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalUsersChange: 0,
    totalUsersTrend: "none",
    activeUsers: 0,
    activeUsersChange: 0,
    activeUsersTrend: "none",
    newSignUps: 0,
    newSignUpsChange: 0,
    newSignUpsTrend: "none",
    engagementRate: 0,
    engagementRateChange: 0,
    engagementRateTrend: "none",
    storageUsed: 0,
    storageUsedChange: 0,
    storageUsedTrend: "none",
    apiCalls: 0,
    apiCallsChange: 0,
    apiCallsTrend: "none"
  });

  const defaultChartData = {
    labels: [],
    datasets: []
  };

  const [userGrowthData, setUserGrowthData] = useState(defaultChartData);

  const [platformUsageData, setPlatformUsageData] = useState(defaultChartData);

  const [performanceData, setPerformanceData] = useState(defaultChartData);


  const fetchDashboardStats = async () => {
    setStatsLoading(true);
    try {
      const response = await getDashboardStats();

      if (response && response.success) {
        const data = response.data;
        setStats(data);
      }
    } catch (error) {
      if(error.message.includes("Unauthorized")) {
        showAlert("Session expired. Please log in again.", { 
          type: "error", 
          duration: 5000 
        });
        navigate("/auth/login");
        return;
      }
      console.error("Error fetching dashboard stats:", error);
      showAlert("Failed to load dashboard statistics.", { 
        type: "error",
        duration: 5000,
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchChartData = async () => {
    try {
      setChartsLoading(true);
      const response = await getChartData('all');

      if (response && response.success) {
        const data = response.data;
        setUserGrowthData(data.userGrowthData);  
        setPlatformUsageData(data.platformUsageData);
        setPerformanceData(data.performanceData);
      }
      setChartsLoading(false);
    } catch (error) {
      if(error.message.includes("Unauthorized")) {
        showAlert("Session expired. Please log in again.", { 
          type: "error", 
          duration: 5000 
        });
        navigate("/auth/login");
        return;
      }
      console.error("Error fetching chart data:", error);
      showAlert("Failed to load chart data.", { 
        type: "error",
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchChartData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
    if (!user) {
      showAlert("Please log in to access the admin dashboard.", { type: "warning" });
      navigate("/auth/login");
      return;
    }
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, [showAlert, navigate, user]);

  const statsCards = [
    {
      id: 1,
      title: "Total Users",
      value: stats.totalUsers,
      icon: FiUsers,
      change: `${stats.totalUsersChange > 0 ? '+' : ''}${stats.totalUsersChange}%`,
      trend: stats.totalUsersTrend,
      color: "bg-indigo-500",
      gradient: "from-indigo-500 to-indigo-600",
      chart: userGrowthData
    },
    {
      id: 2,
      title: "Active Users",
      value: stats.activeUsers,
      icon: AiOutlineUser,
      change: `${stats.activeUsersChange > 0 ? '+' : ''}${stats.activeUsersChange}%`,
      trend: stats.activeUsersTrend,
      color: "bg-emerald-500",
      gradient: "from-emerald-500 to-emerald-600",
      chart: userGrowthData
    },
    {
      id: 3,
      title: "New Signups",
      value: stats.newSignUps,
      icon: BsCalendarCheck,
      change: `${stats.newSignUpsChange > 0 ? '+' : ''}${stats.newSignUpsChange}%`,
      trend: stats.newSignUpsTrend,
      color: "bg-amber-500",
      gradient: "from-amber-500 to-amber-600",
      chart: userGrowthData
    },
    {
      id: 4,
      title: "Engagement",
      value: `${Number(stats.engagementRate || 0)}%`,
      icon: FiBarChart2,
      change: `${stats.engagementRateChange > 0 ? '+' : ''}${stats.engagementRateChange}%`,
      trend: stats.engagementRateTrend,
      color: "bg-purple-500",
      gradient: "from-purple-500 to-purple-600",
      chart: platformUsageData
    },
    {
      id: 5,
      title: "Storage Used",
      value: `${Number(stats.storageUsed || 0)}GB`,
      icon: FiDatabase,
      change: `${stats.storageUsedChange > 0 ? '+' : ''}${stats.storageUsedChange}%`,
      trend: stats.storageUsedTrend,
      color: "bg-blue-500",
      gradient: "from-blue-500 to-cyan-600",
      chart: performanceData
    },
    {
      id: 6,
      title: "API Calls",
      value: stats.apiCalls,
      icon: FiServer,
      change: `${stats.apiCallsChange > 0 ? '+' : ''}${stats.apiCallsChange}%`,
      trend: stats.apiCallsTrend,
      color: "bg-pink-500",
      gradient: "from-pink-500 to-red-600",
      chart: performanceData
    }
  ];

  const TrendIcon = ({ trend }) => {
    if (trend === "up") return <AiOutlineRise className="text-green-400" />;
    if (trend === "down") return <AiOutlineFall className="text-red-400" />;
    return null;
  };

  const quickActions = [
    {
      title: "User Management",
      icon: FiUsers,
      path: "/admin/users",
      description: "Manage all user accounts and permissions"
    },
    {
      title: "System Settings",
      icon: FiSettings,
      path: "/admin/support",
      description: "Configure platform settings and preferences"
    },
    {
      title: "Analytics Dashboard",
      icon: BsGraphUp,
      path: "/admin/dashboard",
      description: "View detailed platform analytics and reports"
    }
  ];

  const filteredStatsCards = statsCards.filter((card) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      String(card.title || "").toLowerCase().includes(query) ||
      String(card.value || "").toLowerCase().includes(query)
    );
  });

  const filteredQuickActions = quickActions.filter((action) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase();
    return (
      String(action.title || "").toLowerCase().includes(query) ||
      String(action.description || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Menu Button */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-2 right-4 z-50 md:hidden bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl text-white shadow-lg"
        >
          {mobileMenuOpen ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </button>
      )}

      <Sidebar
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        customItems={null}
        userRole={user?.role}
      />

      {/* Main Content */}
      <div className={`transition-all duration-300 ${
        isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
      }`}>
        <Header 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search dashboard..."
        />

        {/* Dashboard Content */}
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
            {filteredStatsCards.map((card) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: card.id * 0.1 }}
                whileHover="hover"
                className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-slate-700/50 cursor-pointer group"
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                ></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} shadow-lg`}
                    >
                      <card.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-right">
                      {statsLoading ? (
                        <div className="flex flex-col items-end space-y-2">
                          <div className="h-7 w-20 animate-pulse rounded bg-slate-700/70" />
                          <div className="h-4 w-16 animate-pulse rounded bg-slate-700/60" />
                        </div>
                      ) : (
                        <>
                          <p className="text-xl md:text-2xl font-bold text-white">
                            {card.value}
                          </p>
                          <div className="flex items-center justify-end space-x-1">
                            <TrendIcon trend={card.trend} />
                            <p className={`text-sm font-medium ${
                              card.trend === "up" ? "text-green-400" :
                              card.trend === "down" ? "text-red-400" : "text-slate-400"
                            }`}>
                              {card.change}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <h3 className="text-slate-300 font-medium text-sm md:text-base">
                    {card.title}
                  </h3>
                </div>
              </motion.div>
            ))}          </div>
          {filteredStatsCards.length === 0 && searchQuery.trim() && (
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 text-center text-slate-300">
              No dashboard metrics match "{searchQuery}".
            </div>
          )}

          {/* Tabs for different views */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="flex border-b border-slate-700/50">
              {["overview", "analytics", "performance"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? "text-orange-500 border-b-2 border-orange-500"
                      : "text-slate-400 hover:text-slate-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            <div className="p-6">
              {activeTab === "overview" && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* User Growth Chart */}
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">User Growth</h3>
                    <div className="h-64">
                      {chartsLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                    ) : (
                      <Line 
                        data={userGrowthData}
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'top',
                              labels: {
                                color: '#E2E8F0'
                              }
                            }
                          },
                          scales: {
                            x: {
                              grid: {
                                color: 'rgba(226, 232, 240, 0.1)'
                              },
                              ticks: {
                                color: '#94A3B8'
                              }
                            },
                            y: {
                              grid: {
                                color: 'rgba(226, 232, 240, 0.1)'
                              },
                              ticks: {
                                color: '#94A3B8'
                              }
                            }
                          }
                        }}
                      />
                    )}
                    </div>
                  </motion.div>

                  {/* Platform Usage Chart */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Platform Usage</h3>
                    <div className="h-64">
                      {chartsLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                      ) : (
                        <Pie 
                          data={platformUsageData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'right',
                                labels: {
                                  color: '#E2E8F0'
                                }
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === "analytics" && (
                <div className="grid grid-cols-1 gap-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">Detailed Analytics</h3>
                    <div className="h-96">
                      {chartsLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                      ) : (
                        <Bar 
                          data={userGrowthData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: '#E2E8F0'
                                }
                              }
                            },
                            scales: {
                              x: {
                                grid: {
                                  color: 'rgba(226, 232, 240, 0.1)'
                                },
                                ticks: {
                                  color: '#94A3B8'
                                }
                              },
                              y: {
                                grid: {
                                  color: 'rgba(226, 232, 240, 0.1)'
                                },
                                ticks: {
                                  color: '#94A3B8'
                                }
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </motion.div>
                </div>
              )}

              {activeTab === "performance" && (
                <div className="grid grid-cols-1 gap-6">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-slate-800/30 rounded-xl p-4 border border-slate-700/50"
                  >
                    <h3 className="text-lg font-semibold text-white mb-4">System Performance</h3>
                    <div className="h-96">
                      {chartsLoading ? (
                        <div className="h-full flex items-center justify-center">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                        </div>
                      ) : (
                        <Line 
                          data={performanceData}
                          options={{
                            responsive: true,
                            maintainAspectRatio: false,
                            plugins: {
                              legend: {
                                position: 'top',
                                labels: {
                                  color: '#E2E8F0'
                                }
                              }
                            },
                            scales: {
                              x: {
                                grid: {
                                  color: 'rgba(226, 232, 240, 0.1)'
                                },
                                ticks: {
                                  color: '#94A3B8'
                                }
                              },
                              y: {
                                grid: {
                                  color: 'rgba(226, 232, 240, 0.1)'
                                },
                                ticks: {
                                  color: '#94A3B8'
                                },
                                title: {
                                  display: true,
                                  text: 'Response Time (ms)',
                                  color: '#94A3B8'
                                }
                              }
                            }
                          }}
                        />
                      )}
                    </div>
                  </motion.div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">
                Quick Actions
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {filteredQuickActions.map((action, index) => (
                <motion.div 
                  key={index}
                  whileHover={{ y: -5 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate(action.path)}
                  className="bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/50 rounded-xl p-4 cursor-pointer transition-all duration-200 hover:border-slate-600/50 group"
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <motion.div 
                      whileHover={{ rotate: 10 }}
                      className="bg-slate-700/50 group-hover:bg-orange-500/20 p-2 rounded-lg transition-colors"
                    >
                      <action.icon className="w-5 h-5 text-orange-400" />
                    </motion.div>
                    <h3 className="text-lg font-semibold text-white">{action.title}</h3>
                  </div>
                  <p className="text-sm text-slate-400">{action.description}</p>
                </motion.div>
              ))}
            </div>
            {filteredQuickActions.length === 0 && searchQuery.trim() && (
              <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-700/20 p-4 text-center text-slate-300">
                No quick actions match "{searchQuery}".
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;








