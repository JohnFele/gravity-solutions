import { 
  AiOutlineAppstore, 
  AiOutlineEye, 
  AiOutlineHeart, 
  AiOutlineMessage, 
  AiOutlineShareAlt,
  AiOutlineUser, 
} from "react-icons/ai";
import { FiTrendingUp } from "react-icons/fi";

export const statsCards = [
  {
    title: "Total Creations",
    value: "47",
    change: "+12%",
    icon: AiOutlineAppstore,
    gradient: "from-blue-500 to-cyan-600",
  },
  {
    title: "Monthly Views",
    value: "12.8K",
    change: "+24%",
    icon: AiOutlineEye,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Engagement Rate",
    value: "68%",
    change: "+5%",
    icon: FiTrendingUp,
    gradient: "from-orange-500 to-red-600",
  },
];

export const creations = [
  {
    id: 1,
    title: "Mountain Retreat",
    type: "360° Tour",
    views: "1,245",
    likes: "342",
    image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=300&fit=crop",
    gradient: "from-blue-600 to-purple-700",
  },
  {
    id: 2,
    title: "Urban Exploration",
    type: "3D Model",
    views: "892",
    likes: "156",
    image:
      "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=400&h=300&fit=crop",
    gradient: "from-gray-700 to-gray-900",
  },
  {
    id: 3,
    title: "Ocean Depths",
    type: "VR Experience",
    views: "2,103",
    likes: "587",
    image:
      "https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=400&h=300&fit=crop",
    gradient: "from-cyan-600 to-blue-800",
  },
  {
    id: 4,
    title: "Space Station",
    type: "360° Video",
    views: "3,567",
    likes: "1,024",
    image:
      "https://images.unsplash.com/photo-1446776653964-20c1d3a81b06?w=400&h=300&fit=crop",
    gradient: "from-indigo-600 to-purple-800",
  },
  {
    id: 5,
    title: "Ancient Ruins",
    type: "3D Model",
    views: "1,567",
    likes: "432",
    image:
      "https://images.unsplash.com/photo-1539650116574-75c0c6d73c6e?w=400&h=300&fit=crop",
    gradient: "from-amber-600 to-orange-700",
  },
  {
    id: 6,
    title: "Fantasy Castle",
    type: "VR Experience",
    views: "2,789",
    likes: "765",
    image:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop",
    gradient: "from-purple-600 to-pink-700",
  },
];

export const activities = [
  {
    id: 1,
    user: "Sarah Explorer",
    action: "liked your creation",
    target: "Mountain Retreat",
    time: "2 hours ago",
    avatar: AiOutlineUser,
    icon: AiOutlineHeart,
    color: "text-red-500",
  },
  {
    id: 2,
    user: "Mike Designer",
    action: "commented on your creation",
    target: "Urban Exploration",
    time: "5 hours ago",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    icon: AiOutlineMessage,
    color: "text-blue-500",
  },
  {
    id: 3,
    user: "Alex Creator",
    action: "shared your creation",
    target: "Ocean Depths",
    time: "1 day ago",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    icon: AiOutlineShareAlt,
    color: "text-green-500",
  },
];