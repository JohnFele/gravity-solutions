import { useState, useEffect, useMemo, useRef, useCallback } from "react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { AiOutlineMenu, AiOutlineClose, AiOutlinePicture, AiOutlineEye } from "react-icons/ai";
import Sidebar from "../components/dashboard/sidebar/Sidebar";
import Header from "../components/dashboard/header/Header";
import DataFetchLoader from "../components/dashboard/DataFetchLoader";
import PageFilterBar from "../components/dashboard/PageFilterBar";
import CreationPreviewModal from "../components/modals/CreationPreviewModal";
import { useAuth } from "../context/AuthContext";
import { useAlert } from "../context/AlertContext";
import { getCreations, incrementCreationView, toggleCreationLike } from "../api/creations";

const PAGE_SIZE = 12;
const DEFAULT_CREATION_IMAGE =
  "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80";

const Gallery = () => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState("newest");

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [galleryItems, setGalleryItems] = useState([]);
  const [previewCreation, setPreviewCreation] = useState(null);

  const observerRef = useRef(null);
  const inFlightPageRef = useRef(false);

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

  const fetchGalleryPage = useCallback(
    async (page, append = false) => {
      if (inFlightPageRef.current) return;
      inFlightPageRef.current = true;

      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await getCreations({
          scope: "gallery",
          page,
          limit: PAGE_SIZE,
        });

        const items = response?.data || [];
        const pagination = response?.pagination;

        setGalleryItems((prev) => (append ? [...prev, ...items] : items));
        setCurrentPage(page);
        setHasMore(Boolean(pagination?.hasMore));
      } catch (error) {
        if (!append) {
          setGalleryItems([]);
        }
        showAlert(error?.message || "Failed to load gallery content", {
          type: "error",
          duration: 5000,
        });
      } finally {
        inFlightPageRef.current = false;
        if (append) {
          setIsLoadingMore(false);
        } else {
          setIsLoading(false);
        }
      }
    },
    [showAlert]
  );

  useEffect(() => {
    fetchGalleryPage(1, false);
  }, [fetchGalleryPage]);

  useEffect(
    () => () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    },
    []
  );

  const loadMoreTriggerRef = useCallback(
    (node) => {
      if (isLoading || isLoadingMore || !hasMore) return;

      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      observerRef.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
            fetchGalleryPage(currentPage + 1, true);
          }
        },
        { rootMargin: "220px" }
      );

      if (node) observerRef.current.observe(node);
    },
    [currentPage, fetchGalleryPage, hasMore, isLoading, isLoadingMore]
  );

  const filteredGallery = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filteredItems = galleryItems.filter((item) => {
      const matchesCategory =
        activeCategory === "all"
          ? true
          : ["image", "video"].includes(activeCategory)
            ? item.type === activeCategory
            : item.hostingPlatform === activeCategory;

      if (!matchesCategory) {
        return false;
      }

      if (!query) {
        return true;
      }

      const tagsText = Array.isArray(item.tags) ? item.tags.join(" ") : "";
      return (
        String(item.title || "").toLowerCase().includes(query) ||
        String(item.description || "").toLowerCase().includes(query) ||
        String(item.hostingPlatform || "").toLowerCase().includes(query) ||
        tagsText.toLowerCase().includes(query)
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
  }, [activeCategory, galleryItems, searchQuery, sortBy]);

  const categories = [
    { id: "all", name: "All Creations" },
    { id: "image", name: "Images" },
    { id: "video", name: "Videos" },
    { id: "thinglink", name: "ThingLink" },
    { id: "delightex", name: "Delightex" },
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


  const handleLikeCreation = async (creation) => {
    try {
      const response = await toggleCreationLike(creation._id);
      const liked = Boolean(response?.data?.liked);
      const likes = Number(response?.data?.likes || 0);

      setGalleryItems((prev) =>
        prev.map((item) => (item._id === creation._id ? { ...item, isLiked: liked, likes } : item))
      );

      setPreviewCreation((prev) =>
        prev && prev._id === creation._id ? { ...prev, isLiked: liked, likes } : prev
      );
    } catch (error) {
      showAlert(error?.message || "Failed to update like", {
        type: "error",
        duration: 3000,
      });
    }
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
        setGalleryItems((prev) =>
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
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder="Search the gallery"
        />

        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-between mb-6"
          >
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 text-white">
                <AiOutlinePicture className="w-6 h-6" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Gallery</h1>
            </div>
          </motion.div>

          <PageFilterBar
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            sortOptions={sortOptions}
            activeSort={sortBy}
            onSortChange={setSortBy}
          />

          {isLoading ? (
            <DataFetchLoader message="Loading gallery..." />
          ) : filteredGallery.length > 0 ? (
            <>
              <motion.div
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.06,
                    },
                  },
                }}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6"
              >
                {filteredGallery.map((item) => (
                  <motion.div
                    key={item._id}
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                        transition: {
                          duration: 0.45,
                          ease: "easeOut",
                        },
                      },
                    }}
                    onClick={() => setPreviewCreation(item)}
                    className="group relative cursor-pointer overflow-hidden bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50"
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={item.thumbnail || DEFAULT_CREATION_IMAGE}
                        alt={item.title}
                        onError={(event) => {
                          event.currentTarget.onerror = null;
                          event.currentTarget.src = DEFAULT_CREATION_IMAGE;
                        }}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                      <div className="absolute bottom-4 left-4 flex items-center space-x-2">
                        <span className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                          {item.status === "shared" ? "Public" : item.type === "image" ? "360 Image" : "VR Video"}
                        </span>
                        <span className="bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white flex items-center">
                          <AiOutlineEye className="mr-1" /> {item.views || 0}
                        </span>
                      </div>
                    </div>

                    <div className="p-4 md:p-5">
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1 line-clamp-1">{item.title}</h3>
                      <p className="text-slate-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                      <div className="flex flex-wrap gap-1">
                        {(item.tags || []).slice(0, 3).map((tag) => (
                          <span key={tag} className="bg-slate-700/50 text-slate-300 px-2 py-1 rounded text-xs">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>

              <div ref={loadMoreTriggerRef} className="h-14 flex items-center justify-center text-sm text-slate-400 mt-4">
                {isLoadingMore ? "Loading more creations..." : hasMore ? "Scroll to load more" : "You reached the end"}
              </div>
            </>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8 md:p-12 flex flex-col items-center justify-center text-center min-h-[400px]"
            >
              <div className="w-24 h-24 bg-slate-700/30 rounded-full flex items-center justify-center mb-6">
                <AiOutlinePicture className="w-12 h-12 text-purple-400" />
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-white mb-2">
                {searchQuery.trim() ? "No matching creations found" : "Gallery is Empty"}
              </h2>
              <p className="text-slate-400 max-w-md">
                {searchQuery.trim() ? "Try a different search term." : "Public and published creations will appear here."}
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <CreationPreviewModal
        creation={previewCreation}
        onClose={() => setPreviewCreation(null)}
        onView={openCreationLink}
        onLike={handleLikeCreation}
      />
    </div>
  );
};

export default Gallery;


