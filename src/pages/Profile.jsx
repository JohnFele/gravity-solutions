import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { 
  AiOutlineEdit, 
  AiOutlineSave, 
  AiOutlineMenu, 
  AiOutlineClose, 
  AiOutlineCamera, 
  AiOutlineLock, 
  AiOutlineUser, 
  AiOutlineInfoCircle,
  AiOutlineWarning, 
  // AiOutlineLogout 
} from "react-icons/ai";
import { FiTrendingUp } from "react-icons/fi";
import { FaCheckCircle, FaEnvelope } from 'react-icons/fa'
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import { BiChevronLeft } from "react-icons/bi";
import {  updateUserProfile } from "../api/user";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";


const validateUsername = (username) => {
  const pattern = /^[a-zA-Z0-9_]{3,}$/;
  return pattern.test(username);
};

const validatePassword = (password) => {
  const pattern = /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@$!%*?&#]).{8,}$/;
  return pattern.test(password);
};

const validateImage = (file) => {
  if (!file) return true;
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  const isImage = validTypes.includes(file.type);
  const isSizeValid = file.size <= 2 * 1024 * 1024; // 2MB
  return isImage && isSizeValid;
};

const validateBio = (bio) => {
  const pattern = /^[a-zA-Z0-9_]{3,}$/; // Only letters, numbers, and underscores
  return bio.length <= 160 && pattern.test(bio);
};

