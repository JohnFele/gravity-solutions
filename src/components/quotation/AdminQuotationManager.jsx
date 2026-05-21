import { useEffect, useMemo, useRef, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  AiOutlineMenu,
  AiOutlineClose,
  AiOutlineShoppingCart,
  AiOutlineSetting,
  AiOutlineBarChart,
  AiOutlineMail,
  AiOutlineEye,
  AiOutlineInbox,
  AiOutlineLeft,
  AiOutlineRight,
  AiOutlineEdit,
  AiOutlinePlus,
  AiOutlineMinus,
  AiOutlineSave,
  AiOutlineMore,
} from 'react-icons/ai';
import { FiPackage, FiGrid, FiTrendingUp, FiClock, FiInbox } from 'react-icons/fi';
import Sidebar from '../dashboard/sidebar/Sidebar';
import Header from '../dashboard/header/Header';
import PageFilterBar from '../dashboard/PageFilterBar';
import { useAuth } from '../../context/AuthContext';
import { useQuotation } from '../../context/QuotationContext';
import { useAlert } from '../../context/AlertContext';
import AdminPackageManager from './AdminPackageManager';
import AdminAddOnManager from './AdminAddOnManager';
import QuotationLoader from './QuotationLoader';

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
  if (Number.isNaN(parsedDate.getTime())) {
    return 'N/A';
  }

  return dateFormatter.format(parsedDate);
};

const getRequestedByLabel = (quote) => {
  const requester = quote?.requestedBy;
  if (!requester) {
    return 'Guest quote';
  }

  const fullName = [requester.firstName, requester.lastName].filter(Boolean).join(' ').trim();
  return fullName || requester.userName || requester.email || 'Unknown user';
};

const createEmptyQuoteForm = () => ({
  customerDetails: {
    firstName: '',
    lastName: '',
    email: '',
    company: '',
    phone: '',
    notes: '',
  },
  selectedPackage: '',
  customHeadsetCount: 10,
  selectedAddOns: [],
  status: 'submitted',
  emailSent: false,
});

