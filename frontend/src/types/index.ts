export interface Book {
  id: number;
  title: string;
  price: number;
  priceDisplay: string;
  rating: number;
  inStock: boolean;
  url: string;
  imageUrl?: string;
  description?: string;
  scrapedBy: string;
  scrapedAt: string;
}

export interface Favourite {
  id: number;
  bookId: number;
  addedAt: string;
  notes?: string;
  book: Book;
}

export interface BookAnalytics {
  totalBooks: number;
  averagePrice: number;
  minPrice: number;
  maxPrice: number;
  averageRating: number;
  inStockCount: number;
  outOfStockCount: number;
  ratingDistribution: RatingGroup[];
  priceDistribution: PriceRange[];
}

export interface RatingGroup {
  rating: number;
  count: number;
  averagePrice: number;
}

export interface PriceRange {
  range: string;
  count: number;
}

export interface BookDeal {
  book: Book;
  valueScore: number;
  dealReason: string;
}

export interface ScrapeProgress {
  currentPage: number;
  totalPages: number;
  booksFound: number;
  status: 'scraping' | 'complete' | 'error';
  engine: string;
}