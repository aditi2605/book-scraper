using BookScraper.Models;

namespace BookScraper.Services;

public interface IScraperService
{
    string EngineName { get; }

    Task<List<Book>> ScrapeAllBooksAsync(
        int? maxPages = null,
        Func<ScrapeProgress, Task>? onProgress = null
    );
}