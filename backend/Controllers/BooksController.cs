using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using BookScraper.Data;
using BookScraper.Models;
using BookScraper.Hubs;
using BookScraper.Services;
using CsvHelper;
using System.Globalization;

namespace BookScraper.Controllers;


[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IHubContext<ScrapingHub> _hubContext;
    private readonly HapScraperService _hapScraper;
    private readonly PlaywrightScraperService _playwrightScraper;
    private readonly ILogger<BooksController> _logger;

    public BooksController(
        AppDbContext db,
        IHubContext<ScrapingHub> hubContext,
        HapScraperService hapScraper,
        PlaywrightScraperService playwrightScraper,
        ILogger<BooksController> logger)
    {
        _db = db;
        _hubContext = hubContext;
        _hapScraper = hapScraper;
        _playwrightScraper = playwrightScraper;
        _logger = logger;
    }

    
    [HttpPost("scrape")]
    public async Task<ActionResult> StartScraping(
        [FromQuery] string engine = "hap",
        [FromQuery] int? maxPages = null)
    {

        IScraperService scraper = engine.ToLower() switch
        {
            "playwright" => _playwrightScraper,
            _ => _hapScraper
        };

        _logger.LogInformation("Starting scrape with {Engine}", scraper.EngineName);

        // This callback sends progress to frontend via SignalR
        async Task OnProgress(ScrapeProgress progress)
        {
            await _hubContext.Clients.All.SendAsync("ScrapeProgress", progress);
        }

        // Run the scraper
        var books = await scraper.ScrapeAllBooksAsync(maxPages, OnProgress);

        if (books.Count == 0)
            return BadRequest(new { message = "No books were scraped." });

        // Clear old data and save new
        _db.Books.RemoveRange(_db.Books);
        await _db.SaveChangesAsync();

        _db.Books.AddRange(books);
        await _db.SaveChangesAsync();

        return Ok(new
        {
            message = $"Scraped {books.Count} books using {scraper.EngineName}",
            count = books.Count,
            engine = scraper.EngineName
        });
    }

    
    // Returns all scraped books
    [HttpGet]
    public async Task<ActionResult<List<Book>>> GetAllBooks()
    {
        var books = await _db.Books
            .OrderBy(b => b.Title)
            .ToListAsync();

        return Ok(books);
    }

    // Search and filter books
   
    [HttpGet("search")]
    public async Task<ActionResult<List<Book>>> SearchBooks(
        [FromQuery] string? q,
        [FromQuery] decimal? minPrice,
        [FromQuery] decimal? maxPrice,
        [FromQuery] int? minRating,
        [FromQuery] bool? inStock,
        [FromQuery] string? sortBy,
        [FromQuery] bool sortDesc = false)
    {
        // Start with all books, then narrow down with each filter
        var query = _db.Books.AsQueryable();

        if (!string.IsNullOrEmpty(q))
            query = query.Where(b => b.Title.ToLower().Contains(q.ToLower()));

        if (minPrice.HasValue)
            query = query.Where(b => b.Price >= minPrice.Value);

        if (maxPrice.HasValue)
            query = query.Where(b => b.Price <= maxPrice.Value);

        if (minRating.HasValue)
            query = query.Where(b => b.Rating >= minRating.Value);

        if (inStock.HasValue)
            query = query.Where(b => b.InStock == inStock.Value);

        // Apply sorting
        query = sortBy?.ToLower() switch
        {
            "price" => sortDesc ? query.OrderByDescending(b => b.Price) : query.OrderBy(b => b.Price),
            "rating" => sortDesc ? query.OrderByDescending(b => b.Rating) : query.OrderBy(b => b.Rating),
            "title" => sortDesc ? query.OrderByDescending(b => b.Title) : query.OrderBy(b => b.Title),
            _ => query.OrderBy(b => b.Title)
        };

        return Ok(await query.ToListAsync());
    }


    // GET /api/books/analytics
    // Stats and chart data for the dashboard
  
    [HttpGet("analytics")]
    public async Task<ActionResult<BookAnalytics>> GetAnalytics()
    {
        var books = await _db.Books.ToListAsync();

        if (!books.Any())
            return Ok(new BookAnalytics());

        var ratingDist = books
            .GroupBy(b => b.Rating)
            .Select(g => new RatingGroup
            {
                Rating = g.Key,
                Count = g.Count(),
                AveragePrice = Math.Round(g.Average(b => b.Price), 2)
            })
            .OrderBy(r => r.Rating)
            .ToList();

        var priceDist = new List<PriceRange>
        {
            new() { Range = "£0-£15", Count = books.Count(b => b.Price < 15) },
            new() { Range = "£15-£25", Count = books.Count(b => b.Price >= 15 && b.Price < 25) },
            new() { Range = "£25-£35", Count = books.Count(b => b.Price >= 25 && b.Price < 35) },
            new() { Range = "£35-£45", Count = books.Count(b => b.Price >= 35 && b.Price < 45) },
            new() { Range = "£45-£60", Count = books.Count(b => b.Price >= 45) }
        };

        return Ok(new BookAnalytics
        {
            TotalBooks = books.Count,
            AveragePrice = Math.Round(books.Average(b => b.Price), 2),
            MinPrice = books.Min(b => b.Price),
            MaxPrice = books.Max(b => b.Price),
            AverageRating = Math.Round(books.Average(b => b.Rating), 1),
            InStockCount = books.Count(b => b.InStock),
            OutOfStockCount = books.Count(b => !b.InStock),
            RatingDistribution = ratingDist,
            PriceDistribution = priceDist
        });
    }


    // GET /api/books/deals
    // Best value books (cheap + highly rated)

    [HttpGet("deals")]
    public async Task<ActionResult<List<BookDeal>>> GetDeals()
    {
        var books = await _db.Books.ToListAsync();

        if (!books.Any())
            return Ok(new List<BookDeal>());

        var maxPrice = books.Max(b => b.Price);

        var deals = books
            .Where(b => b.Rating >= 4 && b.InStock)
            .Select(b => new BookDeal
            {
                Book = b,
                ValueScore = Math.Round(
                    (decimal)b.Rating * (1 - (b.Price / maxPrice)) * 100, 1
                ),
                DealReason = b.Rating == 5
                    ? $"5-star book for only {b.PriceDisplay}!"
                    : $"Highly rated ({b.Rating}/5) at just {b.PriceDisplay}"
            })
            .OrderByDescending(d => d.ValueScore)
            .Take(20)
            .ToList();

        return Ok(deals);
    }

    // GET /api/books/export/csv
    // Download all books as a CSV file
   
    [HttpGet("export/csv")]
    public async Task<IActionResult> ExportCsv()
    {
        var books = await _db.Books.OrderBy(b => b.Title).ToListAsync();

        using var memoryStream = new MemoryStream();
        using var writer = new StreamWriter(memoryStream);
        using var csv = new CsvWriter(writer, CultureInfo.InvariantCulture);

        csv.WriteRecords(books);
        await writer.FlushAsync();

        return File(
            memoryStream.ToArray(),
            "text/csv",
            $"books-export-{DateTime.Now:yyyy-MM-dd}.csv"
        );
    }
}
