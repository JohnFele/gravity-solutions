import { useEffect, useMemo, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineFileText,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineMail,
} from 'react-icons/ai';
import { FiClock, FiInbox } from 'react-icons/fi';
import Sidebar from '../components/dashboard/sidebar/Sidebar';
import Header from '../components/dashboard/header/Header';
import PageFilterBar from '../components/dashboard/PageFilterBar';
import QuotationLoader from '../components/quotation/QuotationLoader';
import { useAuth } from '../context/AuthContext';
import { useQuotation } from '../context/QuotationContext';

const currencyFormatter = new Intl.NumberFormat('en-ZA', {
  style: 'currency',
  currency: 'ZAR',
  maximumFractionDigits: 0,
});

const dateFormatter = new Intl.DateTimeFormat('en-ZA', {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const formatCurrency = (value) => currencyFormatter.format(Number(value || 0));

const formatDate = (value) => {
  if (!value) return 'N/A';
  const parsedDate = new Date(value);
  return Number.isNaN(parsedDate.getTime()) ? 'N/A' : dateFormatter.format(parsedDate);
};

const QuoteHistory = () => {
  const { profileData: user } = useAuth();
  const { isLoading, quotesLoading, recentQuotes, quotesPagination, loadQuoteHistory } = useQuotation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [quotePage, setQuotePage] = useState(1);
  const previousSearchRef = useRef('');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setSidebarCollapsed(true);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const trimmedSearch = searchQuery.trim();

    if (previousSearchRef.current !== trimmedSearch && quotePage !== 1) {
      previousSearchRef.current = trimmedSearch;
      setQuotePage(1);
      return undefined;
    }

    previousSearchRef.current = trimmedSearch;

    const timeoutId = window.setTimeout(() => {
      loadQuoteHistory({ page: quotePage, limit: 12, search: trimmedSearch });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [loadQuoteHistory, quotePage, searchQuery]);

  const filteredQuotes = useMemo(() => {
    const filteredItems = recentQuotes.filter((quote) =>
      activeCategory === 'all' ? true : String(quote.status || 'submitted') === activeCategory
    );

    return [...filteredItems].sort((left, right) => {
      switch (sortBy) {
        case 'oldest':
          return new Date(left.createdAt || 0) - new Date(right.createdAt || 0);
        case 'highest-value':
          return Number(right.totalInclVAT || 0) - Number(left.totalInclVAT || 0);
        case 'lowest-value':
          return Number(left.totalInclVAT || 0) - Number(right.totalInclVAT || 0);
        case 'reference':
          return String(left.reference || '').localeCompare(String(right.reference || ''));
        case 'company':
          return String(left.customerDetails?.company || '').localeCompare(
            String(right.customerDetails?.company || '')
          );
        case 'newest':
        default:
          return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
      }
    });
  }, [activeCategory, recentQuotes, sortBy]);

  const categories = [
    { id: 'all', name: 'All Quotes' },
    { id: 'submitted', name: 'Submitted' },
    { id: 'emailed', name: 'Emailed' },
    { id: 'viewed', name: 'Viewed' },
    { id: 'archived', name: 'Archived' },
  ];

  const sortOptions = [
    { id: 'newest', name: 'Newest First' },
    { id: 'oldest', name: 'Oldest First' },
    { id: 'highest-value', name: 'Highest Value' },
    { id: 'lowest-value', name: 'Lowest Value' },
    { id: 'reference', name: 'Reference' },
    { id: 'company', name: 'Company' },
  ];

  if (isLoading) {
    return <QuotationLoader message="Loading your quote history..." />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {isMobile && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="fixed right-4 top-2 z-50 rounded-xl border border-slate-700/50 bg-slate-800/95 p-3 text-white shadow-lg backdrop-blur-xl md:hidden"
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
          searchPlaceholder="Search your quotes..."
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
                <AiOutlineFileText className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">Quote History</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Review the quotations you have already submitted.
                </p>
              </div>
            </div>
            <div className="hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-3 md:block">
              <p className="flex items-center text-sm font-medium text-white">
                <FiClock className="mr-2 text-emerald-400" />
                {quotesLoading ? 'Refreshing history...' : `${recentQuotes.length} quotes loaded`}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {quotesPagination?.total ? `${quotesPagination.total.toLocaleString()} total quotes found` : 'No quote history yet'}
              </p>
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

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 backdrop-blur-xl">
            <div className="border-b border-slate-700/50 p-5">
              <h2 className="flex items-center text-xl font-bold text-white">
                <FiClock className="mr-2 text-emerald-400" />
                Recent Quotes
              </h2>
              <p className="mt-1 text-sm text-slate-400">
                {searchQuery ? `Search results for "${searchQuery}"` : 'Your latest submitted quotation requests'}
              </p>
            </div>

            {quotesLoading ? (
              <div className="space-y-3 p-5">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div
                    key={`user-quote-skeleton-${index}`}
                    className="animate-pulse rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4"
                  >
                    <div className="mb-3 h-4 w-40 rounded bg-slate-700" />
                    <div className="mb-2 h-3 w-full rounded bg-slate-700" />
                    <div className="h-3 w-2/3 rounded bg-slate-700" />
                  </div>
                ))}
              </div>
            ) : filteredQuotes.length ? (
              <div className="space-y-3 p-5">
                {filteredQuotes.map((quote) => (
                  <div
                    key={quote._id || quote.reference}
                    className="rounded-2xl border border-slate-700/50 bg-slate-800/30 p-4"
                  >
                    <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                      <div className="min-w-0 flex-1">
                        <div className="mb-3 flex flex-wrap items-center gap-2">
                          <span className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-medium text-emerald-300">
                            {quote.reference}
                          </span>
                          <span className="rounded-full bg-slate-700/70 px-3 py-1 text-xs text-slate-300">
                            {quote.packageSnapshot?.name || 'Unknown package'}
                          </span>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              quote.emailSent
                                ? 'bg-emerald-500/15 text-emerald-300'
                                : 'bg-amber-500/15 text-amber-300'
                            }`}
                          >
                            {quote.emailSent ? 'Emailed' : 'Pending email'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Company</p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {quote.customerDetails?.company || 'No company'}
                            </p>
                            <p className="text-sm text-slate-400">
                              {quote.customerDetails?.firstName} {quote.customerDetails?.lastName}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Submitted</p>
                            <p className="mt-1 text-sm font-medium text-white">{formatDate(quote.createdAt)}</p>
                            <p className="text-sm text-slate-400 capitalize">{quote.status || 'submitted'}</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Configuration</p>
                            <p className="mt-1 text-sm font-medium text-white">
                              {quote.packageSnapshot?.selectedHeadsetCount || 0} headsets
                            </p>
                            <p className="text-sm text-slate-400">{quote.addOnCount || 0} add-ons selected</p>
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Contact Email</p>
                            <p className="mt-1 flex items-center text-sm font-medium text-white">
                              <AiOutlineMail className="mr-2 text-emerald-400" />
                              {quote.customerDetails?.email}
                            </p>
                          </div>
                        </div>

                        {quote.customerDetails?.notes ? (
                          <div className="mt-4 rounded-xl border border-slate-700/50 bg-slate-900/40 p-3">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Notes</p>
                            <p className="mt-2 text-sm text-slate-300">{quote.customerDetails.notes}</p>
                          </div>
                        ) : null}
                      </div>

                      <div className="xl:w-56">
                        <div className="rounded-2xl border border-slate-700/50 bg-slate-900/50 p-4">
                          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Quote Value</p>
                          <p className="mt-2 text-2xl font-bold text-emerald-400">
                            {formatCurrency(quote.totalInclVAT)}
                          </p>
                          <div className="mt-4 space-y-2 text-sm text-slate-400">
                            <div className="flex justify-between gap-3">
                              <span>Subtotal</span>
                              <span className="text-slate-200">{formatCurrency(quote.subtotalExVAT)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span>VAT</span>
                              <span className="text-slate-200">{formatCurrency(quote.vat)}</span>
                            </div>
                            <div className="flex justify-between gap-3">
                              <span>Status</span>
                              <span className="text-slate-200 capitalize">{quote.status || 'submitted'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {quotesPagination ? (
                  <div className="flex flex-col gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/30 p-4 md:flex-row md:items-center md:justify-between">
                    <p className="text-sm text-slate-400">
                      Page {quotePage} of {quotesPagination.totalPages || 1}
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setQuotePage((prev) => Math.max(1, prev - 1))}
                        disabled={quotePage <= 1 || quotesLoading}
                        className="flex items-center rounded-xl bg-slate-700/70 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <AiOutlineLeft className="mr-2" />
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() => setQuotePage((prev) => prev + 1)}
                        disabled={!quotesPagination.hasMore || quotesLoading}
                        className="flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        Next
                        <AiOutlineRight className="ml-2" />
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="p-10 text-center text-slate-400">
                <FiInbox className="mx-auto mb-3 h-8 w-8 text-slate-500" />
                <p className="text-base text-slate-300">
                  {searchQuery || activeCategory !== 'all'
                    ? 'No quotes matched the current filters.'
                    : 'You have not submitted any quotes yet.'}
                </p>
                <p className="mt-2 text-sm text-slate-500">
                  When you send a quotation from the builder, it will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteHistory;
