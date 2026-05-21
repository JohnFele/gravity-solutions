// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { AiOutlineCheck, AiOutlineTrophy } from 'react-icons/ai';

const PackageCard = ({ pkg, isSelected, onSelect, customHeadsetCount, onCustomCountChange, isAdmin = false }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onSelect}
      className={`relative bg-slate-800/50 backdrop-blur-xl rounded-2xl border p-5 cursor-pointer transition-all flex flex-col h-full ${
        isSelected
          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
          : 'border-slate-700/50 hover:border-slate-600'
      }`}
    >
      {/* Popular Badge */}
      {pkg.popular && (
        <div className="absolute -top-3 right-4 bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center z-10">
          <AiOutlineTrophy className="mr-1" />
          Most Popular
        </div>
      )}

      {/* Admin Badge */}
      {isAdmin && !pkg.isPublished && (
        <div className="absolute -top-3 left-4 bg-slate-600 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center z-10">
          Unpublished
        </div>
      )}

      {/* Content Container - flex flex-col to push button to bottom */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-bold text-white mb-1 pr-16">{pkg.name}</h3>
          <p className="text-sm text-slate-400 line-clamp-2">{pkg.description}</p>
        </div>

        {/* Price Section */}
        {pkg.isCustom ? (
          <div className="mb-4">
            <label className="text-sm text-slate-400 block mb-2">Number of Headsets (min. 10)</label>
            <input
              type="number"
              min="10"
              value={customHeadsetCount}
              onChange={(e) => onCustomCountChange(parseInt(e.target.value) || 10)}
              onClick={(e) => e.stopPropagation()}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="text-xs text-slate-400 mt-2">
              Base price: R {pkg.basePrice.toLocaleString()} (10 headsets)
            </p>
            <p className="text-xs text-emerald-400">
              Additional headsets: R 12,999 each
            </p>
          </div>
        ) : (
          <div className="mb-4">
            <span className="text-2xl font-bold text-white">
              R {pkg.basePrice.toLocaleString()}
            </span>
            <span className="text-sm text-slate-400 ml-2">excl. VAT</span>
            {pkg.headsetCount && (
              <p className="text-xs text-slate-400 mt-1">
                {pkg.headsetCount} headset{pkg.headsetCount !== 1 ? 's' : ''}
              </p>
            )}
          </div>
        )}

        {/* Features List - flex-1 to push button down */}
        <div className="flex-1">
          <ul className="space-y-2 mb-4">
            {pkg.features.map((feature, index) => (
              <li key={index} className="flex items-start text-sm">
                <AiOutlineCheck className="text-emerald-400 mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-slate-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Button - Always at bottom */}
        <div
          className={`mt-auto text-center py-2.5 rounded-lg font-medium transition-colors ${
            isSelected
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70 border border-slate-600/50'
          }`}
        >
          {isSelected ? 'Selected' : 'Select Package'}
        </div>

        {/* Admin Price Info */}
        {isAdmin && !pkg.isCustom && (
          <p className="text-xs text-center text-slate-500 mt-2">
            Base price: R {pkg.basePrice.toLocaleString()}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default PackageCard;