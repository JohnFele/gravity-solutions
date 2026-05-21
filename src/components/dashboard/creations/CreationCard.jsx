// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { AiOutlineEye, AiOutlineHeart, AiOutlinePlayCircle, AiOutlineLink } from "react-icons/ai";

const cardHoverVariants = {
  hover: {
    y: -8,
    scale: 1.02,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    },
  },
};

const platformLabels = {
  delightex: "Delightex Scene",
  thinglink: "ThingLink Scene",
  image360: "360 Image",
};

const DEFAULT_CREATION_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const CreationCard = ({ creation, onPreview }) => {
  const title = creation?.title || "Untitled Creation";
  const imageUrl = creation?.thumbnail || creation?.image || DEFAULT_CREATION_IMAGE;
  const platform = creation?.hostingPlatform || "image360";
  const platformLabel = platformLabels[platform] || "Creation";
  const views = creation?.views ?? "--";
  const likes = creation?.likes ?? "--";
  const externalUrl = creation?.contentUrl || creation?.url || creation?.thumbnail || "";
  const hasExternalUrl = Boolean(externalUrl);

  return (
    <motion.div
      whileHover={cardHoverVariants.hover}
      onClick={() => onPreview?.(creation)}
      className={`group relative overflow-hidden bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 ${
        onPreview ? "cursor-pointer" : ""
      }`}
    >
      <div className="relative h-48 overflow-hidden">
        <img
          src={imageUrl}
          alt={title}
          loading="lazy"
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = DEFAULT_CREATION_IMAGE;
          }}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent opacity-70"></div>
        <div className="absolute top-4 right-4">
          <span className="bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs text-white font-medium">
            {platformLabel}
          </span>
        </div>
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <AiOutlinePlayCircle className="w-12 h-12 text-white" />
        </div>
      </div>

      <div className="p-4 md:p-6">
        <h3 className="text-lg md:text-xl font-bold text-white mb-3 line-clamp-1">{title}</h3>
        <div className="flex items-center justify-between text-slate-400 mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <AiOutlineEye className="w-4 h-4" />
              <span className="text-sm">{views}</span>
            </div>
            <div className="flex items-center space-x-1">
              <AiOutlineHeart className="w-4 h-4" />
              <span className="text-sm">{likes}</span>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          {hasExternalUrl ? (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(event) => event.stopPropagation()}
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-2 px-4 rounded-xl font-medium shadow-lg text-sm md:text-base text-center"
            >
              Open Link
            </motion.a>
          ) : (
            <button
              type="button"
              disabled
              className="flex-1 bg-slate-700/50 text-slate-400 py-2 px-4 rounded-xl font-medium text-sm md:text-base cursor-not-allowed"
            >
              No Link
            </button>
          )}

          {hasExternalUrl && (
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(event) => event.stopPropagation()}
              href={externalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-12 h-10 bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 rounded-xl transition-colors"
              title="Open in new tab"
            >
              <AiOutlineLink className="w-4 h-4" />
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default CreationCard;
