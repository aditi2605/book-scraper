import { useState, useEffect, useCallback } from 'react';
import { BookOpen, BarChart3, Sparkles, Heart, Download } from 'lucide-react';
import { useBooks, useFavourites } from './hooks/useApi';
import { useScrapingProgress } from './hooks/useSignalR';
import { ScrapeControls } from './components/ScrapeControls';
import { SearchFilters } from './components/SearchFilters';
import { BookCard } from './components/BookCard';
import { AnalyticsDashboard } from './components/AnalyticsDashboard';
import { DealsSection } from './components/DealsSection';

type Tab = 'books' | 'analytics' | 'deals' | 'favourites';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>('books');

  const {
    books, analytics, deals, loading, error,
    fetchBooks, searchBooks, startScraping, fetchAnalytics, fetchDeals
  } = useBooks();

  const { favourites, fetchFavourites, toggleFavourite, isFavourite } = useFavourites();
  const { progress } = useScrapingProgress();

  useEffect(() => { fetchBooks(); fetchFavourites(); }, [fetchBooks, fetchFavourites]);

  useEffect(() => {
    if (activeTab === 'analytics') fetchAnalytics();
    if (activeTab === 'deals') fetchDeals();
    if (activeTab === 'favourites') fetchFavourites();
  }, [activeTab, fetchAnalytics, fetchDeals, fetchFavourites]);

  const handleScrape = useCallback(async (engine: 'hap' | 'playwright', maxPages?: number) => {
    await startScraping(engine, maxPages);
    fetchAnalytics();
    fetchDeals();
  }, [startScraping, fetchAnalytics, fetchDeals]);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'books', label: 'Books', icon: <BookOpen size={16} /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 size={16} /> },
    { id: 'deals', label: 'Deals', icon: <Sparkles size={16} /> },
    { id: 'favourites', label: 'Favourites', icon: <Heart size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">BookScraper</h1>
                <p className="text-xs text-gray-400">Web scraping dashboard</p>
              </div>
            </div>
            {books.length > 0 && (
              <a href="/api/books/export/csv"
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gray-100 text-gray-600 text-xs font-medium hover:bg-gray-200">
                <Download size={14} /> Export CSV
              </a>
            )}
          </div>

          {/* Tabs */}
          <nav className="flex gap-1 mt-4 -mb-[1px]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-green-600 border-green-600 bg-gray-50'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.id === 'favourites' && favourites.length > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-red-100 text-red-600 rounded-full">
                    {favourites.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 space-y-6">
        <ScrapeControls onStartScrape={handleScrape} progress={progress} isLoading={loading} />

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">{error}</div>
        )}

        {activeTab === 'books' && (
          <>
            <SearchFilters onSearch={searchBooks} totalResults={books.length} />
            {books.length === 0 && !loading ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <BookOpen className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 text-lg font-medium">No books yet</p>
                <p className="text-gray-400 text-sm mt-1">Click "Start Scraping" above to begin</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {books.map(book => (
                  <BookCard
                    key={book.id}
                    book={book}
                    isFavourite={isFavourite(book.id)}
                    onToggleFavourite={toggleFavourite}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'analytics' && <AnalyticsDashboard analytics={analytics} />}
        {activeTab === 'deals' && <DealsSection deals={deals} />}

        {activeTab === 'favourites' && (
          favourites.length === 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
              <Heart className="mx-auto text-gray-300 mb-3" size={48} />
              <p className="text-gray-500 text-lg font-medium">No favourites yet</p>
              <p className="text-gray-400 text-sm mt-1">Click the heart icon on any book</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {favourites.map(fav => (
                <BookCard key={fav.id} book={fav.book} isFavourite={true} onToggleFavourite={toggleFavourite} />
              ))}
            </div>
          )
        )}
      </main>
    </div>
  );
}