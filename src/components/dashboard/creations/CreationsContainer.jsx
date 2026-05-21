// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import CreationCard from "./CreationCard";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const CreationsContainer = ({ creations, onPreview }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
    >
      {creations.map((creation) => (
        <motion.div key={creation._id || creation.id} variants={itemVariants}>
          <CreationCard creation={creation} onPreview={onPreview} />
        </motion.div>
      ))}
    </motion.div>
  );
};

export default CreationsContainer;
