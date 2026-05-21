import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const SidebarItem = ({ item, index, isMobile, sidebarCollapsed, setMobileMenuOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = item.id === "users" 
    ? location.pathname.startsWith("/admin/users") || 
      location.pathname.startsWith("/admin/user/")
    : location.pathname.startsWith(item.path);

  return (
    <div className="relative group">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        onClick={() => {
          navigate(item.path);
          if (isMobile) setMobileMenuOpen(false);
        }}
        className={`w-full flex items-center ${
          sidebarCollapsed && !isMobile
            ? "justify-center px-3 py-3"
            : "space-x-3 px-4 py-3"
        } rounded-xl transition-all duration-200 ${
          isActive
            ? "bg-gradient-to-r from-orange-500 to-red-600 text-white shadow-lg"
            : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
        }`}
        whileHover={{ x: sidebarCollapsed && !isMobile ? 0 : 4 }}
        whileTap={{ scale: 0.95 }}
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />
        {(!sidebarCollapsed || isMobile) && (
          <span className="font-medium">{item.label}</span>
        )}
      </motion.button>

      {sidebarCollapsed && !isMobile && (
        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 bg-slate-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-50">
          {item.label}
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 border-4 border-transparent border-r-slate-800"></div>
        </div>
      )}
    </div>
  );
};

export default SidebarItem;