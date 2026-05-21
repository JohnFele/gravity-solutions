import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { AiOutlinePlus, AiOutlineBell, AiOutlineCheck } from "react-icons/ai";
import SearchBar from "./SearchBar";
import { useAuth } from "../../../context/AuthContext";
import { getNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "../../../api/notifications";

const formatRelativeTime = (value) => {
  if (!value) return "";

  const now = Date.now();
  const target = new Date(value).getTime();
  const diffMs = Math.max(0, now - target);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < minute) return "Just now";
  if (diffMs < hour) return `${Math.floor(diffMs / minute)}m ago`;
  if (diffMs < day) return `${Math.floor(diffMs / hour)}h ago`;
  return `${Math.floor(diffMs / day)}d ago`;
};

const resolveActorName = (actor) => {
  if (!actor) return "Someone";
  const fullName = [actor.firstName, actor.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  return actor.userName || "Someone";
};

const Header = ({ searchQuery, setSearchQuery, searchPlaceholder }) => {
  const { profileData: user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);

  const notificationsRef = useRef(null);

  const role = String(user?.role || "").toLowerCase();
  const isAdmin = role === "admin";

  const isActive = (path) => location.pathname.startsWith(path);

  const handleNavigation = (path) => {
    if (location.pathname !== path) {
      if (typeof setSearchQuery === "function") setSearchQuery("");
      navigate(path);
    }
  };

  const creationsPath = isAdmin ? "/admin/creations-locker" : "/user/creations-locker";
  const tutorialsPath = isAdmin ? "/admin/tutorials" : "/user/tutorials-management";
  const galleryPath = isAdmin ? "/admin/gallery" : "/user/gallery";

  const navButtonClass = (path) =>
    `pb-2 ${
      isActive(path)
        ? "text-white border-b-2 border-orange-500"
        : "text-slate-400 hover:text-white transition-colors"
    }`;

  const loadNotifications = useCallback(async () => {
    if (!user?._id) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    setIsNotificationsLoading(true);
    try {
      const response = await getNotifications({ limit: 10 });
      setNotifications(response?.data || []);
      setUnreadCount(Number(response?.unreadCount || 0));
    } catch {
      // Keep the header non-blocking if notifications fail.
    } finally {
      setIsNotificationsLoading(false);
    }
  }, [user?._id]);

  useEffect(() => {
    loadNotifications();

    const timer = setInterval(() => {
      loadNotifications();
    }, 30000);

    return () => clearInterval(timer);
  }, [loadNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    };

    if (isNotificationsOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationsOpen]);

  const handleNotificationBell = async () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);

    if (nextOpen) {
      await loadNotifications();
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) => prev.map((item) => (item._id === notificationId ? { ...item, isRead: true } : item)));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch {
      // Silent failure to avoid noisy alerts in header interactions.
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Silent failure to avoid noisy alerts in header interactions.
    }
  };

  const handleNotificationClick = async (notification) => {
    if (!notification?.isRead) {
      await handleMarkAsRead(notification._id);
    }

    const creationUrl = notification?.creation?.contentUrl;
    if (creationUrl) {
      window.open(creationUrl, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 p-4 md:p-6"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-6">
          <nav className="flex space-x-4 md:space-x-8">
            <button onClick={() => handleNavigation(creationsPath)} className={navButtonClass(creationsPath)}>
              Creations
            </button>
            <button onClick={() => handleNavigation(tutorialsPath)} className={navButtonClass(tutorialsPath)}>
              Tutorials
            </button>
            <button onClick={() => handleNavigation(galleryPath)} className={navButtonClass(galleryPath)}>
              Gallery
            </button>
          </nav>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4">
          <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder={searchPlaceholder} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-orange-500 to-red-600 p-2 rounded-xl text-white shadow-lg"
            onClick={() => handleNavigation(creationsPath)}
            title="Go to creations"
          >
            <AiOutlinePlus className="w-5 h-5" />
          </motion.button>

          <div className="relative" ref={notificationsRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="relative p-2 text-slate-400 hover:text-white transition-colors"
              onClick={handleNotificationBell}
              title="Notifications"
            >
              <AiOutlineBell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </motion.button>

            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-700/70 rounded-xl shadow-2xl overflow-hidden z-50">
                <div className="px-4 py-3 border-b border-slate-700/70 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">Notifications</h3>
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      onClick={handleMarkAllAsRead}
                      className="text-xs text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      Mark all read
                    </button>
                  )}
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {isNotificationsLoading ? (
                    <div className="px-4 py-6 text-sm text-slate-400">Loading notifications...</div>
                  ) : notifications.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-slate-400">No notifications yet.</div>
                  ) : (
                    notifications.map((notification) => (
                      <button
                        key={notification._id}
                        type="button"
                        onClick={() => handleNotificationClick(notification)}
                        className={`w-full text-left px-4 py-3 border-b border-slate-800/80 hover:bg-slate-800/70 transition-colors ${
                          notification.isRead ? "bg-transparent" : "bg-slate-800/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-white line-clamp-2">
                              {notification.message || `${resolveActorName(notification.actor)} liked your creation.`}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(notification.createdAt)}</p>
                          </div>
                          {!notification.isRead && (
                            <span className="text-orange-400 mt-1">
                              <AiOutlineCheck className="w-4 h-4" />
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
