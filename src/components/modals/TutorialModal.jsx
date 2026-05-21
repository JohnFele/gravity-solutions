import { useMemo, useState } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import {
  AiOutlineClose,
  AiOutlineBook,
  AiOutlinePlus,
  AiOutlineDelete,
} from "react-icons/ai";
import { useScrollLock } from "../../hooks/useScrollLock";

const slugify = (value) =>
  String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toLines = (value) => (Array.isArray(value) ? value.join("\n") : "");
const fromLines = (value) =>
  String(value || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);

const buildInitialData = (tutorial) => ({
  slug: tutorial?.slug || "",
  title: tutorial?.title || "",
  description: tutorial?.description || "",
  platform: tutorial?.platform || "delightex",
  type: tutorial?.type || "mission",
  order: tutorial?.order || 0,
  coreSkill: tutorial?.coreSkill || "",
  category: tutorial?.category || "delightex",
  duration: tutorial?.duration || "Self-paced",
  thumbnail: tutorial?.thumbnail || "",
  url: tutorial?.url || "",
  gradient: tutorial?.gradient || "from-cyan-600 to-emerald-700",
  status: tutorial?.status === "unpublished" ? "draft" : tutorial?.status || "published",
  outcome: tutorial?.outcome || "",
  successChecksText: toLines(tutorial?.successChecks),
  learnedText: toLines(tutorial?.learned),
  assessmentCriteriaText: toLines(tutorial?.assessmentCriteria) || [
    "Demonstrates understanding",
    "Applies the concept correctly",
    "Completes the mission independently",
    "Explains the task confidently",
  ].join("\n"),
  steps: tutorial?.steps?.length
    ? tutorial.steps
    : [{ title: "", body: "", code: "" }],
});

