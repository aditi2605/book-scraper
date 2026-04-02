import { useState } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';

interface SearchFiltersProps {
  onSearch: (params: {
    q?: string; minPrice?: number; maxPrice?: number;
    minRating?: number; inStock?: boolean;
    sortBy?: string; sortDesc?: boolean;
  }) => void;
  totalResults: number;
}

export function SearchFilters({ onSearch, totalResults }: SearchFiltersProps) {
  const [query, setQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [minRating, setMinRating] = useState('');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('title');
  const [showFilters, setShowFilters] = useState(false);

  const handleSearch = () => {
    onSearch({
      q: query || undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
      minRating: minRating ? Number(minRating) : undefined,
      inStock: inStockOnly || undefined,
      sortBy,
    });
  };

  const handleClear = () => {
    setQuery(''); setMinPrice(''); setMaxPrice('');
    setMinRating(''); setInStockOnly(false); setSortBy('title');
    onSearch({});
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search by book title..."
            className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400"
          />
        </div>
        <div className="flex gap-2">
          <button onClick={handleSearch} className="flex-1 sm:flex-none px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">
            Search
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-3 py-2.5 rounded-lg border text-sm ${showFilters ? 'bg-gray-900 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
          >
            <SlidersHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* Expandable Filters */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Min Price (£)</label>
              <input type="number" value={minPrice} onChange={e => setMinPrice(e.target.value)} placeholder="0"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Max Price (£)</label>
              <input type="number" value={maxPrice} onChange={e => setMaxPrice(e.target.value)} placeholder="60"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400" />
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Min Rating</label>
              <select value={minRating} onChange={e => setMinRating(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400">
                <option value="">Any</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-gray-500 font-medium block mb-1">Sort By</label>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400">
                <option value="title">Title</option>
                <option value="price">Price</option>
                <option value="rating">Rating</option>
              </select>
            </div>
            <div className="flex flex-col justify-end gap-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="rounded" />
                <span className="text-sm text-gray-600">In stock only</span>
              </label>
            </div>
          </div>

          {/* Apply Filters Button */}
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleSearch}
              className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Apply Filters
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-200 flex items-center gap-1"
            >
              <X size={14} /> Clear All
            </button>
          </div>
        </div>
      )}

      {/* Results count */}
      <div className="mt-3">
        <span className="text-xs text-gray-500">{totalResults} books found</span>
      </div>
    </div>
  );
}