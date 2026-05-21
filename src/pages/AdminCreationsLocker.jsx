import { useState, useEffect, useCallback, useMemo } from "react";
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineLock,
  AiOutlineEdit,
  AiOutlineDelete,
  AiOutlineCloudUpload,
  AiOutlineLink,
  AiOutlineShareAlt,
} from "react-icons/ai";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import DataFetchLoader from "../components/dashboard/DataFetchLoader";
import PageFilterBar from "../components/dashboard/PageFilterBar";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import CreationModal from "../components/modals/CreationModal";
import CreationPreviewModal from "../components/modals/CreationPreviewModal";
import { getCreations, createCreation, updateCreation, deleteCreation, incrementCreationView } from "../api/creations";

const DEFAULT_CREATION_IMAGE = "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const platformLabelMap = {
  delightex: "Delightex",
  thinglink: "ThingLink",
  image360: "360 Image",
};

const AdminCreationsLocker = () => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [previewCreation, setPreviewCreation] = useState(null);
  const [modalState, setModalState] = useState({
    show: false,
    mode: "create",
    creation: null,
  });
  const [creations, setCreations] = useState([]);

  const loadLockerCreations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getCreations({ scope: "locker", userId: user?._id });
      setCreations(response?.data || []);
    } catch (error) {
      setCreations([]);
      showAlert(error?.message || "Failed to load locker creations", {
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  }, [showAlert, user?._id]);

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

  useEffect(() => {
    loadLockerCreations();
  }, [loadLockerCreations]);

  const filteredCreations = useMemo(() => {
    const filteredItems = creations.filter((creation) => {
      const matchesFilter =
        activeFilter === "all"
          ? true
          : ["private", "shared"].includes(activeFilter)
            ? creation.status === activeFilter
            : creation.hostingPlatform === activeFilter;

      if (!searchQuery.trim()) return matchesFilter;

      const query = searchQuery.toLowerCase();
      const tagsText = Array.isArray(creation.tags) ? creation.tags.join(" ") : "";

      return (
        matchesFilter &&
        (String(creation.title || "").toLowerCase().includes(query) ||
          String(creation.description || "").toLowerCase().includes(query) ||
          String(creation.hostingPlatform || "").toLowerCase().includes(query) ||
          tagsText.toLowerCase().includes(query))
      );
    });

    return [...filteredItems].sort((left, right) => {
      switch (sortBy) {
        case "oldest":
          return new Date(left.createdAt || 0) - new Date(right.createdAt || 0);
        case "most-viewed":
          return Number(right.views || 0) - Number(left.views || 0);
        case "most-liked":
          return Number(right.likes || 0) - Number(left.likes || 0);
        case "title-asc":
          return String(left.title || "").localeCompare(String(right.title || ""));
        case "title-desc":
          return String(right.title || "").localeCompare(String(left.title || ""));
        case "newest":
        default:
          return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      }
    });
  }, [activeFilter, creations, searchQuery, sortBy]);

  const handleEdit = (creation) => {
    setModalState({
      show: true,
      mode: "edit",
      creation,
    });
  };

  const handleCreate = () => {
    setModalState({
      show: true,
      mode: "create",
      creation: null,
    });
  };

  const handleSave = async (creationData) => {
    try {
      const payload = {
        ...creationData,
        scope: "locker",
      };

      delete payload.id;
      delete payload._id;
      delete payload.uploadDate;
      delete payload.createdAt;
      delete payload.updatedAt;
      delete payload.owner;

      if (modalState.mode === "create") {
        await createCreation(payload);
        showAlert("Creation uploaded successfully", { type: "success", duration: 3000 });
      } else {
        const creationId = modalState.creation?._id || creationData._id || creationData.id;
        await updateCreation(creationId, payload);
        showAlert("Creation updated successfully", { type: "success", duration: 3000 });
      }

      setModalState({ show: false, mode: "create", creation: null });
      await loadLockerCreations();
    } catch (error) {
      showAlert(error?.message || "Failed to save creation", {
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteCreation(id);
      setCreations((prev) => prev.filter((item) => item._id !== id));
      showAlert("Creation deleted", { type: "success", duration: 3000 });
    } catch (error) {
      showAlert(error?.message || "Failed to delete creation", {
        type: "error",
        duration: 5000,
      });
    }
  };

  const confirmDeleteCreation = (creationId) => {
    showAlert("Are you sure you want to delete this creation?", {
      type: "warning",
      actionText: "Delete",
      onAction: () => handleDelete(creationId),
      duration: 5000,
      position: "top-center",
    });
  };

  const openCreationLink = async (creation) => {
    const targetUrl = creation.contentUrl || creation.thumbnail || DEFAULT_CREATION_IMAGE;

    if (!targetUrl) {
      showAlert("No external link configured for this creation yet.", {
        type: "warning",
        duration: 3000,
      });
      return;
    }

    try {
      const response = await incrementCreationView(creation._id);
      const updatedCreation = response?.data;

      if (updatedCreation) {
        setCreations((prev) =>
          prev.map((item) => (item._id === creation._id ? { ...item, ...updatedCreation } : item))
        );
        setPreviewCreation((prev) =>
          prev && prev._id === creation._id ? { ...prev, ...updatedCreation } : prev
        );
      }
    } catch {
      // Do not block opening the creation if view tracking fails.
    }

    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const toggleVisibility = async (creation) => {
    const nextStatus = creation.status === "shared" ? "private" : "shared";
    const visibilityText = nextStatus === "shared" ? "public" : "private";

    try {
      await updateCreation(creation._id, { status: nextStatus });
      setCreations((prev) =>
        prev.map((item) => (item._id === creation._id ? { ...item, status: nextStatus } : item))
      );
      showAlert(`Creation is now ${visibilityText}`, { type: "success", duration: 2500 });
    } catch (error) {
      showAlert(error?.message || "Failed to update visibility", {
        type: "error",
        duration: 5000,
      });
    }
  };

  const categories = [
    { id: "all", name: "All Creations" },
    { id: "private", name: "Private" },
    { id: "shared", name: "Shared" },
    { id: "delightex", name: "Delightex" },
    { id: "thinglink", name: "ThingLink" },
    { id: "image360", name: "360 Images" },
  ];

  const sortOptions = [
    { id: "newest", name: "Newest First" },
    { id: "oldest", name: "Oldest First" },
    { id: "most-viewed", name: "Most Viewed" },
    { id: "most-liked", name: "Most Liked" },
    { id: "title-asc", name: "Title A-Z" },
    { id: "title-desc", name: "Title Z-A" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed top-2 right-4 z-50 md:hidden bg-slate-800/95 backdrop-blur-xl border border-slate-700/50 p-3 rounded-xl text-white shadow-lg"
        >
          {mobileMenuOpen ? <AiOutlineClose size={20} /> : <AiOutlineMenu size={20} />}
        </motion.button>
      )}

      <Sidebar
        isMobile={isMobile}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        userRole={user?.role}
      />

      <div
        className={`transition-all duration-300 ${
          isMobile ? "ml-0" : sidebarCollapsed ? "ml-16" : "ml-60"
        }`}
      >
        <Header searchQuery={searchQuery} setSearchQuery={setSearchQuery} searchPlaceholder="Search creations..." />

        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <AiOutlineLock className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Locker Management</h1>
            </div>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreate}
              className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 rounded-xl font-medium"
            >
              <AiOutlineCloudUpload className="w-5 h-5" />
              <span>Upload Creation</span>
            </motion.button>
          </motion.div>

          <PageFilterBar
            categories={categories}
            activeCategory={activeFilter}
            onCategoryChange={setActiveFilter}
            sortOptions={sortOptions}
            activeSort={sortBy}
            onSortChange={setSortBy}
          />

          {isLoading ? (
            <DataFetchLoader message="Loading locker creations..." />
          ) : filteredCreations.length > 0 ? (
            <motion.div
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
            >
              {filteredCreations.map((creation) => (
                <motion.div
                  key={creation._id}
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: {
                      y: 0,
                      opacity: 1,
                      transition: {
                        duration: 0.5,
                        ease: "easeOut",
                      },
                    },
                  }}
                  onClick={() => setPreviewCreation(creation)}
                  className="group relative cursor-pointer overflow-hidden bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={creation.thumbnail || DEFAULT_CREATION_IMAGE}
                      alt={creation.title}
                      onError={(event) => {
                        event.currentTarget.onerror = null;
                        event.currentTarget.src = DEFAULT_CREATION_IMAGE;
                      }}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          creation.status === "private"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-emerald-500/20 text-emerald-400"
                        }`}
                      >
                        {creation.status === "shared" ? "public" : "private"}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                      <span className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                        {platformLabelMap[creation.hostingPlatform] || "Creation"}
                      </span>
                      <span className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                        {creation.size || "0 MB"}
                      </span>
                    </div>
                  </div>

                  <div className="p-4 md:p-5">
                    <h3 className="text-lg md:text-xl font-bold text-white mb-1 line-clamp-1">{creation.title}</h3>
                    <p className="text-slate-400 text-sm mb-3 line-clamp-2">{creation.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {(creation.tags || []).slice(0, 3).map((tag) => (
                        <span key={tag} className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs">
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
                      <span className="text-xs text-slate-400">{new Date(creation.createdAt).toISOString().split("T")[0]}</span>
                      <div className="flex space-x-2">
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            openCreationLink(creation);
                          }}
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Open Link"
                        >
                          <AiOutlineLink className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            toggleVisibility(creation);
                          }}
                          className={`p-2 transition-colors ${
                            creation.status === "shared"
                              ? "text-emerald-400 hover:text-blue-400"
                              : "text-slate-400 hover:text-emerald-400"
                          }`}
                          title={creation.status === "shared" ? "Make Private" : "Make Public"}
                        >
                          <AiOutlineShareAlt className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            handleEdit(creation);
                          }}
                          className="p-2 text-slate-400 hover:text-amber-400 transition-colors"
                          title="Edit"
                        >
                          <AiOutlineEdit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(event) => {
                            event.stopPropagation();
                            confirmDeleteCreation(creation._id);
                          }}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Delete"
                        >
                          <AiOutlineDelete className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <div className="w-24 h-24 bg-slate-700/30 rounded-full flex items-center justify-center mb-6">
                <AiOutlineLock className="w-12 h-12 text-blue-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">Locker is Empty</h2>
              <p className="text-slate-400 max-w-md">
                {activeFilter === "all"
                  ? "Upload your first creation to get started"
                  : `No ${categories.find((c) => c.id === activeFilter)?.name.toLowerCase()} found`}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {modalState.show && (
        <CreationModal
          mode={modalState.mode}
          creation={modalState.creation}
          onClose={() => setModalState({ show: false, mode: "create", creation: null })}
          onSave={handleSave}
        />
      )}

      <CreationPreviewModal
        creation={previewCreation}
        onClose={() => setPreviewCreation(null)}
        onView={openCreationLink}
      />
    </div>
  );
};

export default AdminCreationsLocker;



