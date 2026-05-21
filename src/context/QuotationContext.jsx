/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useState } from 'react';
import { useAlert } from './AlertContext';
import { useAuth } from './AuthContext';
import {
  getQuotationPackages,
  createQuotationPackage,
  updateQuotationPackage,
  deleteQuotationPackage,
  toggleQuotationPackagePublish,
  getQuotationAddOns,
  createQuotationAddOn,
  updateQuotationAddOn,
  deleteQuotationAddOn,
  toggleQuotationAddOnPublish,
  createQuote,
  updateQuote,
  getQuoteHistory,
  getQuotationStats,
  updateQuoteStatus,
} from '../api/quotation';

const QuotationContext = createContext(null);
const VAT_RATE = 0.15;

const initialState = {
  selectedPackage: null,
  customHeadsetCount: 10,
  selectedAddOns: [],
  customerDetails: {
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    notes: '',
  },
  currentStep: 1,
  quoteReference: null,
  quoteDate: null,
  isSubmitting: false,
  quoteSent: false,
};

const quotationReducer = (state, action) => {
  switch (action.type) {
    case 'SELECT_PACKAGE':
      return {
        ...state,
        selectedPackage: action.payload,
      };

    case 'SET_CUSTOM_HEADSET_COUNT':
      return {
        ...state,
        customHeadsetCount: Math.max(10, Number(action.payload) || 10),
      };

    case 'ADD_ADD_ON': {
      const existingIndex = state.selectedAddOns.findIndex((item) => item.id === action.payload.id);
      if (existingIndex >= 0) {
        const selectedAddOns = [...state.selectedAddOns];
        selectedAddOns[existingIndex] = {
          ...selectedAddOns[existingIndex],
          quantity: selectedAddOns[existingIndex].quantity + (action.payload.quantity || 1),
        };
        return { ...state, selectedAddOns };
      }

      return {
        ...state,
        selectedAddOns: [
          ...state.selectedAddOns,
          { id: action.payload.id, quantity: action.payload.quantity || 1 },
        ],
      };
    }

    case 'REMOVE_ADD_ON':
      return {
        ...state,
        selectedAddOns: state.selectedAddOns.filter((item) => item.id !== action.payload),
      };

    case 'UPDATE_ADD_ON_QUANTITY':
      return {
        ...state,
        selectedAddOns: state.selectedAddOns.map((item) =>
          item.id === action.payload.id
            ? { ...item, quantity: Math.max(1, Number(action.payload.quantity) || 1) }
            : item
        ),
      };

    case 'UPDATE_CUSTOMER_DETAILS':
      return {
        ...state,
        customerDetails: {
          ...state.customerDetails,
          ...action.payload,
        },
      };

    case 'SET_STEP':
      return {
        ...state,
        currentStep: Math.min(4, Math.max(1, Number(action.payload) || 1)),
      };

    case 'NEXT_STEP':
      return {
        ...state,
        currentStep: Math.min(4, state.currentStep + 1),
      };

    case 'PREV_STEP':
      return {
        ...state,
        currentStep: Math.max(1, state.currentStep - 1),
      };

    case 'SET_IS_SUBMITTING':
      return {
        ...state,
        isSubmitting: Boolean(action.payload),
      };

    case 'SET_QUOTE_SENT':
      return {
        ...state,
        quoteSent: true,
        quoteReference: action.payload.reference,
        quoteDate: action.payload.date,
        isSubmitting: false,
      };

    case 'RESET_QUOTATION':
      return {
        ...initialState,
      };

    default:
      return state;
  }
};

