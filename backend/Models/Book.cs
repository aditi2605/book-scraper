namespace BookScraper.Models;

public class Book
{
    public int Id { get; set; }                                 // Primary key (auto-generated)
    public string Title { get; set; } = string.Empty;           // Book title
    public decimal Price { get; set; }                          // Price as a number (e.g. 51.77)
    public string PriceDisplay { get; set; } = string.Empty;    // Price as text (e.g. "£51.77")
    public int Rating { get; set; }                             // 1-5 stars
    public bool InStock { get; set; }                           // Is it available?
    public string Url { get; set; } = string.Empty;             // Link to the book page
    public string? ImageUrl { get; set; }                       // Book cover image (nullable)
    public string? Description { get; set; }                    // Book description (nullable)
    public string ScrapedBy { get; set; } = string.Empty;       // "HAP" or "Playwright"
    public DateTime ScrapedAt { get; set; } = DateTime.UtcNow;  // When we scraped it

    // Navigation property: a book can be in many user's favourites
    public List<Favourite> Favourites { get; set; } = new();
}