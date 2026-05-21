const PageFilterBar = ({
  categories = [],
  activeCategory = 'all',
  onCategoryChange,
  sortOptions = [],
  activeSort = '',
  onSortChange,
  className = '',
}) => {
  const hasSort = sortOptions.length > 0 && typeof onSortChange === 'function';

  return (
    <div
      className={`mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between ${className}`.trim()}
    >
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => onCategoryChange?.(category.id)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${
              activeCategory === category.id
                ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white'
                : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700/70'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      {hasSort ? (
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-slate-400">Sort by</span>
          <select
            value={activeSort}
            onChange={(event) => onSortChange(event.target.value)}
            className="rounded-xl border border-slate-600 bg-slate-900/80 px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.name}
              </option>
            ))}
          </select>
        </div>
      ) : null}
    </div>
  );
};

export default PageFilterBar;
