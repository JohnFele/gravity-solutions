import {
  FiUsers,
  FiClock,
} from "react-icons/fi";
import {
  AiFillHome,
  AiOutlineTrophy,
  AiOutlinePicture,
  AiOutlineLock,
  AiOutlineRead,
  AiOutlineQuestionCircle,
  AiOutlineFileText,
} from "react-icons/ai";

export const proSidebarItems = [
  { id: "home", icon: AiFillHome, label: "Home", active: true, path: "/user/dashboard" },
  { id: "challenges", icon: AiOutlineTrophy, label: "Challenge Hub", path: "/user/competitions" },
  { id: "gallery", icon: AiOutlinePicture, label: "Pro Gallery", path: "/user/gallery" },
  { id: "locker", icon: AiOutlineLock, label: "Pro Locker", path: "/user/creations-locker" },
  { id: "quotation", icon: AiOutlineFileText, label: "Quotations", path: "/user/quote/builder" },
  { id: "quote-history", icon: FiClock, label: "Quote History", path: "/user/quote/history" },
  { id: "community", icon: FiUsers, label: "Pro Community", path: "/user/support" },
  { id: "tutorials", icon: AiOutlineRead, label: "Pro Tutorials", path: "/user/tutorials-management" },
  { id: "support", icon: AiOutlineQuestionCircle, label: "Pro Settings", path: "/user/support" },
];
