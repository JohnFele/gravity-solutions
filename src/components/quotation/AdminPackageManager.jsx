import { useMemo, useState } from 'react';
import { useEffect } from 'react';
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
import { FiPackage } from 'react-icons/fi';
import { useQuotation } from '../../context/QuotationContext';
import { useAlert } from '../../context/AlertContext';

const initialFormState = {
  name: '',
  description: '',
  headsetCount: 1,
  basePrice: '',
  features: [''],
  includedAddOnKeys: [],
  isPublished: true,
  popular: false,
  isCustom: false,
};

const AdminPackageManager = ({ searchQuery = '', activeCategory = 'all', sortBy = 'name-asc' }) => {
  const {
    packages,
    addOnProducts,
    packagesLoading,
    loadPackages,
    savePackage,
    removePackage,
    togglePackagePublish,
  } = useQuotation();
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

  const handleFeatureChange = (index, value) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.map((feature, featureIndex) =>
        featureIndex === index ? value : feature
      ),
    }));
  };

  const addFeature = () => {
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, ''],
    }));
  };

  const removeFeature = (index) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, featureIndex) => featureIndex !== index),
    }));
  };

  const handleEdit = (pkg) => {
    setFormData({
      name: pkg.name,
      description: pkg.description,
      headsetCount: pkg.headsetCount || 1,
      basePrice: pkg.basePrice,
      features: pkg.features?.length ? pkg.features : [''],
      includedAddOnKeys: pkg.includedAddOnKeys || [],
      isPublished: pkg.isPublished !== false,
      popular: Boolean(pkg.popular),
      isCustom: Boolean(pkg.isCustom),
    });
    setEditingId(pkg.id);
    setIsAdding(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.description || !formData.basePrice) {
      showAlert('Please fill in all required package fields', { type: 'warning', duration: 3000 });
      return;
    }

    setIsSaving(true);
    try {
      await savePackage(
        {
          ...formData,
          basePrice: Number(formData.basePrice),
          headsetCount: Number(formData.headsetCount) || 1,
          features: formData.features.filter((feature) => String(feature).trim() !== ''),
          includedAddOnKeys: formData.includedAddOnKeys,
        },
        editingId
      );

      showAlert(editingId ? 'Package updated successfully' : 'Package created successfully', {
        type: 'success',
        duration: 3000,
      });
      await loadPackages({ search: searchQuery.trim() });
      resetForm();
    } catch (error) {
      showAlert(error?.message || 'Failed to save package', { type: 'error', duration: 5000 });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id) => {
    showAlert('Are you sure you want to delete this package?', {
      type: 'warning',
      actionText: 'Delete',
      duration: 5000,
      onAction: async () => {
        try {
          await removePackage(id);
          await loadPackages({ search: searchQuery.trim() });
          showAlert('Package deleted successfully', { type: 'success', duration: 3000 });
        } catch (error) {
          showAlert(error?.message || 'Failed to delete package', { type: 'error', duration: 5000 });
        }
      },
    });
  };

  const handleTogglePublish = async (id) => {
    try {
      await togglePackagePublish(id);
      await loadPackages({ search: searchQuery.trim() });
      showAlert('Package visibility updated', { type: 'success', duration: 3000 });
    } catch (error) {
      showAlert(error?.message || 'Failed to update package visibility', {
        type: 'error',
        duration: 5000,
      });
    }
  };

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadPackages({ search: searchQuery.trim() });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [loadPackages, searchQuery]);

  const filteredPackages = useMemo(() => {
    const nextPackages = packages.filter((pkg) => {
      switch (activeCategory) {
        case 'published':
          return pkg.isPublished !== false;
        case 'unpublished':
          return pkg.isPublished === false;
        case 'popular':
          return Boolean(pkg.popular);
        case 'custom':
          return Boolean(pkg.isCustom);
        default:
          return true;
      }
    });

    return [...nextPackages].sort((left, right) => {
      switch (sortBy) {
        case 'name-desc':
          return String(right.name || '').localeCompare(String(left.name || ''));
        case 'price-low':
          return Number(left.basePrice || 0) - Number(right.basePrice || 0);
        case 'price-high':
          return Number(right.basePrice || 0) - Number(left.basePrice || 0);
        case 'headsets-high':
          return Number(right.headsetCount || 0) - Number(left.headsetCount || 0);
        case 'headsets-low':
          return Number(left.headsetCount || 0) - Number(right.headsetCount || 0);
        case 'name-asc':
        default:
          return String(left.name || '').localeCompare(String(right.name || ''));
      }
    });
  }, [activeCategory, packages, sortBy]);
  const availableAddOns = useMemo(() => addOnProducts, [addOnProducts]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center text-xl font-bold text-white">
          <FiPackage className="mr-2 text-purple-400" />
          Manage Packages
        </h2>
        <button
          type="button"
          onClick={() => setIsAdding(true)}
          className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-all hover:shadow-lg"
        >
          <AiOutlinePlus />
          <span>Add Package</span>
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
                {editingId ? 'Edit Package' : 'New Package'}
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
                  <label className="mb-1 block text-sm text-slate-400">Base Price (ZAR) *</label>
                  <input
                    type="number"
                    name="basePrice"
                    value={formData.basePrice}
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
                  rows="2"
                  className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm text-slate-400">Headset Count</label>
                  <input
                    type="number"
                    name="headsetCount"
                    min="1"
                    value={formData.headsetCount}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-white"
                  />
                </div>
                <div className="flex items-center space-x-4 pt-6">
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
                      name="isCustom"
                      checked={formData.isCustom}
                      onChange={handleInputChange}
                    />
                    <span className="text-sm text-slate-300">Custom</span>
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
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">Features</label>
                <div className="space-y-2">
                  {formData.features.map((feature, index) => (
                    <div key={`${index}-${editingId || 'new'}`} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={feature}
                        onChange={(event) => handleFeatureChange(index, event.target.value)}
                        className="flex-1 rounded-lg border border-slate-600 bg-slate-700/50 px-3 py-2 text-sm text-white"
                      />
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-400 hover:text-red-300"
                      >
                        <AiOutlineDelete />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addFeature}
                    className="flex items-center text-sm text-emerald-400 hover:text-emerald-300"
                  >
                    <AiOutlinePlus className="mr-1" />
                    Add Feature
                  </button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-400">Included Add-ons</label>
                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  {availableAddOns.map((addOn) => {
                    const isChecked = formData.includedAddOnKeys.includes(addOn.id);
                    return (
                      <label
                        key={addOn.id}
                        className="flex items-center space-x-2 rounded-lg border border-slate-700/50 bg-slate-700/30 px-3 py-2 text-sm text-slate-200"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(event) => {
                            const checked = event.target.checked;
                            setFormData((prev) => ({
                              ...prev,
                              includedAddOnKeys: checked
                                ? [...prev.includedAddOnKeys, addOn.id]
                                : prev.includedAddOnKeys.filter((item) => item !== addOn.id),
                            }));
                          }}
                        />
                        <span>{addOn.name}</span>
                      </label>
                    );
                  })}
                </div>
                {!availableAddOns.length && (
                  <p className="text-sm text-slate-500">
                    Create add-ons first if you want to mark them as included in this package.
                  </p>
                )}
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
                  {isSaving ? 'Saving...' : 'Save Package'}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {packagesLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`package-skeleton-${index}`}
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
        {filteredPackages.map((pkg) => (
          <motion.div
            key={pkg.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-4"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="mb-1 flex items-center space-x-2">
                  <h3 className="font-medium text-white">{pkg.name}</h3>
                  {pkg.popular && (
                    <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-400">
                      Popular
                    </span>
                  )}
                  {!pkg.isPublished && (
                    <span className="rounded-full bg-slate-500/20 px-2 py-0.5 text-xs text-slate-400">
                      Unpublished
                    </span>
                  )}
                </div>
                <p className="mb-2 text-sm text-slate-400">{pkg.description}</p>
                <p className="text-sm font-medium text-white">R {Number(pkg.basePrice || 0).toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => handleTogglePublish(pkg.id)}
                  className="p-2 text-slate-400 transition-colors hover:text-emerald-400"
                  title={pkg.isPublished ? 'Unpublish' : 'Publish'}
                >
                  {pkg.isPublished ? <AiOutlineEye /> : <AiOutlineEyeInvisible />}
                </button>
                <button
                  type="button"
                  onClick={() => handleEdit(pkg)}
                  className="p-2 text-slate-400 transition-colors hover:text-blue-400"
                >
                  <AiOutlineEdit />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pkg.id)}
                  className="p-2 text-slate-400 transition-colors hover:text-red-400"
                >
                  <AiOutlineDelete />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
        {!filteredPackages.length && (
          <div className="rounded-xl border border-dashed border-slate-700/50 bg-slate-800/20 p-6 text-center">
            <p className="text-base text-slate-300">No packages match the current search.</p>
            <p className="mt-2 text-sm text-slate-500">
              Try another term or create a new package.
            </p>
          </div>
        )}
        </div>
      )}
    </div>
  );
};

export default AdminPackageManager;
