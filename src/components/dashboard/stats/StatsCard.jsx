// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

const StatsCard = ({ card }) => {
  const Icon = card.icon;
  return (
    <motion.div
      whileHover="hover"
      className="relative overflow-hidden bg-slate-800/50 backdrop-blur-xl rounded-2xl p-4 md:p-6 border border-slate-700/50 cursor-pointer group"
    >
      <div
        className={`absolute inset-0 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
      ></div>
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div
            className={`p-3 rounded-xl bg-gradient-to-r ${card.gradient} shadow-lg`}
          >
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-right">
            <p className="text-xl md:text-2xl font-bold text-white">
              {card.value}
            </p>
            <p className="text-green-400 text-sm font-medium">
              {card.change}
            </p>
          </div>
        </div>
        <h3 className="text-slate-300 font-medium text-sm md:text-base">
          {card.title}
        </h3>
      </div>
    </motion.div>
  );
};

export default StatsCard;