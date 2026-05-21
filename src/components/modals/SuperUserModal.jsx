import { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  FiArrowLeft,
  FiAward,
  FiCalendar,
  FiCheck,
  FiEdit2,
  FiMail,
  FiSave,
  FiTrash2,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useAlert } from '../../context/AlertContext';
import { useScrollLock } from '../../hooks/useScrollLock';
import {
  getUserById,
  permanentlyDeleteUser,
  restoreUser,
  softDeleteUser,
  updateUserDetails,
} from '../../api/admin';

const ROLE_OPTIONS = ['user', 'Teacher', 'Admin'];
const PLAN_OPTIONS = ['Aspiring ULinker', 'ULinker', 'Admin'];

const emptyForm = {
  firstName: '',
  lastName: '',
  userName: '',
  email: '',
  role: 'user',
  plan: 'Aspiring ULinker',
  bio: '',
  profilePicture: '',
  isEmailVerified: false,
};

const SuperUserModal = ({ userId, currentUserEmail, onClose, onUserUpdated }) => {
  useScrollLock(true);

  const { showAlert } = useAlert();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isSelf = useMemo(
    () => String(user?.email || '').toLowerCase() === String(currentUserEmail || '').toLowerCase(),
    [currentUserEmail, user?.email]
  );

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getUserById(userId);
        const nextUser = response.data;
        setUser(nextUser);
        setFormData({
          firstName: nextUser.firstName || '',
          lastName: nextUser.lastName || '',
          userName: nextUser.userName || '',
          email: nextUser.email || '',
          role: nextUser.role || 'user',
          plan: nextUser.plan || 'Aspiring ULinker',
          bio: nextUser.bio || '',
          profilePicture: nextUser.profilePicture || '',
          isEmailVerified: Boolean(nextUser.isEmailVerified),
        });
      } catch (error) {
        showAlert(error?.message || 'Failed to load user data', { type: 'error' });
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [onClose, showAlert, userId]);

  const handleFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const response = await updateUserDetails(userId, formData);
      setUser(response.data);
      setFormData({
        firstName: response.data.firstName || '',
        lastName: response.data.lastName || '',
        userName: response.data.userName || '',
        email: response.data.email || '',
        role: response.data.role || 'user',
        plan: response.data.plan || 'Aspiring ULinker',
        bio: response.data.bio || '',
        profilePicture: response.data.profilePicture || '',
        isEmailVerified: Boolean(response.data.isEmailVerified),
      });
      showAlert('User updated successfully', { type: 'success' });
      onUserUpdated?.();
    } catch (error) {
      showAlert(error?.message || 'Failed to update user', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleToggleDelete = async () => {
    try {
      if (user.deleted) {
        await restoreUser(userId);
        setUser((prev) => ({ ...prev, deleted: false }));
        showAlert('User restored successfully', { type: 'success' });
      } else {
        await softDeleteUser(userId);
        setUser((prev) => ({ ...prev, deleted: true }));
        showAlert('User soft deleted successfully', { type: 'success' });
      }
      onUserUpdated?.();
    } catch (error) {
      showAlert(error?.message || 'Failed to update user status', { type: 'error' });
    }
  };

  const confirmToggleDelete = () => {
    showAlert(
      user?.deleted
        ? 'Are you sure you want to restore this user account?'
        : 'Are you sure you want to soft delete this user account?',
      {
        type: 'warning',
        actionText: user?.deleted ? 'Restore' : 'Delete',
        onAction: handleToggleDelete,
        duration: 5000,
        position: 'top-center',
      }
    );
  };

  const handlePermanentDelete = async () => {
    try {
      await permanentlyDeleteUser(userId);
      showAlert('User permanently deleted', { type: 'success' });
      onUserUpdated?.();
      onClose();
    } catch (error) {
      showAlert(error?.message || 'Failed to permanently delete user', { type: 'error' });
    }
  };

  const confirmPermanentDelete = () => {
    showAlert('Are you sure you want to permanently delete this user account? This cannot be undone.', {
      type: 'warning',
      actionText: 'Delete Permanently',
      onAction: handlePermanentDelete,
      duration: 6000,
      position: 'top-center',
    });
  };

  const getRoleBadge = (role) => {
    const roles = {
      admin: { color: 'bg-purple-500/20 text-purple-400', label: 'Admin' },
      teacher: { color: 'bg-green-500/20 text-green-400', label: 'Teacher' },
      user: { color: 'bg-gray-500/20 text-gray-400', label: 'User' },
    };

    const normalizedRole = String(role || '').toLowerCase();

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roles[normalizedRole]?.color || 'bg-gray-500/20 text-gray-400'}`}>
        {roles[normalizedRole]?.label || role}
      </span>
    );
  };

  const getStatusBadge = (deleted, verified) => {
    if (deleted) {
      return (
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-500/20 text-red-400">
          Deleted
        </span>
      );
    }

    return verified ? (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
        Verified
      </span>
    ) : (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-500/20 text-yellow-400">
        Unverified
      </span>
    );
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          className="bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 max-w-md w-full"
        >
          <div className="text-white text-center">Loading user data...</div>
        </motion.div>
      </motion.div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-5xl max-h-[90vh] overflow-y-auto"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 bg-slate-800/90 backdrop-blur-xl z-10 p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white">
              <FiEdit2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Super User Editor</h2>
              <p className="text-sm text-slate-400">Full account controls for this user</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-slate-700/50 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {formData.profilePicture ? (
                    <img
                      src={formData.profilePicture}
                      alt="Profile"
                      className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-slate-700 flex items-center justify-center border-2 border-primary">
                      <FiUser className="text-slate-400" size={28} />
                    </div>
                  )}
                </div>
                <h3 className="text-lg md:text-xl font-bold text-white text-center">
                  {formData.firstName} {formData.lastName}
                </h3>
                <p className="text-slate-400 text-center text-sm md:text-base">@{formData.userName}</p>
                <div className="mt-3 flex flex-wrap justify-center gap-2">
                  {getRoleBadge(formData.role)}
                  {getStatusBadge(user.deleted, formData.isEmailVerified)}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FiMail className="text-slate-400 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white text-sm md:text-base break-all">{formData.email}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiAward className="text-slate-400 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-slate-400">Plan</p>
                    <p className="text-white text-sm md:text-base">{formData.plan}</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <FiCalendar className="text-slate-400 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-slate-400">Joined</p>
                    <p className="text-white text-sm md:text-base">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 rounded-md text-white flex items-center justify-center text-sm disabled:opacity-70"
                >
                  <FiSave className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  onClick={confirmToggleDelete}
                  className={`px-4 py-2 rounded-md text-white flex items-center justify-center text-sm ${
                    user.deleted
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90'
                      : 'bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90'
                  }`}
                >
                  {user.deleted ? (
                    <>
                      <FiCheck className="mr-2" /> Restore User
                    </>
                  ) : (
                    <>
                      <FiTrash2 className="mr-2" /> Soft Delete User
                    </>
                  )}
                </button>
                <button
                  onClick={confirmPermanentDelete}
                  disabled={isSelf}
                  className="px-4 py-2 bg-slate-950 hover:bg-black rounded-md text-red-300 border border-red-500/40 flex items-center justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiTrash2 className="mr-2" /> Permanently Delete
                </button>
                {isSelf && (
                  <p className="text-xs text-slate-400 text-center">
                    Permanent self-delete is blocked.
                  </p>
                )}
              </div>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Editable Account Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-400">First Name</span>
                    <input
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleFieldChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-400">Last Name</span>
                    <input
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleFieldChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-400">Username</span>
                    <input
                      name="userName"
                      value={formData.userName}
                      onChange={handleFieldChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-400">Email</span>
                    <input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleFieldChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-400">Role</span>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleFieldChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {ROLE_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm text-slate-400">Plan</span>
                    <select
                      name="plan"
                      value={formData.plan}
                      onChange={handleFieldChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      {PLAN_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-slate-400">Profile Picture URL</span>
                    <input
                      name="profilePicture"
                      value={formData.profilePicture}
                      onChange={handleFieldChange}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </label>
                  <label className="space-y-2 md:col-span-2">
                    <span className="text-sm text-slate-400">Bio</span>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleFieldChange}
                      rows="4"
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </label>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Verification and Metadata</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center justify-between bg-slate-700/20 p-4 rounded-lg">
                    <div>
                      <p className="text-sm text-slate-400">Email Verified</p>
                      <p className="text-white font-medium">
                        {formData.isEmailVerified ? 'Verified' : 'Not Verified'}
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      name="isEmailVerified"
                      checked={formData.isEmailVerified}
                      onChange={handleFieldChange}
                      className="h-5 w-5 rounded border-slate-500 bg-slate-800 text-orange-500 focus:ring-orange-500"
                    />
                  </label>
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Google Account</p>
                    <p className="text-white font-medium">{user.isGoogleUser ? 'Yes' : 'No'}</p>
                  </div>
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Creations</p>
                    <p className="text-white font-medium text-2xl">{user.creationsCount || 0}</p>
                  </div>
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Last Updated</p>
                    <p className="text-white font-medium">
                      {new Date(user.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-md text-white flex items-center justify-center text-sm"
                >
                  <FiX className="mr-2" /> Close
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 rounded-md text-white flex items-center justify-center text-sm disabled:opacity-70"
                >
                  <FiSave className="mr-2" /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SuperUserModal;
