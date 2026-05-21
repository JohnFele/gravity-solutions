import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import {
  AiOutlineCalendar,
  AiOutlineClose,
  AiOutlineEye,
  AiOutlineTags,
  AiOutlineUser,
  AiOutlinePicture,
  AiOutlinePlayCircle,
  AiOutlineLock,
  AiOutlineGlobal,
  AiOutlineHeart,
  AiFillHeart,
} from "react-icons/ai";
import { FiDownload, FiShare2 } from "react-icons/fi";
import { useScrollLock } from "../../hooks/useScrollLock";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_CREATION_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const resolveOwnerName = (owner) => {
  if (!owner) return "Unknown creator";
  if (typeof owner === "string") return owner;

  const fullName = [owner.firstName, owner.lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  return owner.userName || "Unknown creator";
};

const getStatusIcon = (status) => {
  switch (status) {
    case "private":
      return <AiOutlineLock className="h-3 w-3 mr-1" />;
    case "shared":
    case "public":
      return <AiOutlineGlobal className="h-3 w-3 mr-1" />;
    default:
      return null;
  }
};

const getStatusColor = (status) => {
  switch (status) {
    case "private":
      return "bg-purple-500/20 text-purple-400";
    case "shared":
    case "public":
      return "bg-green-500/20 text-green-400";
    case "draft":
      return "bg-amber-500/20 text-amber-400";
    default:
      return "bg-slate-500/20 text-slate-400";
  }
};

const CreationPreviewModal = ({ creation, onClose, onView, onDownload, onShare, onLike }) => {
  const { profileData: user } = useAuth();
  const [isLikeLoading, setIsLikeLoading] = useState(false);

  useScrollLock(Boolean(creation));

  if (!creation) return null;

  const ownerName = resolveOwnerName(creation.owner);
  const createdAt = creation.createdAt
    ? new Date(creation.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Unknown date";

  const typeIcon = creation.type === "video" ? <AiOutlinePlayCircle className="h-4 w-4" /> : <AiOutlinePicture className="h-4 w-4" />;
  const imageSource = creation.thumbnail || creation.coverImage || DEFAULT_CREATION_IMAGE;

  const ownerId = String(creation.owner?._id || creation.owner || "");
  const currentUserId = String(user?._id || "");
  const isOwner = Boolean(ownerId && currentUserId && ownerId === currentUserId);

  const likesCount = Number(creation.likes ?? creation.likesCount ?? 0);
  const isLiked = Boolean(creation.isLiked);

  const handleLike = async () => {
    if (!onLike || isLikeLoading || isOwner) return;

    try {
      setIsLikeLoading(true);
      await onLike(creation);
    } finally {
      setIsLikeLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        <motion.div
          initial={{ y: 24, scale: 0.95, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: 16, scale: 0.98, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-4xl overflow-hidden rounded-2xl border border-slate-700/50 bg-gradient-to-br from-slate-900 to-slate-800 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="flex items-center justify-between border-b border-slate-700/50 px-5 py-4 bg-slate-800/50">
            <div className="flex items-center space-x-2">
              <div className={`p-1.5 rounded-lg ${creation.type === "video" ? "bg-purple-500/20" : "bg-blue-500/20"}`}>
                {typeIcon}
              </div>
              <h2 className="text-lg font-semibold text-white">{creation.title}</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-slate-700/60 hover:text-white"
              aria-label="Close modal"
            >
              <AiOutlineClose className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-0 md:grid-cols-5">
            <div className="md:col-span-3 h-64 md:h-auto relative group">
              <img
                src={imageSource}
                alt={creation.title}
                className="h-full w-full object-cover"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = DEFAULT_CREATION_IMAGE;
                }}
              />

              <div className="absolute top-4 left-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                    creation.type === "video" ? "bg-purple-500/90" : "bg-blue-500/90"
                  } text-white backdrop-blur-sm`}
                >
                  {typeIcon}
                  <span className="ml-1">{creation.type === "video" ? "VR Video" : "360 Image"}</span>
                </span>
              </div>

              {creation.status && (
                <div className="absolute top-4 right-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(
                      creation.status
                    )} backdrop-blur-sm`}
                  >
                    {getStatusIcon(creation.status)}
                    {creation.status}
                  </span>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>

            <div className="md:col-span-2 space-y-4 p-5 bg-slate-800/30">
              <div>
                <h3 className="text-xl font-bold text-white mb-1">{creation.title}</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{creation.description || "No description provided."}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-slate-300 bg-slate-700/30 rounded-lg p-2">
                  <AiOutlineUser className="h-4 w-4 mr-2 text-blue-400" />
                  <span className="text-slate-400 mr-2">Creator:</span>
                  <span className="text-white font-medium">{ownerName}</span>
                </div>

                <div className="flex items-center text-slate-300 bg-slate-700/30 rounded-lg p-2">
                  <AiOutlineCalendar className="h-4 w-4 mr-2 text-amber-400" />
                  <span className="text-slate-400 mr-2">Created:</span>
                  <span className="text-white">{createdAt}</span>
                </div>

                {creation.category && (
                  <div className="flex items-center text-slate-300 bg-slate-700/30 rounded-lg p-2">
                    <span className="text-slate-400 mr-2">Category:</span>
                    <span className="text-white capitalize">{creation.category}</span>
                  </div>
                )}

                {creation.size && (
                  <div className="flex items-center text-slate-300 bg-slate-700/30 rounded-lg p-2">
                    <span className="text-slate-400 mr-2">Size:</span>
                    <span className="text-white">{creation.size}</span>
                  </div>
                )}
              </div>

              {(creation.tags || []).length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {(creation.tags || []).slice(0, 8).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full bg-slate-700/70 px-2.5 py-1 text-xs text-slate-200 hover:bg-slate-700 transition-colors"
                      >
                        <AiOutlineTags className="mr-1 h-3 w-3 text-slate-400" />
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="pt-4 flex flex-col space-y-2">
                <button
                  type="button"
                  onClick={() => onView(creation)}
                  className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:shadow-lg hover:shadow-blue-500/30"
                >
                  <AiOutlineEye className="mr-2 h-4 w-4" />
                  View Creation
                </button>

                {onLike && (
                  <button
                    type="button"
                    onClick={handleLike}
                    disabled={isLikeLoading || isOwner}
                    className={`inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm font-medium transition-colors border ${
                      isOwner
                        ? "bg-slate-700/40 border-slate-700 text-slate-400 cursor-not-allowed"
                        : isLiked
                          ? "bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/20"
                          : "bg-slate-700/50 border-slate-600/50 text-slate-200 hover:bg-slate-700/70"
                    }`}
                  >
                    {isLiked ? <AiFillHeart className="mr-2 h-4 w-4" /> : <AiOutlineHeart className="mr-2 h-4 w-4" />}
                    {isOwner ? "Your Creation" : isLikeLoading ? "Saving..." : isLiked ? "Unlike" : "Like"}
                    <span className="ml-2 text-xs opacity-90">({likesCount})</span>
                  </button>
                )}

                <div className="grid grid-cols-2 gap-2">
                  {onDownload && (
                    <button
                      type="button"
                      onClick={() => onDownload(creation)}
                      className="inline-flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700/70 px-3 py-2 text-sm font-medium text-slate-300 transition-colors border border-slate-600/50"
                    >
                      <FiDownload className="mr-2 h-4 w-4" />
                      Download
                    </button>
                  )}

                  {onShare && (
                    <button
                      type="button"
                      onClick={() => onShare(creation)}
                      className="inline-flex items-center justify-center rounded-lg bg-slate-700/50 hover:bg-slate-700/70 px-3 py-2 text-sm font-medium text-slate-300 transition-colors border border-slate-600/50"
                    >
                      <FiShare2 className="mr-2 h-4 w-4" />
                      Share
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-slate-700/50 px-5 py-3 bg-slate-800/50">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Creation ID: {creation.id || creation._id}</span>
              <span>{likesCount} likes • {creation.views || 0} views</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreationPreviewModal;
