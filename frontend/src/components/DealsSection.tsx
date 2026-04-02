import { Sparkles, Star } from 'lucide-react';
import type { BookDeal } from '../types';

export function DealsSection({ deals }: { deals: BookDeal[] }) {
  if (deals.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <Sparkles className="mx-auto text-gray-300 mb-2" size={32} />
        <p className="text-gray-400">No deals yet. Scrape some books first!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <Sparkles size={20} className="text-amber-500" />
        Best Value Books
      </h2>
      <p className="text-sm text-gray-500">Highly rated books at the lowest prices.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {deals.map((deal, index) => (
          <div key={deal.book.id} className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4 hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-sm font-bold shrink-0 ${
              index === 0 ? 'bg-amber-100 text-amber-700' :
              index === 1 ? 'bg-gray-100 text-gray-600' :
              index === 2 ? 'bg-orange-100 text-orange-700' :
              'bg-gray-50 text-gray-400'
            }`}>
              #{index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{deal.book.title}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-lg font-bold text-gray-900">{deal.book.priceDisplay}</span>
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={12} className={s <= deal.book.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'} />
                  ))}
                </div>
              </div>
              <p className="text-xs text-green-600 font-medium mt-1">{deal.dealReason}</p>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium mt-1 inline-block">
                Value Score: {deal.valueScore}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}