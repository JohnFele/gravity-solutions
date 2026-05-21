import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  AiOutlineClose,
  AiOutlineLock,
  AiOutlineLink,
  AiOutlineTags,
} from "react-icons/ai";
import { useScrollLock } from "../../hooks/useScrollLock";

const defaultStatusOptions = [
  { value: "private", label: "Private" },
  { value: "shared", label: "Shared" },
];

const CreationModal = ({
  mode,
  creation,
  onClose,
  onSave,
  statusLabel = "Visibility",
  statusOptions = defaultStatusOptions,
  submitCreateLabel = "Upload Creation",
  submitEditLabel = "Save Changes",
}) => {
  useScrollLock(true);

  const [formData, setFormData] = useState(() => ({
    title: creation?.title || "",
    description: creation?.description || "",
    hostingPlatform: creation?.hostingPlatform || "image360",
    contentUrl: creation?.contentUrl || "",
    category: creation?.category || "nature",
    tags: Array.isArray(creation?.tags) ? creation.tags : [],
    thumbnail: creation?.thumbnail || "",
    status: creation?.status || "private",
    _id: creation?._id,
    id: creation?.id,
  }));

  const [currentTag, setCurrentTag] = useState("");

  const categories = [
    { id: "nature", name: "Nature" },
    { id: "urban", name: "Urban" },
    { id: "travel", name: "Travel" },
    { id: "architecture", name: "Architecture" },
    { id: "personal", name: "Personal" },
    { id: "other", name: "Other" },
  ];

  const platformOptions = [
    { id: "delightex", name: "Delightex Scene" },
    { id: "thinglink", name: "ThingLink Scene" },
    { id: "image360", name: "360 Image" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800/90 backdrop-blur-xl z-10 p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
              <AiOutlineLock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">{mode === "edit" ? "Edit Creation" : "Upload New Creation"}</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-700/50 transition-colors">
            <AiOutlineClose className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Hosting Platform</label>
              <select
                name="hostingPlatform"
                value={formData.hostingPlatform}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {platformOptions.map((platform) => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Experience Link URL</label>
              <div className="relative">
                <input
                  type="url"
                  name="contentUrl"
                  value={formData.contentUrl}
                  onChange={handleChange}
                  required
                  placeholder="https://... (Delightex, ThingLink, or hosted image URL)"
                  className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <AiOutlineLink className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">{statusLabel}</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="block text-sm font-medium text-slate-300">Thumbnail URL</label>
              <div className="relative">
                <input
                  type="url"
                  name="thumbnail"
                  value={formData.thumbnail}
                  onChange={handleChange}
                  placeholder="Leave empty to use default image"
                  className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
                <AiOutlineLink className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              </div>
              {formData.thumbnail && (
                <div className="mt-2">
                  <p className="text-xs text-slate-400 mb-1">Thumbnail Preview:</p>
                  <img
                    src={formData.thumbnail}
                    alt="Thumbnail preview"
                    className="h-24 w-full object-cover rounded-lg border border-slate-700/50"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">Tags</label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={currentTag}
                onChange={(e) => setCurrentTag(e.target.value)}
                placeholder="Add a tag"
                className="flex-1 bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <div key={tag} className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full text-sm">
                  <AiOutlineTags className="mr-1 text-blue-400" />
                  <span className="text-slate-300">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-slate-400 hover:text-red-400"
                  >
                    x
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-700/50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white hover:opacity-90 transition-opacity"
            >
              {mode === "edit" ? submitEditLabel : submitCreateLabel}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreationModal;
