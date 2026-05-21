import { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  AiOutlinePlus,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineEye,
  AiOutlineEyeInvisible,
  AiOutlineClose,
  AiOutlineSave,
} from 'react-icons/ai';
import { FiGrid } from 'react-icons/fi';
import { useQuotation } from '../../context/QuotationContext';
import { useAlert } from '../../context/AlertContext';

const initialFormState = {
  name: '',
  category: 'App',
  price: '',
  description: '',
  unit: 'license',
  popular: false,
  isPublished: true,
};

const AdminAddOnManager = ({ searchQuery = '', activeCategory = 'all', sortBy = 'name-asc' }) => {
  const { addOnProducts, addOnsLoading, loadAddOns, saveAddOn, removeAddOn, toggleAddOnPublish } =
    useQuotation();
  const { showAlert } = useAlert();
  const [isSaving, setIsSaving] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(initialFormState);

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setIsAdding(false);
  };

  const handleInputChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      category: item.category || 'App',
      price: item.price,
      description: item.description,
      unit: item.unit,
      popular: Boolean(item.popular),
      isPublished: item.isPublished !== false,
    });
    setEditingId(item.id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.unit || !formData.price) {
      showAlert('Please fill in all required add-on fields', { type: 'warning', duration: 3000 });
      return;
    }

    setIsSaving(true);
    try {
      await saveAddOn(
        {
          ...formData,
          price: Number(formData.price),
        },
        editingId
      );
      await loadAddOns({ search: searchQuery.trim() });
      showAlert(editingId ? 'Add-on updated successfully' : 'Add-on created successfully', {
        type: 'success',
        duration: 3000,
      });
      resetForm();
    } catch (error) {
      showAlert(error?.message || 'Failed to save add-on', { type: 'error', duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    showAlert('Are you sure you want to delete this add-on?', {
      type: 'warning',
      actionText: 'Delete',
      duration: 5000,
      onAction: async () => {
        try {
          await removeAddOn(id);
          await loadAddOns({ search: searchQuery.trim() });
          showAlert('Add-on deleted successfully', { type: 'success', duration: 3000 });
        } catch (error) {
          showAlert(error?.message || 'Failed to delete add-on', { type: 'error', duration: 5000 });
        }
      },
    });
  };

  const handleTogglePublish = async (id) => {
    try {
      await toggleAddOnPublish(id);
      await loadAddOns({ search: searchQuery.trim() });
      showAlert('Add-on visibility updated', { type: 'success', duration: 3000 });
    } catch (error) {
      showAlert(error?.message || 'Failed to update add-on visibility', {
        type: 'error',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadAddOns({ search: searchQuery.trim() });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [loadAddOns, searchQuery]);

  const filteredAddOns = useMemo(() => {
    const nextAddOns = addOnProducts.filter((item) => {
      switch (activeCategory) {
        case 'published':
          return item.isPublished !== false;
        case 'unpublished':
          return item.isPublished === false;
        case 'popular':
          return Boolean(item.popular);
        case 'app':
        case 'license':
        case 'service':
        case 'hardware':
        case 'other':
          return String(item.category || '').toLowerCase() === activeCategory;
        default:
          return true;
      }
    });

    return [...nextAddOns].sort((left, right) => {
      switch (sortBy) {
        case 'name-desc':
          return String(right.name || '').localeCompare(String(left.name || ''));
        case 'price-low':
          return Number(left.price || 0) - Number(right.price || 0);
        case 'price-high':
          return Number(right.price || 0) - Number(left.price || 0);
        case 'category':
          return String(left.category || '').localeCompare(String(right.category || ''));
        case 'name-asc':
        default:
          return String(left.name || '').localeCompare(String(right.name || ''));
      }
    });
  }, [activeCategory, addOnProducts, sortBy]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center text-xl font-bold text-white">
          <FiGrid className="mr-2 text-purple-400" />
          Manage Add-ons
        </h2>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
        >
          <AiOutlinePlus />
          <span>Add Add-on</span>
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-xl border border-slate-700/50 bg-slate-800/50 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">
                {editingId ? 'Edit Add-on' : 'New Add-on'}
              </h3>
              <button type="button" onClick={resetForm} className="p-1 text-slate-400 hover:text-white">
                <AiOutlineClose />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Category</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                  >
                    <option value="App">App</option>
                    <option value="License">License</option>
                    <option value="Service">Service</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Price (ZAR) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Unit *</label>
                  <input
                    type="text"
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm text-slate-400">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                />
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="popular"
                    checked={formData.popular}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-slate-300">Popular</span>
                </label>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="isPublished"
                    checked={formData.isPublished}
                    onChange={handleInputChange}
                  />
                  <span className="text-sm text-slate-300">Published</span>
                </label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="rounded-lg bg-slate-700/50 px-4 py-2 text-slate-300 hover:bg-slate-700/70"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-white disabled:opacity-60"
                >
                  <AiOutlineSave className="mr-2" />
                  {isSaving ? 'Saving...' : 'Save Add-on'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {addOnsLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`addon-skeleton-${index}`}
              className="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
            >
              <div className="mb-3 h-4 w-1/3 rounded bg-slate-700" />
              <div className="mb-2 h-3 w-full rounded bg-slate-700" />
              <div className="h-3 w-1/4 rounded bg-slate-700" />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
        {filteredAddOns.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <h3 className="font-medium text-white">{item.name}</h3>
                  <span className="rounded-full bg-slate-700/70 px-2 py-0.5 text-xs text-slate-300">
                    {item.category}
                  </span>
                  {item.popular && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                      Popular
                    </span>
                  )}
                  {!item.isPublished && (
                    <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-xs text-slate-400">
                      Unpublished
                    </span>
                  )}
                </div>
                <p className="mb-2 text-sm text-slate-400">{item.description}</p>
                <p className="text-sm font-medium text-white">
                  R {Number(item.price || 0).toLocaleString()} / {item.unit}
                </p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(item.id)}
                  className="p-2 text-slate-400 transition-colors hover:text-emerald-400"
                  title={item.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {item.isPublished ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(item)}
                  className="p-2 text-slate-400 transition-colors hover:text-blue-400"
                >
                  <AiOutlineEdit />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-2 text-slate-400 transition-colors hover:text-red-400"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {!filteredAddOns.length && (
          <div className="rounded-xl border border-dashed border-slate-700/50 bg-slate-800/20 p-6 text-center">
            <p className="text-base text-slate-300">No add-ons match the current search.</p>
            <p className="mt-2 text-sm text-slate-500">
              Try another term or create a new add-on.
            </p>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default AdminAddOnManager;
