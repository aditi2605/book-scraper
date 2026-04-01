namespace BookScraper.Models;

public class Favourite
{
    public int Id { get; set; }                                 // Primary key
    public int BookId { get; set; }                             // Which book is favourited
    public DateTime AddedAt { get; set; } = DateTime.UtcNow;    // When it was favourited
    public string? Notes { get; set; }                          // Optional user notes

    // Navigation property: links back to the Book entity
    public Book Book { get; set; } = null!;
}