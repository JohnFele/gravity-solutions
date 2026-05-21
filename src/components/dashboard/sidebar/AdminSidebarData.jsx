import {
  FiActivity,
  FiUsers,
} from "react-icons/fi";
import {
  AiOutlineTrophy,
  AiOutlinePicture,
  AiOutlineLock,
  AiOutlineRead,
  AiOutlineQuestionCircle,
  AiOutlineFileText,
} from "react-icons/ai";

export const adminSidebarItems = [
  { id: "dashboard", icon: FiActivity, label: "Dashboard", active: true, path: "/admin/dashboard" },
  { id: "users", icon: FiUsers, label: "User Management", path: "/admin/users" },
  { id: "challenges", icon: AiOutlineTrophy, label: "Challenges", path: "/admin/competitions" },
  { id: "content", icon: AiOutlinePicture, label: "Gallery", path: "/admin/gallery" },
  { id: "locker", icon: AiOutlineLock, label: "Creations Locker", path: "/admin/creations-locker" },
  { id: "quotation", icon: AiOutlineFileText, label: "Quotations", path: "/admin/quote/builder" },
  { id: "tutorials", icon: AiOutlineRead, label: "Tutorials", path: "/admin/tutorials" },
  { id: "support", icon: AiOutlineQuestionCircle, label: "Support", path: "/admin/support" },
];
