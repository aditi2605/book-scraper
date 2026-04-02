import { Heart, ExternalLink, Star } from 'lucide-react';
import type { Book } from '../types';

interface BookCardProps {
  book: Book;
  isFavourite: boolean;
  onToggleFavourite: (bookId: number) => void;
}

export function BookCard({ book, isFavourite, onToggleFavourite }: BookCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Book Image */}
      {book.imageUrl && (
        <div className="h-48 bg-gray-50 flex items-center justify-center overflow-hidden">
          <img
            src={book.imageUrl}
            alt={book.title}
            className="h-full object-contain"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      <div className="p-4">
        {/* Title */}
        <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2 min-h-[2.5rem]">
          {book.title}
        </h3>

        {/* Rating Stars */}
        <div className="flex items-center gap-0.5 mt-2">
          {[1, 2, 3, 4, 5].map(star => (
            <Star
              key={star}
              size={14}
              className={star <= book.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}
            />
          ))}
          <span className="text-xs text-gray-500 ml-1">({book.rating}/5)</span>
        </div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mt-3">
          <span className="text-xl font-bold text-gray-900">{book.priceDisplay}</span>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            book.inStock ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {book.inStock ? 'In Stock' : 'Out of Stock'}
          </span>
        </div>

        {/* Scraped by badge */}
        <div className="mt-2">
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-mono">
            via {book.scrapedBy}
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
          <button
            onClick={() => onToggleFavourite(book.id)}
            className={`p-2 rounded-lg transition-colors ${
              isFavourite
                ? 'bg-red-50 text-red-500 hover:bg-red-100'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-red-400'
            }`}
          >
            <Heart size={16} fill={isFavourite ? 'currentColor' : 'none'} />
          </button>

          
          <a href={book.url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <ExternalLink size={16} />
          </a>
        </div>
      </div>
    </div>
  );
}