const TutorialModal = ({ mode, tutorial, onClose, onSave }) => {
  useScrollLock(true);
  const [formData, setFormData] = useState(buildInitialData(tutorial));

  const categories = [
    { id: "delightex", name: "DelightEX" },
    { id: "thinglink", name: "ThingLink" },
    { id: "getting-started", name: "Getting Started" },
    { id: "advanced", name: "Advanced" },
    { id: "equipment", name: "Equipment" },
    { id: "software", name: "Software" },
    { id: "workflow", name: "Workflow" },
    { id: "assessment", name: "Assessment" },
    { id: "general", name: "General" },
  ];

  const gradients = [
    { id: "from-cyan-600 to-emerald-700", name: "Cyan-Emerald" },
    { id: "from-blue-600 to-purple-700", name: "Blue-Purple" },
    { id: "from-purple-600 to-indigo-700", name: "Purple-Indigo" },
    { id: "from-amber-600 to-orange-700", name: "Amber-Orange" },
    { id: "from-rose-600 to-pink-700", name: "Rose-Pink" },
  ];

  const generatedSlug = useMemo(() => {
    const prefix = formData.platform ? `${formData.platform}-` : "";
    const order = Number(formData.order) > 0 ? `mission-${String(formData.order).padStart(2, "0")}-` : "";
    return slugify(`${prefix}${order}${formData.title}`);
  }, [formData.order, formData.platform, formData.title]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateStep = (index, field, value) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.map((step, stepIndex) =>
        stepIndex === index ? { ...step, [field]: value } : step
      ),
    }));
  };

  const addStep = () => {
    setFormData((prev) => ({
      ...prev,
      steps: [...prev.steps, { title: "", body: "", code: "" }],
    }));
  };

  const removeStep = (index) => {
    setFormData((prev) => ({
      ...prev,
      steps: prev.steps.filter((_, stepIndex) => stepIndex !== index),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = {
      slug: formData.slug || generatedSlug,
      title: formData.title,
      description: formData.description,
      platform: formData.platform,
      type: formData.type,
      order: Number(formData.order) || 0,
      coreSkill: formData.coreSkill,
      category: formData.category,
      duration: formData.duration,
      thumbnail: formData.thumbnail,
      url: formData.url,
      gradient: formData.gradient,
      status: formData.status,
      outcome: formData.outcome,
      successChecks: fromLines(formData.successChecksText),
      learned: fromLines(formData.learnedText),
      assessmentCriteria: fromLines(formData.assessmentCriteriaText),
      steps: formData.type === "mission" || formData.steps.some((step) => step.title || step.body || step.code)
        ? formData.steps
            .map((step) => ({
              title: step.title.trim(),
              body: step.body.trim(),
              code: step.code || "",
            }))
            .filter((step) => step.title && step.body)
        : [],
    };

    onSave(payload);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        initial={{ scale: 0.96, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-slate-900 rounded-2xl border border-slate-700/70 w-full max-w-5xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-xl z-10 p-4 border-b border-slate-700/70 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950">
              <AiOutlineBook className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-bold text-white">
              {mode === "edit" ? "Edit Tutorial" : "Create Tutorial"}
            </h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-800 transition-colors">
            <AiOutlineClose className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-6">
          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-2 md:col-span-2">
              <span className="block text-sm font-medium text-slate-300">Title</span>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Status</span>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="unpublished">Unpublished</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Platform</span>
              <input
                type="text"
                name="platform"
                value={formData.platform}
                onChange={handleChange}
                placeholder="delightex, thinglink"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Category</span>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Type</span>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                <option value="mission">Mission</option>
                <option value="video">Video</option>
                <option value="article">Article</option>
                <option value="link">Link</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Order</span>
              <input
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Core Skill</span>
              <input
                type="text"
                name="coreSkill"
                value={formData.coreSkill}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Duration</span>
              <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="Self-paced, 12:45"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Gradient</span>
              <select
                name="gradient"
                value={formData.gradient}
                onChange={handleChange}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              >
                {gradients.map((gradient) => (
                  <option key={gradient.id} value={gradient.id}>
                    {gradient.name}
                  </option>
                ))}
              </select>
            </label>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Slug</span>
              <input
                type="text"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder={generatedSlug || "generated-from-title"}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>

            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Resource URL</span>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://..."
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>

            <label className="space-y-2 md:col-span-2">
              <span className="block text-sm font-medium text-slate-300">Thumbnail URL</span>
              <input
                type="url"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="Optional image URL"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>
          </section>

          <label className="space-y-2 block">
            <span className="block text-sm font-medium text-slate-300">Description</span>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={3}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </label>

          <label className="space-y-2 block">
            <span className="block text-sm font-medium text-slate-300">Outcome</span>
            <textarea
              name="outcome"
              value={formData.outcome}
              onChange={handleChange}
              rows={2}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            />
          </label>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-white font-semibold">Steps</h3>
              <button
                type="button"
                onClick={addStep}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                <AiOutlinePlus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            {formData.steps.map((step, index) => (
              <div key={index} className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-300">Step {index + 1}</span>
                  {formData.steps.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeStep(index)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-red-300"
                      aria-label="Remove step"
                    >
                      <AiOutlineDelete className="w-4 h-4" />
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStep(index, "title", e.target.value)}
                  placeholder="Step title"
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <textarea
                  value={step.body}
                  onChange={(e) => updateStep(index, "body", e.target.value)}
                  placeholder="Step instructions"
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
                <textarea
                  value={step.code}
                  onChange={(e) => updateStep(index, "code", e.target.value)}
                  placeholder="Optional code example"
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-cyan-100 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                />
              </div>
            ))}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Success Checks</span>
              <textarea
                name="successChecksText"
                value={formData.successChecksText}
                onChange={handleChange}
                rows={5}
                placeholder="One item per line"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">What Learners Learn</span>
              <textarea
                name="learnedText"
                value={formData.learnedText}
                onChange={handleChange}
                rows={5}
                placeholder="One item per line"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>
            <label className="space-y-2">
              <span className="block text-sm font-medium text-slate-300">Assessment Criteria</span>
              <textarea
                name="assessmentCriteriaText"
                value={formData.assessmentCriteriaText}
                onChange={handleChange}
                rows={5}
                placeholder="One item per line"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
              />
            </label>
          </section>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 rounded-lg border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 font-semibold hover:opacity-90 transition-opacity"
            >
              {mode === "edit" ? "Save Changes" : "Create Tutorial"}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TutorialModal;
