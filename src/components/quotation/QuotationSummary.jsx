// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { AiOutlineCheck, AiOutlineDownload } from 'react-icons/ai';
import { FiMail } from 'react-icons/fi';
import { useQuotation } from '../../context/QuotationContext';

const QuotationSummary = ({ onDownload, onSend, sendDisabled = false }) => {
  const {
    selectedPackage,
    customHeadsetCount,
    selectedAddOns,
    customerDetails,
    subtotalExVAT,
    vat,
    totalInclVAT,
    packages,
    addOnProducts,
  } = useQuotation();

  const selectedPkg = packages.find((item) => item.id === selectedPackage);

  const totalHeadsets = selectedPkg?.isCustom
    ? Math.max(10, Number(customHeadsetCount) || 10)
    : Number(selectedPkg?.headsetCount || 0);

  const selectedPackagePrice = selectedPkg
    ? selectedPkg.isCustom
      ? Number(selectedPkg.basePrice || 0) + Math.max(0, totalHeadsets - 10) * 12999
      : Number(selectedPkg.basePrice || 0)
    : 0;

  return (
    <div className="space-y-6">
      {selectedPkg && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5"
        >
          <h3 className="mb-4 flex items-center text-lg font-bold text-white">
            <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 text-sm text-emerald-400">
              <AiOutlineCheck />
            </span>
            Selected Package
          </h3>

          <div className="mb-4 flex items-start justify-between">
            <div>
              <h4 className="mb-1 font-medium text-white">{selectedPkg.name}</h4>
              <p className="text-sm text-slate-400">
                {totalHeadsets} headset{totalHeadsets !== 1 ? 's' : ''}
              </p>
            </div>
            <span className="text-lg font-bold text-white">R {selectedPackagePrice.toLocaleString()}</span>
          </div>

          <div className="space-y-2">
            {(selectedPkg.features || []).map((feature) => (
              <div key={`${selectedPkg.id}-${feature}`} className="flex items-start text-sm">
                <AiOutlineCheck className="mr-2 mt-0.5 flex-shrink-0 text-emerald-400" />
                <span className="text-slate-300">{feature}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {selectedAddOns.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5"
        >
          <h3 className="mb-4 text-lg font-bold text-white">Selected Add-ons</h3>

          <div className="space-y-3">
            {selectedAddOns.map((item) => {
              const product = addOnProducts.find((entry) => entry.id === item.id);
              return (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b border-slate-700/50 py-2 last:border-0"
                >
                  <div>
                    <h4 className="text-sm font-medium text-white">{product?.name}</h4>
                    <p className="text-xs text-slate-400">
                      {product?.category} x {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium text-white">
                    R {(Number(product?.price || 0) * item.quantity).toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 p-5"
      >
        <h3 className="mb-4 text-lg font-bold text-white">Price Breakdown</h3>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Subtotal (excl. VAT)</span>
            <span className="font-medium text-white">R {subtotalExVAT.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">VAT (15%)</span>
            <span className="font-medium text-white">R {vat.toLocaleString()}</span>
          </div>
          <div className="flex justify-between border-t border-slate-700/50 pt-3 text-lg font-bold">
            <span className="text-white">Total (incl. VAT)</span>
            <span className="text-emerald-400">R {totalInclVAT.toLocaleString()}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-slate-700/50 bg-slate-800/30 p-5"
      >
        <h3 className="mb-4 text-lg font-bold text-white">Customer Details</h3>

        <div className="space-y-2">
          <p className="text-sm">
            <span className="text-slate-400">Name:</span>{' '}
            <span className="text-white">
              {customerDetails.firstName} {customerDetails.lastName}
            </span>
          </p>
          <p className="text-sm">
            <span className="text-slate-400">Email:</span>{' '}
            <span className="text-white">{customerDetails.email}</span>
          </p>
          <p className="text-sm">
            <span className="text-slate-400">School/Company:</span>{' '}
            <span className="text-white">{customerDetails.company}</span>
          </p>
          {customerDetails.phone && (
            <p className="text-sm">
              <span className="text-slate-400">Phone:</span>{' '}
              <span className="text-white">{customerDetails.phone}</span>
            </p>
          )}
        </div>
      </motion.div>

      {(onDownload || onSend) && (
        <div className="flex gap-3">
          {onDownload && (
            <button
              type="button"
              onClick={onDownload}
              className="flex-1 rounded-xl bg-slate-700/50 px-4 py-3 font-medium text-white transition-colors hover:bg-slate-700/70"
            >
              <span className="flex items-center justify-center">
                <AiOutlineDownload className="mr-2" />
                Download Quote
              </span>
            </button>
          )}
          {onSend && (
            <button
              type="button"
              onClick={onSend}
              disabled={sendDisabled}
              className="flex-1 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-4 py-3 font-medium text-white transition-all hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="flex items-center justify-center">
                <FiMail className="mr-2" />
                Send Quote
              </span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default QuotationSummary;
