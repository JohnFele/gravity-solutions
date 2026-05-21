import { useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { 
  AiOutlineClose, 
  AiOutlinePicture,
  AiOutlineLink,
  AiOutlineTags,
  AiOutlineVideoCamera
} from "react-icons/ai";
import { useScrollLock } from "../../hooks/useScrollLock";

const GalleryModal = ({ mode, content, onClose, onSave }) => {
  useScrollLock(true);
  const [formData, setFormData] = useState(content || {
    title: "",
    description: "",
    type: "image",
    category: "urban",
    tags: [],
    thumbnail: "",
    status: "published"
  });

  const [currentTag, setCurrentTag] = useState("");

  const categories = [
    { id: "urban", name: "Urban" },
    { id: "nature", name: "Nature" },
    { id: "architecture", name: "Architecture" },
    { id: "travel", name: "Travel" },
    { id: "art", name: "Art" }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tag) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      id: mode === "edit" ? formData.id : Date.now(),
      views: mode === "edit" ? formData.views : "0",
      uploadDate: mode === "edit" ? formData.uploadDate : new Date().toISOString().split('T')[0]
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800/90 backdrop-blur-xl z-10 p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
              <AiOutlinePicture className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === "edit" ? "Edit Gallery Content" : "Upload New Content"}
            </h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-700/50 transition-colors"
          >
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
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Content Type</label>
              <div className="flex space-x-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="image"
                    checked={formData.type === "image"}
                    onChange={handleChange}
                    className="text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-slate-300">360° Image</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="type"
                    value="video"
                    checked={formData.type === "video"}
                    onChange={handleChange}
                    className="text-purple-500 focus:ring-purple-500"
                  />
                  <span className="text-slate-300">VR Video</span>
                </label>
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-300">Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
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
                  className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
              className="w-full bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
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
                className="flex-1 bg-slate-700/50 border border-slate-700/50 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
              />
              <button
                type="button"
                onClick={addTag}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map((tag) => (
                <div key={tag} className="flex items-center bg-slate-700/50 px-3 py-1 rounded-full text-sm">
                  <AiOutlineTags className="mr-1 text-purple-400" />
                  <span className="text-slate-300">{tag}</span>
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-slate-400 hover:text-red-400"
                  >
                    ×
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
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:opacity-90 transition-opacity"
            >
              {mode === "edit" ? "Save Changes" : "Upload Content"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default GalleryModal;

