import {
  AiFillHome,
  AiOutlineTrophy,
  AiOutlinePicture,
  AiOutlineLock,
  AiOutlineQuestionCircle,
  AiOutlineRead,
  AiOutlineFileText,
} from "react-icons/ai";
import { FiClock } from "react-icons/fi";

export const sidebarItems = [
  { id: "home", icon: AiFillHome, label: "Home", active: true, path: "/user/dashboard" },
  { id: "challenges", icon: AiOutlineTrophy, label: "Challenge Hub", path: "/user/competitions" },
  { id: "gallery", icon: AiOutlinePicture, label: "Gallery", path: "/user/gallery" },
  { id: "locker", icon: AiOutlineLock, label: "Creations Locker", path: "/user/creations-locker" },
  { id: "quotation", icon: AiOutlineFileText, label: "Quotations", path: "/user/quote/builder" },
  { id: "quote-history", icon: FiClock, label: "Quote History", path: "/user/quote/history" },
  { id: "tutorials", icon: AiOutlineRead, label: "Tutorials", path: "/user/tutorials-management" },
  { id: "support", icon: AiOutlineQuestionCircle, label: "Support", path: "/user/support" },
];
