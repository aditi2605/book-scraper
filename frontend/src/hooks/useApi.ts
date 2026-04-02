import { useState, useCallback } from 'react';
import type { Book, BookAnalytics, BookDeal, Favourite } from '../types';

// Custom hook for all book-related API calls.
// Components just call useBooks() and get back functions + state.
export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);
  const [analytics, setAnalytics] = useState<BookAnalytics | null>(null);
  const [deals, setDeals] = useState<BookDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/books');
      if (!res.ok) throw new Error('Failed to fetch books');
      setBooks(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchBooks = useCallback(async (params: {
    q?: string; minPrice?: number; maxPrice?: number;
    minRating?: number; inStock?: boolean;
    sortBy?: string; sortDesc?: boolean;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams();
      if (params.q) sp.set('q', params.q);
      if (params.minPrice !== undefined) sp.set('minPrice', String(params.minPrice));
      if (params.maxPrice !== undefined) sp.set('maxPrice', String(params.maxPrice));
      if (params.minRating !== undefined) sp.set('minRating', String(params.minRating));
      if (params.inStock !== undefined) sp.set('inStock', String(params.inStock));
      if (params.sortBy) sp.set('sortBy', params.sortBy);
      if (params.sortDesc) sp.set('sortDesc', 'true');
      const res = await fetch(`/api/books/search?${sp}`);
      if (!res.ok) throw new Error('Search failed');
      setBooks(await res.json());
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const startScraping = useCallback(async (engine: 'hap' | 'playwright', maxPages?: number) => {
    setLoading(true);
    setError(null);
    try {
      const sp = new URLSearchParams({ engine });
      if (maxPages) sp.set('maxPages', String(maxPages));
      const res = await fetch(`/api/books/scrape?${sp}`, { method: 'POST' });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Scraping failed');
      }
      await fetchBooks();
      return await res.json().catch(() => null);
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchBooks]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/books/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics');
      setAnalytics(await res.json());
    } catch (err: any) { setError(err.message); }
  }, []);

  const fetchDeals = useCallback(async () => {
    try {
      const res = await fetch('/api/books/deals');
      if (!res.ok) throw new Error('Failed to fetch deals');
      setDeals(await res.json());
    } catch (err: any) { setError(err.message); }
  }, []);

  return {
    books, analytics, deals, loading, error,
    fetchBooks, searchBooks, startScraping, fetchAnalytics, fetchDeals
  };
}

// Custom hook for favourites
export function useFavourites() {
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [favouriteIds, setFavouriteIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchFavourites = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/favourites');
      if (!res.ok) throw new Error('Failed to fetch favourites');
      const data = await res.json();
      setFavourites(data);
      setFavouriteIds(new Set(data.map((f: Favourite) => f.bookId)));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }, []);

  const toggleFavourite = useCallback(async (bookId: number) => {
    const isFav = favouriteIds.has(bookId);
    try {
      if (isFav) {
        await fetch(`/api/favourites/${bookId}`, { method: 'DELETE' });
        setFavouriteIds(prev => { const next = new Set(prev); next.delete(bookId); return next; });
        setFavourites(prev => prev.filter(f => f.bookId !== bookId));
      } else {
        const res = await fetch(`/api/favourites/${bookId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({})
        });
        if (!res.ok) throw new Error('Failed to add favourite');
        const newFav = await res.json();
        setFavouriteIds(prev => new Set([...prev, bookId]));
        setFavourites(prev => [newFav, ...prev]);
      }
    } catch (err) { console.error(err); }
  }, [favouriteIds]);

  const isFavourite = useCallback((bookId: number) => {
    return favouriteIds.has(bookId);
  }, [favouriteIds]);

  return { favourites, loading, fetchFavourites, toggleFavourite, isFavourite };
}