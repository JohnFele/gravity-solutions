import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  AiOutlineMenu, 
  AiOutlineClose,
  AiOutlineUser,
  AiOutlineDelete,
  AiOutlineRest,
  AiOutlineEye,
  AiOutlineSearch,
  AiOutlineFilter,
  AiOutlineCloudSync
} from "react-icons/ai";
import { FiUsers } from "react-icons/fi";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import StatsContainer from "../components/dashboard/stats/StatsContainer";
import { useAlert } from "../context/AlertContext";
import { getAllUsers, manageUserAccount } from "../api/admin";
import { useAuth } from "../context/AuthContext";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { showAlert } = useAlert();
  const { profileData: user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, active, deleted
  const [stats, setStats] = useState({
    totalUsers: 10,
    activeUsers: 6,
    deletedUsers: 0,
    newUsers: 0
  });

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
    const fetchData = async () => {
      if (!user) {
        showAlert("Please log in to access the admin dashboard.", { type: "warning" });
        navigate("/auth/login");
        return;
      }
      try {
        setLoading(true);
        const response = await getAllUsers(filter);
        // console.log(response);
        
        setUsers(Array.isArray(response.data) ? response.data : []);
        // setStats(response.data.stats);
      } catch (error) {
        showAlert("Failed to load user data", { type: "error" });
        console.error(error);
        return;
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filter, showAlert, navigate, user]);

  const handleUserAction = async (action, userId) => {
    try {
      const response = await manageUserAccount(userId, action);
      if (response.success) {
        showAlert(`User ${action} successfully`, { type: "success" });
        // Refresh user list
        const updatedResponse = await getAllUsers(filter);
        setUsers(updatedResponse.data.users);
        setStats(updatedResponse.data.stats);
      }
    } catch (error) {
      showAlert(`Failed to ${action} user`, { type: "error" });
      console.error(error);
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statsCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: FiUsers,
      change: "+12%",
      trend: "up"
    },
    {
      title: "Active Users",
      value: stats.activeUsers,
      icon: AiOutlineUser,
      change: "+8%",
      trend: "up"
    },
    {
      title: "Deleted Users",
      value: stats.deletedUsers,
      icon: AiOutlineDelete,
      change: "-3%",
      trend: "down"
    },
    {
      title: "New This Week",
      value: stats.newUsers,
      icon: AiOutlineCloudSync,
      change: "+15%",
      trend: "up"
    }
  ];

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
          searchPlaceholder="Search users..."
        />

        {/* Dashboard Content */}
        <div className="p-4 md:p-6 space-y-6 md:space-y-8">
          {/* Stats Cards */}
          <StatsContainer statsCards={statsCards} />

          {/* User Management Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <h2 className="text-xl md:text-2xl font-bold text-white">
                  User Management
                </h2>
                <div className="flex space-x-2">
                  <div className="relative">
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value)}
                      className="appearance-none bg-slate-700/50 border border-slate-600 rounded-lg pl-3 pr-8 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">All Users</option>
                      <option value="verified">Verified Only</option>
                      <option value="deleted">Deleted Only</option>
                    </select>
                    <AiOutlineFilter className="absolute right-3 top-2.5 text-slate-400" />
                  </div>
                  <button className="bg-slate-700/50 hover:bg-slate-700/70 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm flex items-center transition-colors">
                    <AiOutlineSearch className="mr-2" />
                    Advanced
                  </button>
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700/50">
                  <thead className="bg-slate-700/30">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        User
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Joined
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-800/30 divide-y divide-slate-700/50">
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center">
                          Loading users...
                        </td>
                      </tr>
                    ) : filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-slate-400">
                          No users found
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((user) => (
                        <tr key={user._id} className="hover:bg-slate-700/20 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center">
                                {user.profilePicture ? (
                                  <img className="h-10 w-10 rounded-full" src={user.profilePicture} alt="User profile picture" />
                                ) : (
                                  <AiOutlineUser className="h-5 w-5 text-slate-400" />
                                )}
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-white">
                                  {user.userName}
                                </div>
                                <div className="text-sm text-slate-400">
                                  {user.role}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {user.firstName} {user.lastName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              user.deleted ? 'bg-red-500/20 text-red-400' : 
                              user.emailVerified ? 'bg-emerald-500/20 text-emerald-400' : 
                              'bg-amber-500/20 text-amber-400'
                            }`}>
                              {user.deleted ? 'Deleted' : 
                               user.isEmailVerified ? 'Verified' : 'Unverified'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={() => navigate(`/admin/users/${user._id}`)}
                                className="text-blue-400 hover:text-blue-300 p-1 rounded-md hover:bg-blue-500/10 transition-colors"
                                title="View Details"
                              >
                                <AiOutlineEye className="h-5 w-5" />
                              </button>
                              {user.deleted ? (
                                <button
                                  onClick={() => handleUserAction('restore', user._id)}
                                  className="text-emerald-400 hover:text-emerald-300 p-1 rounded-md hover:bg-emerald-500/10 transition-colors"
                                  title="Restore User"
                                >
                                  <AiOutlineRest className="h-5 w-5" />
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUserAction('delete', user._id)}
                                  className="text-red-400 hover:text-red-300 p-1 rounded-md hover:bg-red-500/10 transition-colors"
                                  title="Delete User"
                                >
                                  <AiOutlineDelete className="h-5 w-5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* System Status Section */}
          <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
            <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
              System Status
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Server Health</h3>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 rounded-full" style={{ width: '95%' }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">All systems operational</p>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-700/50">
                <h3 className="text-sm font-semibold text-slate-300 mb-2">Database Status</h3>
                <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: '98%' }}></div>
                </div>
                <p className="text-xs text-slate-400 mt-2">Connected, 42ms avg response</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
