import { useState } from 'react';
import { Loader2, Zap, Globe, Play } from 'lucide-react';
import type { ScrapeProgress } from '../types';

interface ScrapeControlsProps {
  onStartScrape: (engine: 'hap' | 'playwright', maxPages?: number) => Promise<void>;
  progress: ScrapeProgress | null;
  isLoading: boolean;
}

export function ScrapeControls({ onStartScrape, progress, isLoading }: ScrapeControlsProps) {
  const [engine, setEngine] = useState<'hap' | 'playwright'>('hap');
  const [maxPages, setMaxPages] = useState<string>('3');

  const handleScrape = async () => {
    const pages = maxPages ? Number(maxPages) : undefined;
    await onStartScrape(engine, pages);
  };

  const progressPercent = progress
    ? Math.round((progress.currentPage / progress.totalPages) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Scrape Books</h2>

      <div className="flex flex-col gap-4">
        {/* Top row: Engine + Pages */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">Scraping Engine</label>
            <div className="flex gap-2">
              <button
                onClick={() => setEngine('hap')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  engine === 'hap' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Zap size={16} /> HAP
              </button>
              <button
                onClick={() => setEngine('playwright')}
                className={`flex-1 flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  engine === 'playwright' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <Globe size={16} /> Playwright
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1.5">
              {engine === 'hap' ? 'Fast HTML parsing — best for static sites' : 'Headless browser — handles JavaScript-heavy sites'}
            </p>
          </div>

          <div>
            <label className="text-xs text-gray-500 font-medium block mb-2">Pages to Scrape</label>
            <input
              type="number" value={maxPages} onChange={e => setMaxPages(e.target.value)}
              min="1" max="50"
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-green-400"
            />
            <p className="text-xs text-gray-400 mt-1.5">20 books per page — max 50 pages</p>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleScrape}
          disabled={isLoading}
          className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all ${
            isLoading ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gray-900 text-white hover:bg-gray-800'
          }`}
        >
          {isLoading ? <><Loader2 size={16} className="animate-spin" /> Scraping...</> : <><Play size={16} /> Start Scraping</>}
        </button>
      </div>

      {/* Progress Bar */}
      {progress && progress.status === 'scraping' && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Page {progress.currentPage} of {progress.totalPages}</span>
            <span className="text-gray-500">{progress.booksFound} books found</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${engine === 'hap' ? 'bg-green-500' : 'bg-purple-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      {progress && progress.status === 'complete' && (
        <div className="mt-4 pt-4 border-t border-gray-100 text-green-600 text-sm font-medium">
          Done! {progress.booksFound} books scraped using {progress.engine}
        </div>
      )}
    </div>
  );
}