import { Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { AiOutlineUser } from "react-icons/ai";
import { HiOutlineLogout } from 'react-icons/hi'
import { BiChevronLeft } from "react-icons/bi";
import SidebarItem from "./SidebarItem";
import { adminSidebarItems } from "./AdminSidebarData";
import { proSidebarItems } from "./ProSidebarData";
import { sidebarItems } from "./SidebarData";
import logo from '../../../assets/img/U.png';
// import { getUserProfile } from "../../../api/user";
import { useAuth } from "../../../context/AuthContext";
import { useAlert } from "../../../context/AlertContext";

const Sidebar = ({ 
  isMobile, 
  mobileMenuOpen, 
  setMobileMenuOpen, 
  sidebarCollapsed, 
  setSidebarCollapsed,
  customItems,
  userRole,
}) => {
  const { profileData: user, isLoading: loading, logout } = useAuth();
  const { showAlert } = useAlert();

  const getSidebarItems = () => {
    if (customItems) return customItems;
    if (userRole === "Admin") return adminSidebarItems;
    if (user?.plan === "ULinker") return proSidebarItems;
    return sidebarItems;
  };

  const itemsToRender = getSidebarItems();

  const handleSignOut = async () => {
    showAlert("Logging you out...", {
      type: "info",
      duration: 5000
    });
    try {
      await logout();
      showAlert("Logged out successfully!", {
        type: "success",
        duration: 5000
      })
    } catch (error) {
      console.error("Error signing out:", error);
      showAlert("Error signing out. Please try again.", {
        type: "error",
        duration: 5000
      })
    }
  };

  return (
    <AnimatePresence>
      {(!isMobile || mobileMenuOpen) && (
        <>
          {isMobile && mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
            />
          )}

          <motion.div
            initial={{ x: isMobile ? -300 : sidebarCollapsed ? -200 : -300 }}
            animate={{ x: 0 }}
            exit={{ x: isMobile ? -300 : sidebarCollapsed ? -200 : -300 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed left-0 top-0 h-full ${
              isMobile ? "w-60" : sidebarCollapsed ? "w-16" : "w-60"
            } bg-slate-800/95 backdrop-blur-xl border-r border-slate-700/50 z-50 transition-all duration-300`}
          >
            {/* Logo */}
            <div className={`border-b border-slate-700/50 ${sidebarCollapsed && !isMobile ? "px-2 p-7.5" : "p-3"}`}>
              <div className="flex flex-col space-x-3">
                <div className={`${sidebarCollapsed ? "w-11" : "w-20"} flex justify-center flex-shrink-0 mb-2 transition-all duration-300`}>
                  {(!sidebarCollapsed || isMobile) && (
                  <img src={logo} alt="Logo" className="w-full" />
                  )}
                  {(sidebarCollapsed && !isMobile) && (
                  <img src={logo} alt="Logo" className="w-full" />
                  )}
                </div>
                {(!sidebarCollapsed || isMobile) && (
                  <div>
                    <p className="text-sm text-slate-400">Create. Explore. Share.</p>
                  </div>
                )}
              </div>
            </div>

            {!isMobile && (
              <div className="absolute -right-3 top-20 z-10">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-full p-1.5 text-white shadow-lg transition-colors"
                >
                  <motion.div animate={{ rotate: sidebarCollapsed ? 180 : 0 }} transition={{ duration: 0.3 }}>
                      <BiChevronLeft size={14} />
                  </motion.div>
                </motion.button>
              </div>
            )}

            <nav className={`p-4 space-y-2 ${sidebarCollapsed && !isMobile ? "px-2" : ""}`}>
              {itemsToRender.map((item, index) => (
                <SidebarItem 
                  key={item.id}
                  item={item}
                  index={index}
                  isMobile={isMobile}
                  sidebarCollapsed={sidebarCollapsed}
                  setMobileMenuOpen={setMobileMenuOpen}
                />
              ))}
            </nav>

            <div className={`absolute bottom-0 w-full p-4 border-t border-slate-700/50 ${sidebarCollapsed && !isMobile ? "px-2" : ""}`}>
              {(!sidebarCollapsed || isMobile) && (
                loading ? (
                  <div className="flex items-center space-x-3 mb-4 animate-pulse">
                    <div className="w-10 h-10 bg-slate-700 rounded-full flex-shrink-0"></div>
                    <div className="flex flex-col space-y-1">
                      <div className="w-24 h-4 bg-slate-700 rounded"></div>
                      <div className="w-16 h-3 bg-slate-700 rounded"></div>
                    </div>
                  </div>
                ) : user ? (
                <Link to="/user/profile" className="flex items-center space-x-3 mb-4 hover:cursor-pointer">
                  {user.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-orange-500 flex-shrink-0"
                    />
                  ) : user?.profilePicture ? (
                    <img
                      src={user.profilePicture}
                      alt="Profile"
                      className="w-10 h-10 rounded-full border-2 border-orange-500 flex-shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-slate-700 border-1 border-orange-500 rounded-full flex items-center justify-center">
                      <AiOutlineUser className="w-6 h-6 text-slate-400" />
                    </div>
                  )}
                  <div>
                    <p className="text-white font-medium">{user.firstName + " " + user.lastName}</p>
                    <p className="text-slate-400 text-sm">{user.plan}</p>
                  </div>
                </Link>
              ) : (
                <p className="text-slate-400 text-sm mb-4">Failed to load user profile</p>
              ))}

              <div className="relative group">
                <motion.button
                  className={`flex items-center ${
                    sidebarCollapsed && !isMobile
                      ? "justify-center w-full py-2"
                      : "space-x-2"
                  } text-slate-400 transition-colors hover:text-red-500`}
                  whileHover={{ x: sidebarCollapsed && !isMobile ? 0 : 4 }}
                  onClick={handleSignOut}
                >
                  <HiOutlineLogout className="w-6 h-6" />
                  {(!sidebarCollapsed || isMobile) && (
                    <span className="text-sm">Sign Out</span>
                  )}
                </motion.button>

                {sidebarCollapsed && !isMobile && (
                  <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
                    Sign Out
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
