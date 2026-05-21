import { useEffect, useMemo, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineShoppingCart,
  AiOutlineCheck,
  AiOutlineArrowLeft,
  AiOutlineArrowRight,
} from 'react-icons/ai';
import { FiPackage, FiGrid, FiUser, FiMail } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/dashboard/sidebar/Sidebar';
import Header from '../components/dashboard/header/Header';
import PageFilterBar from '../components/dashboard/PageFilterBar';
import PackageCard from '../components/quotation/PackageCard';
import AddOnProduct from '../components/quotation/AddOnProduct';
import CustomerDetailsForm from '../components/quotation/CustomerDetailsForm';
import QuotationSummary from '../components/quotation/QuotationSummary';
import QuotationLoader from '../components/quotation/QuotationLoader';
import { useAuth } from '../context/AuthContext';
import { useQuotation } from '../context/QuotationContext';
import { useAlert } from '../context/AlertContext';

const categories = [
  { id: 'all', name: 'All Items' },
  { id: 'app', name: 'Apps' },
  { id: 'license', name: 'Licenses' },
  { id: 'service', name: 'Services' },
  { id: 'hardware', name: 'Hardware' },
];

const quoteSteps = [
  { id: 1, label: 'Package', icon: FiPackage },
  { id: 2, label: 'Add-ons', icon: FiGrid },
  { id: 3, label: 'Details', icon: FiUser },
  { id: 4, label: 'Review', icon: FiMail },
];

