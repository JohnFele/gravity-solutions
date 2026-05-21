// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import ActivityItem from "./ActivityItem";

const ActivitiesContainer = ({ activities }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
    >
      <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-4 md:p-6">
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <ActivityItem key={activity.id} activity={activity} index={index} />
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ActivitiesContainer;
