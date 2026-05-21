import { useState, useEffect } from 'react';
import { FiUser, FiMail, FiCalendar, FiAward, FiEdit2, FiTrash2, FiArrowLeft, FiCheck, FiX } from 'react-icons/fi';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { useAlert } from '../../context/AlertContext';
import { getUserById, updateUserRole, softDeleteUser, restoreUser } from '../../api/admin';
import { useScrollLock } from '../../hooks/useScrollLock';

const ViewUserModal = ({ userId, onClose }) => {
  useScrollLock(true);
  const { showAlert } = useAlert();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getUserById(userId);
        setUser(response.data);
      } catch (error) {
        showAlert('Failed to load user data', { type: 'error' });
        console.error(error);
        onClose();
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleRoleChange = async (newRole) => {
    try {
      await updateUserRole(userId, newRole);
      setUser(prev => ({ ...prev, role: newRole }));
      showAlert('User role updated successfully', { type: 'success' });
      setEditing(false);
    } catch (error) {
      showAlert('Failed to update user role', { type: 'error' });
      console.error(error);
    }
  };

  const handleToggleDelete = async () => {
    try {
      if (user.deleted) {
        await restoreUser(userId);
        setUser(prev => ({ ...prev, deleted: false }));
        showAlert('User account restored', { type: 'success' });
      } else {
        await softDeleteUser(userId);
        setUser(prev => ({ ...prev, deleted: true }));
        showAlert('User account soft deleted', { type: 'success' });
      }
    } catch (error) {
      showAlert('Failed to update user status', { type: 'error' });
      console.error(error);
    }
  };

  const toggleDelete = () => {
    if (user.deleted) {
      showAlert('Are you sure you want to restore this user account?', {
        type: 'warning',
        actionText: 'Restore',
        onAction: handleToggleDelete,
        duration: 5000,
        position: 'top-center'
      });
    } else {
      showAlert('Are you sure you want to delete this user account?', {
        type: 'warning',
        actionText: 'Delete',
        onAction: handleToggleDelete,
        duration: 5000,
        position: 'top-center'
      });
    }
  }

  const getRoleBadge = (role) => {
    const roles = {
      admin: { color: 'bg-purple-500/20 text-purple-400', label: 'Admin' },
      teacher: { color: 'bg-green-500/20 text-green-400', label: 'Teacher' },
      user: { color: 'bg-gray-500/20 text-gray-400', label: 'User' }
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roles[role.toLowerCase()]?.color || 'bg-gray-500/20 text-gray-400'}`}>
        {roles[role.toLowerCase()]?.label || role}
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
          <div className="text-white text-center">User not found</div>
          <button 
            onClick={onClose}
            className="mt-4 w-full py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-md text-white"
          >
            Close
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700/50 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 bg-slate-800/90 backdrop-blur-xl z-10 p-4 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 text-white">
              <FiUser className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-bold text-white">
              User Details
            </h2>
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
            {/* User Profile Card */}
            <div className="lg:col-span-1 bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  {user.profilePicture ? (
                    <img 
                      src={user.profilePicture} 
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
                  {user.firstName} {user.lastName}
                </h3>
                <p className="text-slate-400 text-center text-sm md:text-base">@{user.userName}</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center">
                  <FiMail className="text-slate-400 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-slate-400">Email</p>
                    <p className="text-white text-sm md:text-base break-all">{user.email}</p>
                  </div>
                </div>

                <div className="flex items-center my-4">
                  <FiAward className="text-slate-400 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-slate-400">Role</p>
                    {editing ? (
                      <select
                        value={user.role}
                        onChange={(e) => setUser({...user, role: e.target.value})}
                        className="bg-slate-700/50 border border-slate-600 rounded-md px-2 py-1 text-white text-sm md:text-base w-full mt-1"
                      >
                        <option value="user">User</option>
                        <option value="Ulinker">Ulinker</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <div className="mt-1">{getRoleBadge(user.role)}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center my-4">
                  <FiCalendar className="text-slate-400 mr-3 w-5 h-5" />
                  <div>
                    <p className="text-sm text-slate-400">Joined</p>
                    <p className="text-white text-sm md:text-base">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center my-4">
                  <div className="w-5 mr-3 flex justify-center">
                    {user.deleted ? (
                      <FiTrash2 className="text-red-400 w-4 h-4" />
                    ) : (
                      <FiCheck className="text-green-400 w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm text-slate-400">Status</p>
                    <div className="mt-1">{getStatusBadge(user.deleted, user.isEmailVerified)}</div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                {editing ? (
                  <>
                    <button
                      onClick={() => handleRoleChange(user.role)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white flex items-center justify-center text-sm"
                    >
                      <FiCheck className="mr-2" /> Save
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 rounded-md text-white flex items-center justify-center text-sm"
                    >
                      <FiX className="mr-2" /> Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 rounded-md text-white flex items-center justify-center text-sm"
                    >
                      <FiEdit2 className="mr-2" /> Edit
                    </button>
                    <button
                      onClick={toggleDelete}
                      className={`px-4 py-2 rounded-md text-white flex items-center justify-center text-sm ${
                        user.deleted 
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:opacity-90' 
                          : 'bg-gradient-to-r from-red-600 to-red-800 hover:opacity-90'
                      }`}
                    >
                      {user.deleted ? (
                        <>
                          <FiUser className="mr-2" /> Restore
                        </>
                      ) : (
                        <>
                          <FiTrash2 className="mr-2" /> Delete
                        </>
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* User Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Account Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Email Verification</p>
                    <p className="text-white font-medium">
                      {user.isEmailVerified ? 'Verified' : 'Not Verified'}
                    </p>
                  </div>
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Account Type</p>
                    <p className="text-white font-medium">{user.plan || 'Basic'}</p>
                  </div>
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Google Account</p>
                    <p className="text-white font-medium">
                      {user.isGoogleUser ? 'Yes' : 'No'}
                    </p>
                  </div>
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Last Updated</p>
                    <p className="text-white font-medium">
                      {new Date(user.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">User Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Creations</p>
                    <p className="text-white font-medium text-2xl">{user.creationsCount || 0}</p>
                  </div>
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Active Since</p>
                    <p className="text-white font-medium">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className="bg-slate-700/20 p-4 rounded-lg">
                    <p className="text-sm text-slate-400">Account Age</p>
                    <p className="text-white font-medium">
                      {Math.floor((new Date() - new Date(user.createdAt)) / (1000 * 60 * 60 * 24))} days
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">Bio</h3>
                <p className="text-white">
                  {user.bio || 'No bio provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ViewUserModal;