const Profile = () => {
  const { showAlert } = useAlert();
  const navigate = useNavigate();
  const { profileData, setProfileData, isLoading, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [fieldErrors, setFieldErrors] = useState({
    userName: "",
    profilePicture: "",
    bio: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Form state
  const [formData, setFormData] = useState(profileData || {
    userName: "",
    firstName: "",
    lastName: "",
    email: "",
    profilePicture: "",
    bio: "",
    plan: "",
    isEmailVerified: "",
    creationsCount: 0,
  });

  useState(() => {
    if (profileData) {
      setFormData(profileData);
    }
  }, [profileData]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case 'username':
        if (value && !validateUsername(value)) {
          error = "Username must be at least 3 characters and contain only letters, numbers, and underscores";
        }
        break;
      case 'newPassword':
        if (value && !validatePassword(value)) {
          error = "Password must be at least 8 characters and include uppercase, lowercase, number, and special character";
        }
        break;
      case 'confirmPassword':
        if (value && formData.newPassword && value !== formData.newPassword) {
          error = "Passwords do not match";
        }
        break;
      case 'bio':
        if (value && !validateBio(value)) {
          error = "Bio must be at most 160 characters";
        }
        break;
      default:
        break;
    }
    
    setFieldErrors(prev => ({ ...prev, [name]: error }));
    return !error;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (isEditing) {
      validateField(name, value);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!validateImage(file)) {
        setFieldErrors(prev => ({ ...prev, profilePicture: "Invalid image file. Must be JPEG, PNG, GIF, or WEBP and less than 2MB." }));
        return;
      }
      setFieldErrors(prev => ({ ...prev, profilePicture: "" }));
      const reader = new FileReader();
      reader.onload = () => {
        setFormData(prev => ({ ...prev, profilePicture: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    const hasErrors = Object.values(fieldErrors).some(error => error);
    if (hasErrors) {
      showAlert("Please fix the errors before saving!", {
        type: "warning",
        duration: 5000
      });
      return;
    }

    if(formData.newPassword && !formData.currentPassword) {
      setFieldErrors(prev => ({ ...prev, currentPassword: "Current password is required to change the password." }));
      return;
    }
    try {
      const response = await updateUserProfile(formData);
      if (response.success) {
        setProfileData(response.data);
        setFormData(response.data);
        showAlert("Profile updated successfully!", {
          type: "info",
          duration: 5000
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem("authToken");
    try {
      await logout();
      showAlert("Logged out successfully!", {
        type: "info",
        duration: 5000
      })
    } catch (error) {
      console.error("Error signing out:", error);
      showAlert("Error signing out. Please try again.", {
        type: "error",
        duration: 5000
      })
    }
  };

  const handleDeleteAccount = () => {
    showAlert("Are you sure you want to delete your account? This action cannot be undone.", {
      type: "warning",
      actionText: "Delete Account",
      onAction: () => handleLogout(),
      duration: 5000,
    })
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Mobile Menu Button */}
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-2 right-4 z-50 md:hidden bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl text-white shadow-lg"
        >
          {mobileMenuOpen ? (
            <BiChevronLeft size={20} />
          ) : (
            <AiOutlineMenu size={20} />
          )}
        </motion.button>
      )}

      <Sidebar
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        handleSignOut={handleLogout}
        userRole={profileData?.role}
      />

      {/* Main Content */}
      <div
        className={`transition-all duration-300 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
        }`}
      >
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        {/* Profile Content */}
        <div className="p-4 md:p-6 md:pl-4 space-y-6">
          {/* Profile Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <h1 className="text-2xl md:text-3xl font-bold text-white w-1/2">Profile Settings</h1>
            {isEditing ? (
              <div className="flex space-x-4 mt-4 md:mt-0">
                {/* Cancel Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setFormData(profileData);
                    setIsEditing(false);
                  }}
                  className="flex items-center justify-evenly bg-gradient-to-r from-primary to-red-600 text-white px-4 py-2 rounded-xl font-medium w-full mt-4 md:mt-0 md:auto"
                >
                  <AiOutlineClose className="w-5 h-5" />
                  <span>Cancel</span>
                </motion.button>
                {/* Save Button */}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="flex items-center justify-evenly space-x-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl font-medium w-full mt-4 md:mt-0 md:w-auto"
                >
                  <AiOutlineSave className="w-5 h-5" />
                  <span>Save Changes</span>
                </motion.button>
              </div>
              
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsEditing(true)}
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl font-medium w-full mt-4 md:mt-0 md:auto"
              >
                <AiOutlineEdit className="w-5 h-5" />
                <span>Edit Profile</span>
              </motion.button>
            )}
          </motion.div>

          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden"
          >
            <div className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row gap-8">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center space-y-4 w-full md:w-1/3">
                  <div className="relative group">
                    {isLoading ? (
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 bg-slate-700/50 animate-pulse rounded-full border-4 border-primary">
                        <AiOutlineUser className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-slate-400 absolute inset-0 m-auto" />
                      </div>
                    ) : (
                    <>
                      <div className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border-4 border-primary overflow-hidden">
                        {formData.profilePicture && isEditing ? (
                          <img
                            src={formData.profilePicture}
                            alt="Profile Picture"
                            className="w-full h-full object-cover"
                          />
                        ) : profileData.profilePicture ? (
                          <img
                            src={profileData.profilePicture}
                            alt="Profile Picture"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-slate-700/50 flex items-center justify-center">
                            <AiOutlineUser className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 text-slate-400 absolute inset-0 m-auto" />
                          </div>
                        )}
                      </div>
                        {isEditing && (
                          <>
                            <label
                              htmlFor="profile-picture"
                              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                            >
                              <AiOutlineCamera className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </label>
                            <input
                              id="profile-picture"
                              type="file"
                              accept="image/*"
                              onChange={handleFileChange}
                              className="hidden"
                            />
                            {isEditing && fieldErrors.profilePicture && (
                              <p className="text-red-400 text-xs mt-1">
                                <AiOutlineWarning className="mr-1" />
                                {fieldErrors.profilePicture}
                              </p>
                            )}
                          </>
                        )}
                    </>
                    )}
                  </div>

                  <div className="text-center w-full">
                    {isLoading ? (
                      <>
                        <div className="h-6 w-32 bg-slate-700/50 animate-pulse rounded-lg mx-auto"></div>
                        <div className="h-4 w-24 bg-slate-700/50 animate-pulse rounded-lg mt-2 mx-auto"></div>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-white">
                          {profileData.firstName} {profileData.lastName}
                        </h2>
                        <p className="text-slate-400">@{profileData.userName}</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Profile Details Section */}
                <div className="w-full lg:w-2/3 space-y-6">
                  {/* Bio */}
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <AiOutlineInfoCircle className="mr-2" />
                      Bio
                    </h3>

                    {isLoading ? (
                      <div className="h-12 w-full bg-slate-700/50 animate-pulse rounded-lg"></div>
                    ) : isEditing ? (
                      <>
                        <textarea
                          name="bio"
                          value={formData.bio}
                          placeholder="Tell us about yourself"
                          onChange={handleInputChange}
                          rows="3"
                          className="w-full bg-slate-700/50 border resize-none border-slate-600 rounded-lg px-3 py-2 text-white"
                        />
                        {fieldErrors.bio && (
                          <p className="text-red-400 text-xs mt-1 focus-red-500">
                            <AiOutlineWarning className="mr-1" />
                            {fieldErrors.bio}
                          </p>
                        )}
                      </>
                    ) : (
                      <p className="text-slate-300">{profileData.bio}</p>
                    )}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-slate-400 text-sm">Creations</p>
                      {isLoading ? (
                        <div className="h-5 w-16 bg-slate-700/50 animate-pulse rounded-lg"></div>
                      ) : (
                      <p className="text-lg font-bold mt-1 text-white">{profileData.creationsCount}</p>
                      )}
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-slate-400 text-sm">Membership</p>
                      {isLoading ? (
                        <div className="h-5 w-32 bg-slate-700/50 animate-pulse rounded-lg"></div>
                      ) : isEditing ? (
                        profileData.plan === "Aspiring ULinker" ? (
                          <Link
                            to="/upgrade"
                            className="text-md font-bold text-primary hover:underline mt-2 inline-block"
                          >
                            Become a ULinker
                          </Link>
                        ) : (
                          <p className="text-md font-bold mt-2 text-white">{profileData.plan}</p>
                        )
                      ) : (
                        <p className="text-md font-bold mt-1 text-white">{profileData.plan}</p>
                      )}
                    </div>
                    <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-700/50">
                      <p className="text-slate-400 text-sm">Engagement</p>
                      {isLoading ? (
                        <div className="h-5 w-20 bg-slate-700/50 animate-pulse rounded-lg"></div>
                      ) : (
                        // <p className="text-lg font-bold mt-1 text-white">{profileData.engagementRate}%</p>
                        <p className="text-lg font-bold mt-1 text-white flex items-center">
                          <FiTrendingUp className="text-emerald-500 mr-1" />
                          68%
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Account Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-white mb-2 flex items-center">
                      <AiOutlineUser className="mr-2" />
                      Account Details
                    </h3>
                    <div className="space-y-3">
                      {/* Username field */}
                      <div> 
                        <label className="block text-slate-400 text-sm mb-1">Username</label>
                        {isLoading ? (
                          <div className="h-9 w-48 bg-slate-700/50 animate-pulse rounded-lg"></div>
                        ) : isEditing ? (
                          <>
                            <input
                              type="text"
                              name="username"
                              placeholder={profileData.userName}
                              value={formData.userName}
                              onChange={handleInputChange}
                              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                            />
                            {fieldErrors.userName && (
                              <p className="text-red-400 text-xs mt-1">
                                <AiOutlineWarning className="mr-1" />
                                {fieldErrors.userName}
                              </p>
                            )}
                          </>
                        ) : (
                          <p className="text-white">{profileData.userName}</p>
                        )}
                      </div>

                      {!profileData.isEmailVerified && !isLoading && (
                        <div className="mt-4">
                          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
                            <div className="flex items-start">
                              <FaEnvelope className="text-orange-400 mt-0.5 mr-2 flex-shrink-0" />
                              <div>
                                <p className="text-sm font-medium text-orange-300">Email not verified</p>
                                <p className="text-xs text-orange-400/80 mt-1">
                                  Please verify your email to access all features
                                </p>
                                <motion.button
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={() => navigate('/verify-email')}
                                  className="mt-2 text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg font-medium"
                                >
                                  Verify Email
                                </motion.button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Password fields */}
                      {isEditing && !isLoading && profileData.isEmailVerified && (
                        <div>
                          <label className="text-slate-400 text-sm mb-1 flex items-center">
                            <AiOutlineLock className="mr-1" />
                            Change Password
                          </label>
                          <input
                            type="password"
                            placeholder="Current password"
                            name="currentPassword"
                            value={formData.currentPassword || ""}
                            onChange={handleInputChange}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white mb-2"
                          />
                          {fieldErrors.currentPassword && (
                            <p className="text-red-400 text-xs mb-2">
                              <AiOutlineWarning className="mr-1" />
                              {fieldErrors.currentPassword}
                            </p>
                          )}

                          <input
                            type="password"
                            placeholder="New password"
                            name="newPassword"
                            value={formData.newPassword || ""}
                            onChange={handleInputChange}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white mb-2"
                          />
                          {fieldErrors.newPassword && (
                            <p className="text-red-400 text-xs mb-2">
                              <AiOutlineWarning className="mr-1" />
                              {fieldErrors.newPassword}
                            </p>
                          )}

                          <input
                            type="password"
                            placeholder="Confirm new password"
                            name="confirmPassword"
                            value={formData.confirmPassword || ""}
                            onChange={handleInputChange}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                          />
                          {fieldErrors.confirmPassword && (
                            <p className="text-red-400 text-xs mt-1">
                              <AiOutlineWarning className="mr-1" />
                              {fieldErrors.confirmPassword}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border-t border-slate-700/50 p-6 bg-slate-800/30">
              <h3 className="text-lg font-semibold text-red-400 mb-4">Danger Zone</h3>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <p className="text-slate-300">Delete your account permanently</p>
                  <p className="text-slate-500 text-sm">This action cannot be undone</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleDeleteAccount}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl font-medium"
                >
                  Delete Account
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