const QuoteEditorModal = ({
  isOpen,
  isSaving,
  formState,
  packages,
  addOnProducts,
  onClose,
  onChange,
  onSelectPackage,
  onChangeHeadsetCount,
  onAddAddOn,
  onUpdateAddOnQuantity,
  onRemoveAddOn,
  onSave,
  isEditing,
}) => {
  if (!isOpen) {
    return null;
  }

  const selectedPackage = packages.find((pkg) => pkg.id === formState.selectedPackage);

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl border border-slate-700/50 bg-slate-900 p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">
              {isEditing ? 'Edit Quote' : 'Create Quote'}
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              Attach a package and add-ons directly to the quote record.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-700/50 p-2 text-slate-400 transition-colors hover:text-white"
          >
            <AiOutlineClose className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Customer Details</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <input
                  type="text"
                  value={formState.customerDetails.firstName}
                  onChange={(event) => onChange('firstName', event.target.value)}
                  placeholder="First name"
                  className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white"
                />
                <input
                  type="text"
                  value={formState.customerDetails.lastName}
                  onChange={(event) => onChange('lastName', event.target.value)}
                  placeholder="Last name"
                  className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white"
                />
                <input
                  type="email"
                  value={formState.customerDetails.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  placeholder="Email address"
                  className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white md:col-span-2"
                />
                <input
                  type="text"
                  value={formState.customerDetails.company}
                  onChange={(event) => onChange('company', event.target.value)}
                  placeholder="Company or school"
                  className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white"
                />
                <input
                  type="text"
                  value={formState.customerDetails.phone}
                  onChange={(event) => onChange('phone', event.target.value)}
                  placeholder="Phone"
                  className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white"
                />
                <textarea
                  value={formState.customerDetails.notes}
                  onChange={(event) => onChange('notes', event.target.value)}
                  placeholder="Notes"
                  rows="4"
                  className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white md:col-span-2"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
              <h3 className="mb-4 text-lg font-semibold text-white">Quote Configuration</h3>
              <div className="space-y-4">
                <select
                  value={formState.selectedPackage}
                  onChange={(event) => onSelectPackage(event.target.value)}
                  className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white"
                >
                  <option value="">Select a package</option>
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name}
                    </option>
                  ))}
                </select>

                {selectedPackage?.isCustom ? (
                  <input
                    type="number"
                    min="10"
                    value={formState.customHeadsetCount}
                    onChange={(event) => onChangeHeadsetCount(event.target.value)}
                    placeholder="Headset count"
                    className="w-full rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white"
                  />
                ) : null}

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <select
                    value={formState.status}
                    onChange={(event) => onChange('status', event.target.value, 'meta')}
                    className="rounded-xl border border-slate-600 bg-slate-800 px-4 py-3 text-white"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="emailed">Emailed</option>
                    <option value="viewed">Viewed</option>
                    <option value="archived">Archived</option>
                  </select>
                  <label className="flex items-center gap-3 rounded-xl border border-slate-700/50 bg-slate-800 px-4 py-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={formState.emailSent}
                      onChange={(event) => onChange('emailSent', event.target.checked, 'meta')}
                    />
                    Email sent
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-5">
            <h3 className="mb-4 text-lg font-semibold text-white">Attach Add-ons</h3>
            <div className="space-y-3">
              {addOnProducts.map((addOn) => {
                const selected = formState.selectedAddOns.find((item) => item.id === addOn.id);
                return (
                  <div
                    key={addOn.id}
                    className="rounded-2xl border border-slate-700/50 bg-slate-900/60 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-white">{addOn.name}</p>
                        <p className="mt-1 text-sm text-slate-400">{addOn.category}</p>
                        <p className="mt-2 text-sm text-emerald-300">{formatCurrency(addOn.price)}</p>
                      </div>
                      {selected ? (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              selected.quantity <= 1
                                ? onRemoveAddOn(addOn.id)
                                : onUpdateAddOnQuantity(addOn.id, selected.quantity - 1)
                            }
                            className="rounded-lg bg-slate-700 p-2 text-white"
                          >
                            <AiOutlineMinus />
                          </button>
                          <span className="w-8 text-center text-white">{selected.quantity}</span>
                          <button
                            type="button"
                            onClick={() => onUpdateAddOnQuantity(addOn.id, selected.quantity + 1)}
                            className="rounded-lg bg-slate-700 p-2 text-white"
                          >
                            <AiOutlinePlus />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onAddAddOn(addOn.id)}
                          className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white"
                        >
                          Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-700/70 px-5 py-3 text-sm font-medium text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-3 text-sm font-medium text-white disabled:opacity-60"
          >
            <AiOutlineSave className="mr-2" />
            {isSaving ? 'Saving...' : isEditing ? 'Update Quote' : 'Create Quote'}
          </button>
        </div>
      </div>
    </div>
  );
};

const QuoteStatsSection = ({
  quoteStats,
  quotesPagination,
  recentQuotes,
  quotesLoading,
  quoteStatusLoadingId,
  searchQuery,
  activeCategory,
  sortBy,
  currentPage,
  onPageChange,
  onStatusChange,
  onOpenCreateQuote,
  onOpenEditQuote,
  onRefreshQuotes,
}) => {
  const [openMobileActionsId, setOpenMobileActionsId] = useState(null);

  const filteredQuotes = useMemo(() => {
    const nextQuotes = recentQuotes.filter((quote) =>
      activeCategory === 'all' ? true : String(quote.status || 'submitted') === activeCategory
    );

    return [...nextQuotes].sort((left, right) => {
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

  const resolvedTotalQuotes = Number(quotesPagination?.total || quoteStats?.totalQuotes || 0);

  const closeMobileActions = () => setOpenMobileActionsId(null);

  const getQuoteActionId = (quote) => quote._id || quote.reference;

  const handleMobileAction = (action) => {
    action();
    closeMobileActions();
  };
  const statsCards = [
    {
      id: 'total-quotes',
      label: 'Total Quotes',
      value: resolvedTotalQuotes.toLocaleString(),
      helper: resolvedTotalQuotes ? `${resolvedTotalQuotes} stored in history` : 'No stored quotes yet',
      icon: <AiOutlineBarChart className="h-5 w-5" />,
      accent: 'from-cyan-500 to-blue-600',
    },
    {
      id: 'revenue',
      label: 'Total Quoted Revenue',
      value: formatCurrency(quoteStats?.totalRevenue),
      helper: 'Inclusive of VAT',
      icon: <FiTrendingUp className="h-5 w-5" />,
      accent: 'from-emerald-500 to-teal-600',
    },
    {
      id: 'average',
      label: 'Average Quote Value',
      value: formatCurrency(quoteStats?.averageQuoteValue),
      helper: 'Average per submitted quote',
      icon: <AiOutlineShoppingCart className="h-5 w-5" />,
      accent: 'from-amber-500 to-orange-600',
    },
    {
      id: 'popular-package',
      label: 'Most Popular Package',
      value: quoteStats?.mostPopularPackage?.name || 'No data yet',
      helper: quoteStats?.mostPopularPackage?.quoteCount
        ? `${quoteStats.mostPopularPackage.quoteCount} quotes`
        : 'Waiting for quote data',
      icon: <FiPackage className="h-5 w-5" />,
      accent: 'from-violet-500 to-indigo-600',
    },
    {
      id: 'popular-addon',
      label: 'Most Popular Add-on',
      value: quoteStats?.mostPopularAddOn?.name || 'No data yet',
      helper: quoteStats?.mostPopularAddOn?.quantity
        ? `${quoteStats.mostPopularAddOn.quantity} units quoted`
        : 'Waiting for quote data',
      icon: <FiGrid className="h-5 w-5" />,
      accent: 'from-fuchsia-500 to-pink-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        {statsCards.map((card) => (
          <div
            key={card.id}
            className="rounded-2xl border border-slate-700/50 bg-slate-900/40 p-4"
          >
            <div className="mb-4 flex items-center justify-between">
              <div className={`rounded-xl bg-gradient-to-r ${card.accent} p-2 text-white`}>
                {card.icon}
              </div>
              <span className="text-xs uppercase tracking-[0.2em] text-slate-500">Stats</span>
            </div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{card.label}</p>
            <p className="mt-2 text-lg font-semibold text-white">{card.value}</p>
            <p className="mt-1 text-sm text-slate-400">{card.helper}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-700/50 bg-slate-900/40">
        <div className="flex flex-col gap-3 border-b border-slate-700/50 p-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="flex items-center text-xl font-bold text-white">
              <FiClock className="mr-2 text-purple-400" />
              Recent Quote History
            </h2>
            <p className="mt-1 text-sm text-slate-400">
              {searchQuery
                ? `Search results for "${searchQuery}"`
                : 'Latest quotations submitted through the builder'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenCreateQuote}
              className="rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              New Quote
            </button>
            <button
              type="button"
              onClick={onRefreshQuotes}
              className="rounded-xl bg-slate-700/80 px-4 py-2 text-sm font-medium text-white"
            >
              Refresh
            </button>
            {quotesPagination && (
              <div className="text-sm text-slate-400">
                Showing {recentQuotes.length} of {quotesPagination.total.toLocaleString()} quotes
              </div>
            )}
          </div>
        </div>

        {quotesLoading ? (
          <div className="space-y-3 p-5">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`quote-skeleton-${index}`}
                className="animate-pulse rounded-2xl border border-slate-800 bg-slate-800/50 p-4"
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
                className="rounded-2xl border border-slate-700/50 bg-slate-800/40 p-4"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-purple-500/15 px-3 py-1 text-xs font-medium text-purple-300">
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
                        {quote.emailSent ? 'Email sent' : 'Email pending'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Customer</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {quote.customerDetails?.firstName} {quote.customerDetails?.lastName}
                        </p>
                        <p className="text-sm text-slate-400">{quote.customerDetails?.email}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Company</p>
                        <p className="mt-1 text-sm font-medium text-white">
                          {quote.customerDetails?.company || 'No company'}
                        </p>
                        <p className="text-sm text-slate-400">
                          {quote.packageSnapshot?.selectedHeadsetCount || 0} headsets, {quote.addOnCount || 0} add-ons
                        </p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Requested By</p>
                        <p className="mt-1 text-sm font-medium text-white">{getRequestedByLabel(quote)}</p>
                        <p className="text-sm text-slate-400 capitalize">{quote.status || 'submitted'}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Submitted</p>
                        <p className="mt-1 text-sm font-medium text-white">{formatDate(quote.createdAt)}</p>
                        <p className="text-sm text-slate-400">VAT incl. total</p>
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
                      <div className="mt-4 hidden space-y-2 md:block">
                        <button
                          type="button"
                          onClick={() => onOpenEditQuote(quote)}
                          className="flex w-full items-center justify-center rounded-xl bg-blue-500/15 px-3 py-2 text-sm font-medium text-blue-300 transition-colors hover:bg-blue-500/25"
                        >
                          <AiOutlineEdit className="mr-2" />
                          Edit Quote
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange(quote, 'viewed')}
                          disabled={quote.status === 'viewed' || quoteStatusLoadingId === quote._id}
                          className="flex w-full items-center justify-center rounded-xl bg-slate-700/70 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <AiOutlineEye className="mr-2" />
                          {quoteStatusLoadingId === quote._id && quote.status !== 'viewed'
                            ? 'Updating...'
                            : quote.status === 'viewed'
                              ? 'Viewed'
                              : 'Mark Viewed'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onStatusChange(quote, 'archived')}
                          disabled={quote.status === 'archived' || quoteStatusLoadingId === quote._id}
                          className="flex w-full items-center justify-center rounded-xl bg-amber-500/15 px-3 py-2 text-sm font-medium text-amber-300 transition-colors hover:bg-amber-500/25 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <AiOutlineInbox className="mr-2" />
                          {quote.status === 'archived' ? 'Archived' : 'Archive'}
                        </button>
                      </div>
                      <div className="relative mt-4 md:hidden">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenMobileActionsId((currentId) =>
                              currentId === getQuoteActionId(quote) ? null : getQuoteActionId(quote)
                            )
                          }
                          className="flex w-full items-center justify-center rounded-xl bg-slate-700/70 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
                          aria-label="Open quote actions"
                        >
                          <AiOutlineMore className="h-5 w-5" />
                        </button>

                        {openMobileActionsId === getQuoteActionId(quote) && (
                          <div className="absolute right-0 top-11 z-20 w-48 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-xl">
                            <button
                              type="button"
                              onClick={() => handleMobileAction(() => onOpenEditQuote(quote))}
                              className="flex w-full items-center px-4 py-3 text-left text-sm text-blue-300 transition-colors hover:bg-slate-800"
                            >
                              <AiOutlineEdit className="mr-2" />
                              Edit Quote
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMobileAction(() => onStatusChange(quote, 'viewed'))}
                              disabled={quote.status === 'viewed' || quoteStatusLoadingId === quote._id}
                              className="flex w-full items-center px-4 py-3 text-left text-sm text-white transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <AiOutlineEye className="mr-2" />
                              {quoteStatusLoadingId === quote._id && quote.status !== 'viewed'
                                ? 'Updating...'
                                : quote.status === 'viewed'
                                  ? 'Viewed'
                                  : 'Mark Viewed'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleMobileAction(() => onStatusChange(quote, 'archived'))}
                              disabled={quote.status === 'archived' || quoteStatusLoadingId === quote._id}
                              className="flex w-full items-center px-4 py-3 text-left text-sm text-amber-300 transition-colors hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                              <AiOutlineInbox className="mr-2" />
                              {quote.status === 'archived' ? 'Archived' : 'Archive'}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {quotesPagination ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/30 p-4 md:flex-row md:items-center md:justify-between">
                <p className="text-sm text-slate-400">
                  Page {currentPage} of {quotesPagination.totalPages || 1}
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1 || quotesLoading}
                    className="flex items-center rounded-xl bg-slate-700/70 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <AiOutlineLeft className="mr-2" />
                    Previous
                  </button>
                  <button
                    type="button"
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={!quotesPagination.hasMore || quotesLoading}
                    className="flex items-center rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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
                : 'No quotations have been submitted yet.'}
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Submitted quotes will appear here with package popularity and revenue stats.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

const AdminQuotationContent = () => {
  const { profileData: user } = useAuth();
  const { showAlert } = useAlert();
  const {
    isLoading,
    quotesLoading,
    quoteStatusLoadingId,
    recentQuotes,
    quotesPagination,
    quoteStats,
    packages,
    addOnProducts,
    loadPackages,
    loadAddOns,
    loadQuoteDashboard,
    changeQuoteStatus,
    createNewQuote,
    updateExistingQuote,
  } = useQuotation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('packages');
  const [searchQueries, setSearchQueries] = useState({
    packages: '',
    addons: '',
    quotes: '',
  });
  const [tabFilters, setTabFilters] = useState({
    packages: 'all',
    addons: 'all',
    quotes: 'all',
  });
  const [tabSorts, setTabSorts] = useState({
    packages: 'name-asc',
    addons: 'name-asc',
    quotes: 'newest',
  });
  const [quotePage, setQuotePage] = useState(1);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [editingQuoteId, setEditingQuoteId] = useState(null);
  const [isSavingQuote, setIsSavingQuote] = useState(false);
  const [quoteForm, setQuoteForm] = useState(createEmptyQuoteForm());
  const previousQuoteSearchRef = useRef('');

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
    if (activeTab !== 'quotes') {
      return undefined;
    }

    const trimmedSearch = searchQueries.quotes.trim();

    if (previousQuoteSearchRef.current !== trimmedSearch && quotePage !== 1) {
      previousQuoteSearchRef.current = trimmedSearch;
      setQuotePage(1);
      return undefined;
    }

    previousQuoteSearchRef.current = trimmedSearch;

    const timeoutId = window.setTimeout(() => {
      loadQuoteDashboard({ page: quotePage, limit: 20, search: trimmedSearch });
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [activeTab, quotePage, searchQueries.quotes, loadQuoteDashboard]);

  const searchPlaceholder = useMemo(() => {
    if (activeTab === 'packages') return 'Search packages...';
    if (activeTab === 'addons') return 'Search add-ons...';
    return 'Search recent quotes...';
  }, [activeTab]);

  const activeSearchQuery = searchQueries[activeTab] || '';
  const activeFilter = tabFilters[activeTab] || 'all';
  const activeSort = tabSorts[activeTab] || 'name-asc';

  const filterCategories = useMemo(() => {
    if (activeTab === 'packages') {
      return [
        { id: 'all', name: 'All Packages' },
        { id: 'published', name: 'Published' },
        { id: 'unpublished', name: 'Unpublished' },
        { id: 'popular', name: 'Popular' },
        { id: 'custom', name: 'Custom' },
      ];
    }

    if (activeTab === 'addons') {
      return [
        { id: 'all', name: 'All Add-ons' },
        { id: 'app', name: 'Apps' },
        { id: 'license', name: 'Licenses' },
        { id: 'service', name: 'Services' },
        { id: 'hardware', name: 'Hardware' },
        { id: 'popular', name: 'Popular' },
      ];
    }

    return [
      { id: 'all', name: 'All Quotes' },
      { id: 'submitted', name: 'Submitted' },
      { id: 'emailed', name: 'Emailed' },
      { id: 'viewed', name: 'Viewed' },
      { id: 'archived', name: 'Archived' },
    ];
  }, [activeTab]);

  const sortOptions = useMemo(() => {
    if (activeTab === 'packages') {
      return [
        { id: 'name-asc', name: 'Name A-Z' },
        { id: 'name-desc', name: 'Name Z-A' },
        { id: 'price-low', name: 'Price Low-High' },
        { id: 'price-high', name: 'Price High-Low' },
        { id: 'headsets-low', name: 'Headsets Low-High' },
        { id: 'headsets-high', name: 'Headsets High-Low' },
      ];
    }

    if (activeTab === 'addons') {
      return [
        { id: 'name-asc', name: 'Name A-Z' },
        { id: 'name-desc', name: 'Name Z-A' },
        { id: 'price-low', name: 'Price Low-High' },
        { id: 'price-high', name: 'Price High-Low' },
        { id: 'category', name: 'Category' },
      ];
    }

    return [
      { id: 'newest', name: 'Newest First' },
      { id: 'oldest', name: 'Oldest First' },
      { id: 'highest-value', name: 'Highest Value' },
      { id: 'lowest-value', name: 'Lowest Value' },
      { id: 'reference', name: 'Reference' },
      { id: 'company', name: 'Company' },
    ];
  }, [activeTab]);

  const handleSearchQueryChange = (value) => {
    setSearchQueries((prev) => ({
      ...prev,
      [activeTab]: value,
    }));
  };

  const handleFilterChange = (value) => {
    setTabFilters((prev) => ({
      ...prev,
      [activeTab]: value,
    }));
  };

  const handleSortChange = (value) => {
    setTabSorts((prev) => ({
      ...prev,
      [activeTab]: value,
    }));
  };

  if (isLoading) {
    return <QuotationLoader message="Loading quotation data..." />;
  }

  const handleStatusChange = async (quote, status) => {
    if (!quote?._id || quote.status === status) {
      return;
    }

    try {
      await changeQuoteStatus(quote._id, status);
      showAlert('Quote status updated', { type: 'success', duration: 2500 });
    } catch (error) {
      showAlert(error?.message || 'Failed to update quote status', {
        type: 'error',
        duration: 4000,
      });
    }
  };

  const refreshQuoteDashboard = async () => {
    await loadQuoteDashboard({
      page: quotePage,
      limit: 20,
      search: previousQuoteSearchRef.current,
    });
  };

  const openCreateQuoteModal = async () => {
    await Promise.all([loadPackages({ search: '' }), loadAddOns({ search: '' })]);
    setEditingQuoteId(null);
    setQuoteForm(createEmptyQuoteForm());
    setIsQuoteModalOpen(true);
  };

  const openEditQuoteModal = async (quote) => {
    await Promise.all([loadPackages({ search: '' }), loadAddOns({ search: '' })]);
    setEditingQuoteId(quote._id);
    setQuoteForm({
      customerDetails: {
        firstName: quote.customerDetails?.firstName || '',
        lastName: quote.customerDetails?.lastName || '',
        email: quote.customerDetails?.email || '',
        company: quote.customerDetails?.company || '',
        phone: quote.customerDetails?.phone || '',
        notes: quote.customerDetails?.notes || '',
      },
      selectedPackage: quote.packageSnapshot?.key || '',
      customHeadsetCount: quote.packageSnapshot?.selectedHeadsetCount || 10,
      selectedAddOns: (quote.addOns || []).map((item) => ({
        id: item.key,
        quantity: item.quantity,
      })),
      status: quote.status || 'submitted',
      emailSent: Boolean(quote.emailSent),
    });
    setIsQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setIsQuoteModalOpen(false);
    setEditingQuoteId(null);
    setQuoteForm(createEmptyQuoteForm());
  };

  const handleQuoteFieldChange = (field, value, scope = 'customer') => {
    if (scope === 'meta') {
      setQuoteForm((prev) => ({ ...prev, [field]: value }));
      return;
    }

    setQuoteForm((prev) => ({
      ...prev,
      customerDetails: {
        ...prev.customerDetails,
        [field]: value,
      },
    }));
  };

  const handleQuotePackageChange = (packageId) => {
    const nextPackage = packages.find((pkg) => pkg.id === packageId);
    setQuoteForm((prev) => ({
      ...prev,
      selectedPackage: packageId,
      customHeadsetCount: nextPackage?.isCustom
        ? Math.max(10, prev.customHeadsetCount || 10)
        : nextPackage?.headsetCount || prev.customHeadsetCount,
    }));
  };

  const handleAddQuoteAddOn = (addOnId) => {
    setQuoteForm((prev) => ({
      ...prev,
      selectedAddOns: [...prev.selectedAddOns, { id: addOnId, quantity: 1 }],
    }));
  };

  const handleUpdateQuoteAddOnQuantity = (addOnId, quantity) => {
    setQuoteForm((prev) => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.map((item) =>
        item.id === addOnId ? { ...item, quantity: Math.max(1, quantity) } : item
      ),
    }));
  };

  const handleRemoveQuoteAddOn = (addOnId) => {
    setQuoteForm((prev) => ({
      ...prev,
      selectedAddOns: prev.selectedAddOns.filter((item) => item.id !== addOnId),
    }));
  };

  const handleSaveQuote = async () => {
    if (
      !quoteForm.customerDetails.firstName ||
      !quoteForm.customerDetails.lastName ||
      !quoteForm.customerDetails.email ||
      !quoteForm.customerDetails.company ||
      !quoteForm.selectedPackage
    ) {
      showAlert('Complete the customer details and select a package before saving the quote.', {
        type: 'warning',
        duration: 3500,
      });
      return;
    }

    setIsSavingQuote(true);
    try {
      const payload = {
        customerDetails: quoteForm.customerDetails,
        selectedPackage: quoteForm.selectedPackage,
        customHeadsetCount: quoteForm.customHeadsetCount,
        selectedAddOns: quoteForm.selectedAddOns,
        status: quoteForm.status,
        emailSent: quoteForm.emailSent,
      };

      if (editingQuoteId) {
        await updateExistingQuote(editingQuoteId, payload);
        showAlert('Quote updated successfully', { type: 'success', duration: 2500 });
      } else {
        await createNewQuote(payload);
        showAlert('Quote created successfully', { type: 'success', duration: 2500 });
      }

      await refreshQuoteDashboard();
      closeQuoteModal();
    } catch (error) {
      showAlert(error?.message || 'Failed to save quote', { type: 'error', duration: 4500 });
    } finally {
      setIsSavingQuote(false);
    }
  };

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

      <div
        className={`transition-all duration-300 ${
          isMobile ? 'ml-0' : sidebarCollapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        <Header
          searchQuery={activeSearchQuery}
          setSearchQuery={handleSearchQueryChange}
          searchPlaceholder={searchPlaceholder}
        />

        <div className="p-4 md:p-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 flex items-center justify-between"
          >
            <div className="flex items-center space-x-3">
              <div className="rounded-lg bg-gradient-to-r from-purple-500 to-indigo-600 p-2 text-white">
                <AiOutlineSetting className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white md:text-3xl">Quotation Manager</h1>
                <p className="mt-1 text-sm text-slate-400">
                  Manage the quotation catalog and track submitted quote performance.
                </p>
              </div>
            </div>
            {activeTab === 'quotes' ? (
              <div className="hidden rounded-2xl border border-slate-700/50 bg-slate-800/40 px-4 py-3 md:block">
                <p className="flex items-center text-sm font-medium text-white">
                  <AiOutlineMail className="mr-2 text-emerald-400" />
                  {quotesLoading ? 'Refreshing quote history...' : `${recentQuotes.length} recent quotes loaded`}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  {quotesPagination?.total
                    ? `${quotesPagination.total.toLocaleString()} total quotes recorded`
                    : 'No quote history recorded yet'}
                </p>
              </div>
            ) : null}
          </motion.div>

          <div className="mb-6 flex overflow-x-auto border-b border-slate-700/50">
            <button
              onClick={() => setActiveTab('packages')}
              className={`whitespace-nowrap px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'packages'
                  ? 'border-b-2 border-purple-400 text-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <FiPackage className="mr-2 inline" />
              Packages
            </button>
            <button
              onClick={() => setActiveTab('addons')}
              className={`whitespace-nowrap px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'addons'
                  ? 'border-b-2 border-purple-400 text-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <FiGrid className="mr-2 inline" />
              Add-ons
            </button>
            <button
              onClick={() => setActiveTab('quotes')}
              className={`whitespace-nowrap px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'quotes'
                  ? 'border-b-2 border-purple-400 text-purple-400'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              <AiOutlineShoppingCart className="mr-2 inline" />
              Recent Quotes
            </button>
          </div>

          <PageFilterBar
            categories={filterCategories}
            activeCategory={activeFilter}
            onCategoryChange={handleFilterChange}
            sortOptions={sortOptions}
            activeSort={activeSort}
            onSortChange={handleSortChange}
          />

          <div className="rounded-2xl border border-slate-700/50 bg-slate-800/50 p-6 backdrop-blur-xl">
            {activeTab === 'packages' && (
              <AdminPackageManager
                searchQuery={searchQueries.packages}
                activeCategory={tabFilters.packages}
                sortBy={tabSorts.packages}
              />
            )}
            {activeTab === 'addons' && (
              <AdminAddOnManager
                searchQuery={searchQueries.addons}
                activeCategory={tabFilters.addons}
                sortBy={tabSorts.addons}
              />
            )}
            {activeTab === 'quotes' && (
              <QuoteStatsSection
                quoteStats={quoteStats}
                quotesPagination={quotesPagination}
                recentQuotes={recentQuotes}
                quotesLoading={quotesLoading}
                quoteStatusLoadingId={quoteStatusLoadingId}
                searchQuery={searchQueries.quotes.trim()}
                activeCategory={tabFilters.quotes}
                sortBy={tabSorts.quotes}
                currentPage={quotePage}
                onPageChange={setQuotePage}
                onStatusChange={handleStatusChange}
                onOpenCreateQuote={openCreateQuoteModal}
                onOpenEditQuote={openEditQuoteModal}
                onRefreshQuotes={refreshQuoteDashboard}
              />
            )}
          </div>
        </div>
      </div>
      <QuoteEditorModal
        isOpen={isQuoteModalOpen}
        isSaving={isSavingQuote}
        formState={quoteForm}
        packages={packages}
        addOnProducts={addOnProducts}
        onClose={closeQuoteModal}
        onChange={handleQuoteFieldChange}
        onSelectPackage={handleQuotePackageChange}
        onChangeHeadsetCount={(value) =>
          setQuoteForm((prev) => ({
            ...prev,
            customHeadsetCount: Math.max(10, Number(value) || 10),
          }))
        }
        onAddAddOn={handleAddQuoteAddOn}
        onUpdateAddOnQuantity={handleUpdateQuoteAddOnQuantity}
        onRemoveAddOn={handleRemoveQuoteAddOn}
        onSave={handleSaveQuote}
        isEditing={Boolean(editingQuoteId)}
      />
    </div>
  );
};

const AdminQuotationManager = () => {
  return <AdminQuotationContent />;
};

export default AdminQuotationManager;
