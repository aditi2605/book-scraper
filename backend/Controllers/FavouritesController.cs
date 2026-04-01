using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using BookScraper.Data;
using BookScraper.Models;

namespace BookScraper.Controllers;


[ApiController]
[Route("api/[controller]")]
public class FavouritesController : ControllerBase
{
    private readonly AppDbContext _db;

    public FavouritesController(AppDbContext db)
    {
        _db = db;
    }

    // GET /api/favourites: List all favourites with book details
    [HttpGet]
    public async Task<ActionResult<List<Favourite>>> GetFavourites()
    {
        var favourites = await _db.Favourites
            .Include(f => f.Book)
            .OrderByDescending(f => f.AddedAt)
            .ToListAsync();

        return Ok(favourites);
    }

    // POST /api/favourites/{bookId}: Add a book to favourites
    [HttpPost("{bookId:int}")]
    public async Task<ActionResult<Favourite>> AddFavourite(
        int bookId,
        [FromBody] AddFavouriteRequest? request = null)
    {
        var book = await _db.Books.FindAsync(bookId);
        if (book == null)
            return NotFound(new { message = "Book not found" });

        var existing = await _db.Favourites
            .FirstOrDefaultAsync(f => f.BookId == bookId);
        if (existing != null)
            return Conflict(new { message = "Already in favourites" });

        var favourite = new Favourite
        {
            BookId = bookId,
            Notes = request?.Notes,
            AddedAt = DateTime.UtcNow
        };

        _db.Favourites.Add(favourite);
        await _db.SaveChangesAsync();

        await _db.Entry(favourite).Reference(f => f.Book).LoadAsync();

        return CreatedAtAction(nameof(GetFavourites), favourite);
    }

    // DELETE /api/favourites/{bookId}: Remove from favourites
    [HttpDelete("{bookId:int}")]
    public async Task<ActionResult> RemoveFavourite(int bookId)
    {
        var favourite = await _db.Favourites
            .FirstOrDefaultAsync(f => f.BookId == bookId);

        if (favourite == null)
            return NotFound(new { message = "Favourite not found" });

        _db.Favourites.Remove(favourite);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    // GET /api/favourites/check/{bookId}: Is this book favourited?
    [HttpGet("check/{bookId:int}")]
    public async Task<ActionResult> CheckFavourite(int bookId)
    {
        var exists = await _db.Favourites.AnyAsync(f => f.BookId == bookId);
        return Ok(new { isFavourite = exists });
    }
}

public class AddFavouriteRequest
{
    public string? Notes { get; set; }
}