export const QuotationProvider = ({ children, isAdmin = false }) => {
  const [state, dispatch] = useReducer(quotationReducer, initialState);
  const [packages, setPackages] = useState([]);
  const [addOnProducts, setAddOnProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [addOnsLoading, setAddOnsLoading] = useState(false);
  const [quotesLoading, setQuotesLoading] = useState(false);
  const [quoteStatusLoadingId, setQuoteStatusLoadingId] = useState(null);
  const [recentQuotes, setRecentQuotes] = useState([]);
  const [quotesPagination, setQuotesPagination] = useState(null);
  const [quoteStats, setQuoteStats] = useState({
    totalQuotes: 0,
    totalRevenue: 0,
    averageQuoteValue: 0,
    mostPopularPackage: null,
    mostPopularAddOn: null,
  });

  const { showAlert } = useAlert();
  const { profileData: user } = useAuth();

  const adminMode = isAdmin || String(user?.role || '') === 'Admin';

  const pricing = useMemo(() => {
    let subtotalExVAT = 0;
    const selectedPkg = packages.find((item) => item.id === state.selectedPackage);

    if (selectedPkg) {
      subtotalExVAT += selectedPkg.isCustom
        ? Number(selectedPkg.basePrice || 0) + Math.max(0, state.customHeadsetCount - 10) * 12999
        : Number(selectedPkg.basePrice || 0);
    }

    state.selectedAddOns.forEach((item) => {
      const product = addOnProducts.find((addOn) => addOn.id === item.id);
      if (!product) return;
      subtotalExVAT += Number(product.price || 0) * Number(item.quantity || 1);
    });

    const vat = subtotalExVAT * VAT_RATE;
    const totalInclVAT = subtotalExVAT + vat;

    return {
      subtotalExVAT,
      vat,
      totalInclVAT,
    };
  }, [state.selectedPackage, state.customHeadsetCount, state.selectedAddOns, packages, addOnProducts]);

  const loadPackages = useCallback(
    async ({ search = '' } = {}) => {
      if (!user?._id) return [];

      setPackagesLoading(true);
      try {
        const response = await getQuotationPackages({
          includeUnpublished: adminMode ? 'true' : undefined,
          search: search || undefined,
        });

        const nextPackages = response?.data || [];
        setPackages(nextPackages);
        return nextPackages;
      } catch (error) {
        setPackages([]);
        showAlert(error?.message || 'Failed to load quotation packages', {
          type: 'error',
          duration: 5000,
        });
        return [];
      } finally {
        setPackagesLoading(false);
      }
    },
    [adminMode, showAlert, user?._id]
  );

  const loadAddOns = useCallback(
    async ({ search = '', category } = {}) => {
      if (!user?._id) return [];

      setAddOnsLoading(true);
      try {
        const response = await getQuotationAddOns({
          includeUnpublished: adminMode ? 'true' : undefined,
          search: search || undefined,
          category: category && category !== 'all' ? category : undefined,
        });

        const nextAddOns = response?.data || [];
        setAddOnProducts(nextAddOns);
        return nextAddOns;
      } catch (error) {
        setAddOnProducts([]);
        showAlert(error?.message || 'Failed to load quotation add-ons', {
          type: 'error',
          duration: 5000,
        });
        return [];
      } finally {
        setAddOnsLoading(false);
      }
    },
    [adminMode, showAlert, user?._id]
  );

  const loadCatalog = useCallback(
    async ({ packageSearch = '', addOnSearch = '', addOnCategory } = {}) => {
      if (!user?._id) return;

      setIsLoading(true);
      try {
        await Promise.all([
          loadPackages({ search: packageSearch }),
          loadAddOns({ search: addOnSearch, category: addOnCategory }),
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [loadAddOns, loadPackages, user?._id]
  );

  const loadQuoteHistory = useCallback(
    async ({ page = 1, limit = 20, search = '' } = {}) => {
      if (!user?._id) return { data: [], pagination: null };

      setQuotesLoading(true);
      try {
        const historyResponse = await getQuoteHistory({ page, limit, search });
        setRecentQuotes(historyResponse?.data || []);
        setQuotesPagination(historyResponse?.pagination || null);
        return {
          data: historyResponse?.data || [],
          pagination: historyResponse?.pagination || null,
        };
      } catch (error) {
        setRecentQuotes([]);
        setQuotesPagination(null);
        showAlert(error?.message || 'Failed to load quote history', {
          type: 'error',
          duration: 5000,
        });
        return { data: [], pagination: null };
      } finally {
        setQuotesLoading(false);
      }
    },
    [showAlert, user?._id]
  );

  const loadQuoteDashboard = useCallback(
    async ({ page = 1, limit = 20, search = '' } = {}) => {
      if (!adminMode || !user?._id) return;

      setQuotesLoading(true);
      try {
        const [statsResult, historyResult] = await Promise.allSettled([
          getQuotationStats(),
          getQuoteHistory({ page, limit, search }),
        ]);

        const historyResponse = historyResult.status === 'fulfilled' ? historyResult.value : null;
        const statsResponse = statsResult.status === 'fulfilled' ? statsResult.value : null;

        if (historyResponse) {
          setRecentQuotes(historyResponse?.data || []);
          setQuotesPagination(historyResponse?.pagination || null);
        } else {
          setRecentQuotes([]);
          setQuotesPagination(null);
        }

        if (statsResponse) {
          setQuoteStats({
            totalQuotes: Number(statsResponse?.data?.totalQuotes || historyResponse?.pagination?.total || 0),
            totalRevenue: Number(statsResponse?.data?.totalRevenue || 0),
            averageQuoteValue: Number(statsResponse?.data?.averageQuoteValue || 0),
            mostPopularPackage: statsResponse?.data?.mostPopularPackage || null,
            mostPopularAddOn: statsResponse?.data?.mostPopularAddOn || null,
          });
        } else {
          setQuoteStats((prev) => ({
            totalQuotes: Number(historyResponse?.pagination?.total || 0),
            totalRevenue: Number(prev?.totalRevenue || 0),
            averageQuoteValue: Number(prev?.averageQuoteValue || 0),
            mostPopularPackage: prev?.mostPopularPackage || null,
            mostPopularAddOn: prev?.mostPopularAddOn || null,
          }));
        }

        if (historyResult.status === 'rejected') {
          showAlert(historyResult.reason?.message || 'Failed to load quote history', {
            type: 'error',
            duration: 5000,
          });
        } else if (statsResult.status === 'rejected') {
          showAlert(statsResult.reason?.message || 'Failed to load quotation stats', {
            type: 'warning',
            duration: 4000,
          });
        }
      } finally {
        setQuotesLoading(false);
      }
    },
    [adminMode, showAlert, user?._id]
  );

  useEffect(() => {
    loadCatalog();
  }, [loadCatalog]);

  const submitQuote = useCallback(
    async ({ customerDetails, selectedPackage, customHeadsetCount, selectedAddOns }) => {
      dispatch({ type: 'SET_IS_SUBMITTING', payload: true });

      try {
        const response = await createQuote({
          customerDetails,
          selectedPackage,
          customHeadsetCount,
          selectedAddOns,
        });

        dispatch({
          type: 'SET_QUOTE_SENT',
          payload: {
            reference: response?.data?.reference,
            date: response?.data?.createdAt || new Date().toISOString(),
          },
        });

        return response;
      } catch (error) {
        dispatch({ type: 'SET_IS_SUBMITTING', payload: false });
        throw error;
      }
    },
    []
  );

  const createNewQuote = useCallback(async (payload) => {
    return createQuote(payload);
  }, []);

  const updateExistingQuote = useCallback(async (id, payload) => {
    const response = await updateQuote(id, payload);
    setRecentQuotes((prev) => prev.map((item) => (item._id === id ? response.data : item)));
    return response;
  }, []);

  const savePackage = useCallback(async (payload, existingId = null) => {
    const response = existingId
      ? await updateQuotationPackage(existingId, payload)
      : await createQuotationPackage(payload);

    setPackages((prev) => {
      if (existingId) {
        return prev.map((item) => (item.id === existingId ? response.data : item));
      }
      return [...prev, response.data].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    });

    return response.data;
  }, []);

  const removePackage = useCallback(async (id) => {
    await deleteQuotationPackage(id);
    setPackages((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const togglePackagePublish = useCallback(async (id) => {
    const response = await toggleQuotationPackagePublish(id);
    setPackages((prev) => prev.map((item) => (item.id === id ? response.data : item)));
    return response.data;
  }, []);

  const saveAddOn = useCallback(async (payload, existingId = null) => {
    const response = existingId
      ? await updateQuotationAddOn(existingId, payload)
      : await createQuotationAddOn(payload);

    setAddOnProducts((prev) => {
      if (existingId) {
        return prev.map((item) => (item.id === existingId ? response.data : item));
      }
      return [...prev, response.data].sort((a, b) => Number(a.sortOrder || 0) - Number(b.sortOrder || 0));
    });

    return response.data;
  }, []);

  const removeAddOn = useCallback(async (id) => {
    await deleteQuotationAddOn(id);
    setAddOnProducts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const toggleAddOnPublish = useCallback(async (id) => {
    const response = await toggleQuotationAddOnPublish(id);
    setAddOnProducts((prev) => prev.map((item) => (item.id === id ? response.data : item)));
    return response.data;
  }, []);

  const changeQuoteStatus = useCallback(async (id, status) => {
    setQuoteStatusLoadingId(id);
    try {
      const response = await updateQuoteStatus(id, status);
      setRecentQuotes((prev) => prev.map((item) => (item._id === id ? response.data : item)));
      return response.data;
    } finally {
      setQuoteStatusLoadingId(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      ...state,
      ...pricing,
      packages,
      addOnProducts,
      isLoading,
      packagesLoading,
      addOnsLoading,
      quotesLoading,
      quoteStatusLoadingId,
      recentQuotes,
      quotesPagination,
      quoteStats,
      isAdmin: adminMode,
      dispatch,
      nextStep: () => dispatch({ type: 'NEXT_STEP' }),
      prevStep: () => dispatch({ type: 'PREV_STEP' }),
      resetQuote: () => dispatch({ type: 'RESET_QUOTATION' }),
      loadPackages,
      loadAddOns,
      loadCatalog,
      loadQuoteHistory,
      loadQuoteDashboard,
      submitQuote,
      createNewQuote,
      updateExistingQuote,
      savePackage,
      removePackage,
      togglePackagePublish,
      saveAddOn,
      removeAddOn,
      toggleAddOnPublish,
      changeQuoteStatus,
    }),
    [
      state,
      pricing,
      packages,
      addOnProducts,
      isLoading,
      packagesLoading,
      addOnsLoading,
      quotesLoading,
      quoteStatusLoadingId,
      recentQuotes,
      quotesPagination,
      quoteStats,
      adminMode,
      loadPackages,
      loadAddOns,
      loadCatalog,
      loadQuoteHistory,
      loadQuoteDashboard,
      submitQuote,
      createNewQuote,
      updateExistingQuote,
      savePackage,
      removePackage,
      togglePackagePublish,
      saveAddOn,
      removeAddOn,
      toggleAddOnPublish,
      changeQuoteStatus,
    ]
  );

  return <QuotationContext.Provider value={value}>{children}</QuotationContext.Provider>;
};

export const useQuotation = () => {
  const context = useContext(QuotationContext);
  if (!context) {
    throw new Error('useQuotation must be used within a QuotationProvider');
  }
  return context;
};
