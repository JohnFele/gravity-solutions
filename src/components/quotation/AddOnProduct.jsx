import { useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { AiOutlinePlus, AiOutlineMinus } from 'react-icons/ai';

const AddOnProduct = ({
  product,
  quantity,
  onAdd,
  onRemove,
  onUpdateQuantity,
  disabled = false,
  disabledReason = '',
}) => {
  const [showDescription, setShowDescription] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border p-4 transition-all ${
        disabled
          ? 'border-emerald-500/20 bg-emerald-500/5'
          : 'border-slate-700/50 bg-slate-800/30 hover:border-slate-600'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-1">
            <span className="text-xs font-medium px-2 py-1 rounded-full bg-slate-700 text-slate-300 mr-2">
              {product.category}
            </span>
            {product.popular && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                Popular
              </span>
            )}
            {disabled && (
              <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                Included
              </span>
            )}
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{product.name}</h3>

          <button
            type="button"
            onClick={() => setShowDescription((prev) => !prev)}
            className="text-xs text-emerald-400 hover:text-emerald-300 mb-2"
          >
            {showDescription ? 'Hide details' : 'Show details'}
          </button>

          {showDescription && <p className="text-sm text-slate-400 mb-3">{product.description}</p>}

          <div className="flex items-center text-sm">
            <span className="text-white font-medium">R {product.price.toLocaleString()}</span>
            <span className="text-slate-400 ml-1">/{product.unit}</span>
          </div>
          {disabled && disabledReason && (
            <p className="mt-2 text-xs text-emerald-300">{disabledReason}</p>
          )}
        </div>

        <div className="ml-4">
          {disabled ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-medium text-emerald-300">
              Included in package
            </div>
          ) : quantity > 0 ? (
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => {
                  if (quantity === 1) {
                    onRemove();
                  } else {
                    onUpdateQuantity(quantity - 1);
                  }
                }}
                className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400 flex items-center justify-center transition-colors"
              >
                <AiOutlineMinus className="w-4 h-4" />
              </button>
              <span className="text-white font-medium w-8 text-center">{quantity}</span>
              <button
                type="button"
                onClick={() => onUpdateQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-emerald-500/20 text-slate-300 hover:text-emerald-400 flex items-center justify-center transition-colors"
              >
                <AiOutlinePlus className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onAdd(1)}
              className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-medium hover:from-emerald-600 hover:to-teal-700 transition-all flex items-center"
            >
              <AiOutlinePlus className="mr-1" />
              Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AddOnProduct;