const QuotationBuilder = () => {
  const navigate = useNavigate();
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();
  const {
    selectedPackage,
    customHeadsetCount,
    selectedAddOns,
    currentStep,
    customerDetails,
    subtotalExVAT,
    vat,
    totalInclVAT,
    packages,
    addOnProducts,
    isLoading,
    packagesLoading,
    addOnsLoading,
    isSubmitting,
    dispatch,
    submitQuote,
    loadPackages,
    loadAddOns,
  } = useQuotation();

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [packageCategory, setPackageCategory] = useState('all');
  const [packageSort, setPackageSort] = useState('recommended');
  const [activeCategory, setActiveCategory] = useState('all');
  const [addOnSort, setAddOnSort] = useState('recommended');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) setSidebarCollapsed(true);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!user || currentStep !== 3) return;

    dispatch({
      type: 'UPDATE_CUSTOMER_DETAILS',
      payload: {
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        company: user.company || '',
        phone: user.phone || '',
      },
    });
  }, [currentStep, dispatch, user]);

  useEffect(() => {
    if (currentStep !== 1) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      loadPackages({ search: searchQuery.trim() });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [currentStep, loadPackages, searchQuery]);

  useEffect(() => {
    if (currentStep !== 2) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      loadAddOns({ search: searchQuery.trim(), category: activeCategory });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeCategory, currentStep, loadAddOns, searchQuery]);

  const visiblePackages = useMemo(() => {
    const filteredPackages = packages.filter((pkg) => {
      switch (packageCategory) {
        case 'popular':
          return Boolean(pkg.popular);
        case 'custom':
          return Boolean(pkg.isCustom);
        case 'base':
        case 'standard':
        case 'pro':
          return String(pkg.name || '').toLowerCase().includes(`- ${packageCategory} bundle`);
        case 'meta':
          return String(pkg.name || '').toLowerCase().includes('meta quest');
        case 'pico':
          return String(pkg.name || '').toLowerCase().includes('pico');
        default:
          return true;
      }
    });

    return [...filteredPackages].sort((left, right) => {
      switch (packageSort) {
        case 'price-low':
          return Number(left.basePrice || 0) - Number(right.basePrice || 0);
        case 'price-high':
          return Number(right.basePrice || 0) - Number(left.basePrice || 0);
        case 'headsets':
          return Number(left.headsetCount || 0) - Number(right.headsetCount || 0);
        case 'name':
          return String(left.name || '').localeCompare(String(right.name || ''));
        case 'recommended':
        default:
          return Number(right.popular || 0) - Number(left.popular || 0);
      }
    });
  }, [packageCategory, packageSort, packages]);

  const visibleAddOns = useMemo(() => {
    return [...addOnProducts].sort((left, right) => {
      switch (addOnSort) {
        case 'price-low':
          return Number(left.price || 0) - Number(right.price || 0);
        case 'price-high':
          return Number(right.price || 0) - Number(left.price || 0);
        case 'category':
          return String(left.category || '').localeCompare(String(right.category || ''));
        case 'name':
          return String(left.name || '').localeCompare(String(right.name || ''));
        case 'recommended':
        default:
          return Number(right.popular || 0) - Number(left.popular || 0);
      }
    });
  }, [addOnProducts, addOnSort]);
  const selectedPackageData = useMemo(
    () => packages.find((pkg) => pkg.id === selectedPackage) || null,
    [packages, selectedPackage]
  );
  const includedAddOnKeySet = useMemo(
    () => new Set((selectedPackageData?.includedAddOnKeys || []).map((item) => String(item).trim().toLowerCase())),
    [selectedPackageData]
  );

  useEffect(() => {
    if (!selectedAddOns.length || !includedAddOnKeySet.size) {
      return;
    }

    const addOnsToRemove = selectedAddOns.filter((item) =>
      includedAddOnKeySet.has(String(item.id || '').trim().toLowerCase())
    );

    if (!addOnsToRemove.length) {
      return;
    }

    addOnsToRemove.forEach((item) => {
      dispatch({ type: 'REMOVE_ADD_ON', payload: item.id });
    });

    showAlert('Included add-ons were removed from your selection for this package.', {
      type: 'info',
      duration: 3500,
    });
  }, [dispatch, includedAddOnKeySet, selectedAddOns, showAlert]);

  const packageCategories = [
    { id: 'all', name: 'All Packages' },
    { id: 'popular', name: 'Popular' },
    { id: 'base', name: 'Base' },
    { id: 'standard', name: 'Standard' },
    { id: 'pro', name: 'Pro' },
    { id: 'meta', name: 'Meta Quest' },
    { id: 'pico', name: 'Pico' },
    { id: 'custom', name: 'Custom' },
  ];

  const packageSortOptions = [
    { id: 'recommended', name: 'Recommended' },
    { id: 'price-low', name: 'Price Low-High' },
    { id: 'price-high', name: 'Price High-Low' },
    { id: 'headsets', name: 'Headset Count' },
    { id: 'name', name: 'Name' },
  ];

  const addOnSortOptions = [
    { id: 'recommended', name: 'Recommended' },
    { id: 'price-low', name: 'Price Low-High' },
    { id: 'price-high', name: 'Price High-Low' },
    { id: 'category', name: 'Category' },
    { id: 'name', name: 'Name' },
  ];

  const validateStep = (step, { notify = false } = {}) => {
    if (step === 1) {
      if (!selectedPackage) {
        if (notify) {
          showAlert('Please select a package to continue', { type: 'warning', duration: 3000 });
        }
        return false;
      }
      return true;
    }

    if (step === 2) {
      return true;
    }

    if (step === 3) {
      if (!customerDetails.firstName || !customerDetails.lastName || !customerDetails.email || !customerDetails.company) {
        if (notify) {
          showAlert('Please fill in all required fields', { type: 'warning', duration: 3000 });
        }
        return false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(customerDetails.email)) {
        if (notify) {
          showAlert('Please enter a valid email address', { type: 'warning', duration: 3000 });
        }
        return false;
      }

      return true;
    }

    return true;
  };

  const getHighestUnlockedStep = () => {
    let highestUnlocked = 1;

    if (validateStep(1)) {
      highestUnlocked = 2;
    } else {
      return highestUnlocked;
    }

    if (validateStep(2)) {
      highestUnlocked = 3;
    } else {
      return highestUnlocked;
    }

    if (validateStep(3)) {
      highestUnlocked = 4;
    }

    return highestUnlocked;
  };

  const handleStepNavigation = (targetStep) => {
    if (targetStep === currentStep) {
      return;
    }

    if (targetStep < currentStep) {
      dispatch({ type: 'SET_STEP', payload: targetStep });
      return;
    }

    const highestUnlockedStep = getHighestUnlockedStep();
    if (targetStep > highestUnlockedStep) {
      for (let step = 1; step < targetStep; step += 1) {
        if (!validateStep(step, { notify: true })) {
          return;
        }
      }
    }

    dispatch({ type: 'SET_STEP', payload: Math.min(targetStep, highestUnlockedStep) });
  };

  const highestUnlockedStep = getHighestUnlockedStep();

  const handleNextStep = async () => {
    if (!validateStep(currentStep, { notify: true })) {
      return;
    }

    if (currentStep === 4) {
      if (!validateStep(1, { notify: true }) || !validateStep(3, { notify: true })) {
        return;
      }

      if (!user?.isEmailVerified) {
        showAlert('Verify your email address before requesting a quotation.', {
          type: 'warning',
          duration: 5000,
        });
        return;
      }

      try {
        const response = await submitQuote({
          customerDetails,
          selectedPackage,
          customHeadsetCount,
          selectedAddOns,
        });

        if (!response?.data?.emailSent) {
          showAlert(
            response?.message || 'Quote was saved, but email delivery failed. Please contact support before retrying.',
            { type: 'warning', duration: 6000 }
          );
          return;
        }

        showAlert(response?.message || 'Quote sent successfully', { type: 'success', duration: 3500 });
        setTimeout(() => {
          navigate('/quote/thank-you', {
            state: {
              quoteRef: response?.data?.reference,
              customerEmail: customerDetails.email,
            },
          });
        }, 800);
      } catch (error) {
        showAlert(error?.message || 'Failed to send quote. Please try again.', {
          type: 'error',
          duration: 5000,
        });
      }
      return;
    }

    dispatch({ type: 'NEXT_STEP' });
  };

  if (isLoading || isSubmitting) {
    return <QuotationLoader message={isSubmitting ? 'Submitting your quotation...' : 'Loading quotation catalog...'} />;
  }

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

      <div className={`transition-all duration-300 ${isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-60'}`}>
        <Header
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchPlaceholder={currentStep === 2 ? 'Search add-ons...' : 'Search quotation packages...'}
        />

        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 p-2 text-white">
                <AiOutlineShoppingCart className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-bold text-white md:text-3xl">Build Your Quote</h1>
            </div>
          </motion.div>

          <div className="mb-8 overflow-x-auto pb-2">
            <div className="mx-auto flex min-w-[320px] max-w-4xl items-start justify-center px-2">
              {quoteSteps.map((step, index) => {
                const isCompleted = currentStep > step.id;
                const isActive = currentStep === step.id;
                const isClickable = (step.id <= currentStep || step.id <= highestUnlockedStep) && !isSubmitting;

                return (
                  <div key={step.id} className="flex flex-1 items-center last:flex-none">
                    <div className="flex min-w-[72px] flex-col items-center text-center">
                      <button
                        type="button"
                        onClick={() => handleStepNavigation(step.id)}
                        disabled={!isClickable}
                        aria-label={`Go to ${step.label}`}
                        className="group flex flex-col items-center"
                      >
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full font-bold transition-all ${
                            isCompleted || isActive
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/20'
                              : 'bg-slate-700/50 text-slate-400'
                          } ${
                            isClickable
                              ? 'cursor-pointer hover:scale-105 hover:bg-slate-700/70'
                              : 'cursor-not-allowed opacity-50'
                          }`}
                        >
                          {isCompleted ? <AiOutlineCheck /> : step.id}
                        </div>
                        <span
                          className={`mt-2 text-xs transition-colors ${
                            isActive ? 'text-emerald-400' : 'text-slate-400'
                          }`}
                        >
                          {step.label}
                        </span>
                      </button>
                    </div>

                    {index < quoteSteps.length - 1 && (
                      <div className="flex flex-1 items-center justify-center px-2">
                        <div
                          className={`h-[2px] w-1/2 transition-colors ${
                            currentStep > step.id ? 'bg-emerald-500' : 'bg-slate-700'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-center text-xs text-slate-500 md:hidden">
              Step {currentStep} of {quoteSteps.length}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <AnimatePresence mode="wait">
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="mb-4 flex items-center text-xl font-bold text-white">
                      <FiPackage className="mr-2 text-emerald-400" />
                      Step 1: Select Your Package
                    </h2>

                    <PageFilterBar
                      categories={packageCategories}
                      activeCategory={packageCategory}
                      onCategoryChange={setPackageCategory}
                      sortOptions={packageSortOptions}
                      activeSort={packageSort}
                      onSortChange={setPackageSort}
                    />

                    {packagesLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={`builder-package-skeleton-${index}`}
                            className="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/40 p-6"
                          >
                            <div className="mb-3 h-5 w-1/3 rounded bg-slate-700" />
                            <div className="mb-2 h-4 w-full rounded bg-slate-700" />
                            <div className="h-4 w-1/4 rounded bg-slate-700" />
                          </div>
                        ))}
                      </div>
                    ) : visiblePackages.length > 0 ? (
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {visiblePackages.map((pkg) => (
                          <PackageCard
                            key={pkg.id}
                            pkg={pkg}
                            isSelected={selectedPackage === pkg.id}
                            onSelect={() => dispatch({ type: 'SELECT_PACKAGE', payload: pkg.id })}
                            customHeadsetCount={customHeadsetCount}
                            onCustomCountChange={(count) =>
                              dispatch({ type: 'SET_CUSTOM_HEADSET_COUNT', payload: count })
                            }
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-8 text-center text-slate-400">
                        No quotation packages match your search.
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="mb-4 flex items-center text-xl font-bold text-white">
                      <FiGrid className="mr-2 text-emerald-400" />
                      Step 2: Add Products and Services
                    </h2>

                    <PageFilterBar
                      categories={categories}
                      activeCategory={activeCategory}
                      onCategoryChange={setActiveCategory}
                      sortOptions={addOnSortOptions}
                      activeSort={addOnSort}
                      onSortChange={setAddOnSort}
                    />

                    {addOnsLoading ? (
                      <div className="space-y-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div
                            key={`builder-addon-skeleton-${index}`}
                            className="animate-pulse rounded-xl border border-slate-700/50 bg-slate-800/40 p-6"
                          >
                            <div className="mb-3 h-5 w-1/3 rounded bg-slate-700" />
                            <div className="mb-2 h-4 w-full rounded bg-slate-700" />
                            <div className="h-4 w-1/4 rounded bg-slate-700" />
                          </div>
                        ))}
                      </div>
                    ) : visibleAddOns.length > 0 ? (
                      <div className="max-h-[800px] space-y-3 overflow-y-auto pr-2">
                        {visibleAddOns.map((product) => {
                          const selected = selectedAddOns.find((item) => item.id === product.id);
                          const isIncludedInPackage = includedAddOnKeySet.has(
                            String(product.id || '').trim().toLowerCase()
                          );
                          return (
                            <AddOnProduct
                              key={product.id}
                              product={product}
                              quantity={selected?.quantity || 0}
                              disabled={isIncludedInPackage}
                              disabledReason={
                                isIncludedInPackage
                                  ? `${product.name} is already included in ${selectedPackageData?.name || 'this package'}.`
                                  : ''
                              }
                              onAdd={(quantity) =>
                                dispatch({
                                  type: 'ADD_ADD_ON',
                                  payload: { id: product.id, quantity },
                                })
                              }
                              onRemove={() => dispatch({ type: 'REMOVE_ADD_ON', payload: product.id })}
                              onUpdateQuantity={(quantity) =>
                                dispatch({
                                  type: 'UPDATE_ADD_ON_QUANTITY',
                                  payload: { id: product.id, quantity },
                                })
                              }
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="rounded-xl border border-slate-700/50 bg-slate-800/50 p-8 text-center text-slate-400">
                        No add-ons match your current filters.
                      </div>
                    )}
                  </motion.div>
                )}

                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="mb-4 flex items-center text-xl font-bold text-white">
                      <FiUser className="mr-2 text-emerald-400" />
                      Step 3: Your Details
                    </h2>
                    <CustomerDetailsForm />
                  </motion.div>
                )}

                {currentStep === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h2 className="mb-4 flex items-center text-xl font-bold text-white">
                      <FiMail className="mr-2 text-emerald-400" />
                      Step 4: Review and Send
                    </h2>
                    <QuotationSummary
                      onSend={handleNextStep}
                      sendDisabled={isSubmitting}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-4 rounded-2xl border border-slate-700/50 bg-slate-800/50 p-4 backdrop-blur-xl md:p-6">
                <h3 className="mb-4 text-lg font-bold text-white">Quote Summary</h3>

                {selectedPackage && (
                  <div className="mb-4 border-b border-slate-700/50 pb-4">
                    <p className="mb-1 text-xs text-slate-400">Selected Package</p>
                    <p className="text-sm font-medium text-white md:text-base">
                      {packages.find((pkg) => pkg.id === selectedPackage)?.name}
                    </p>
                  </div>
                )}

                {selectedAddOns.length > 0 && (
                  <div className="mb-4 border-b border-slate-700/50 pb-4">
                    <p className="mb-2 text-xs text-slate-400">Add-ons ({selectedAddOns.length})</p>
                    <div className="max-h-40 space-y-2 overflow-y-auto">
                      {selectedAddOns.map((item) => {
                        const product = addOnProducts.find((addOn) => addOn.id === item.id);
                        return (
                          <div key={item.id} className="flex justify-between text-xs">
                            <span className="mr-2 truncate text-slate-300">
                              {product?.name} x{item.quantity}
                            </span>
                            <span className="whitespace-nowrap font-medium text-white">
                              R {(Number(product?.price || 0) * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="mb-6 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Subtotal (excl. VAT)</span>
                    <span className="font-medium text-white">R {subtotalExVAT.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">VAT (15%)</span>
                    <span className="font-medium text-white">R {vat.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-700/50 pt-2 text-lg font-bold">
                    <span className="text-white">Total</span>
                    <span className="text-emerald-400">R {totalInclVAT.toLocaleString()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => dispatch({ type: 'PREV_STEP' })}
                      className="flex-1 rounded-xl bg-slate-700/50 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-700/70"
                    >
                      <span className="flex items-center justify-center">
                        <AiOutlineArrowLeft className="mr-2" />
                        Back
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleNextStep}
                    disabled={isSubmitting}
                    className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 text-sm font-medium text-white transition-all hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex items-center justify-center">
                      {currentStep === 4 ? 'Send Quote' : 'Continue'}
                      {currentStep !== 4 && <AiOutlineArrowRight className="ml-2" />}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuotationBuilder;
