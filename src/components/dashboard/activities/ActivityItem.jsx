// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { AiOutlineUser } from "react-icons/ai";

const ActivityItem = ({ activity, index }) => {
  const Icon = activity.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + 0.6 }}
      className="flex items-center space-x-4 p-3 md:p-4 rounded-xl hover:bg-slate-700/30 transition-colors"
    >
      <div className="w-10 h-10 rounded-full border-2 border-slate-600 flex items-center justify-center">
        <AiOutlineUser className="w-6 h-6 text-slate-400"/>
      </div>
      <div
        className={`p-2 rounded-lg ${activity.color} bg-opacity-20 flex-shrink-0`}
      >
        <Icon className={`w-4 h-4 ${activity.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm md:text-base">
          <span className="font-medium">{activity.actorName}</span>{" "}
          {activity.action}{" "}
          <span className="text-orange-500 font-medium">
            {activity.target}
          </span>
        </p>
        <p className="text-slate-400 text-xs md:text-sm">
          {activity.time}
        </p>
      </div>
    </motion.div>
  );
};

export default ActivityItem;
