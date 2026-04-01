using Microsoft.EntityFrameworkCore;
using BookScraper.Models;

namespace BookScraper.Data;
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // Each DbSet<T> becomes a table in the database
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Favourite> Favourites => Set<Favourite>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Book>(entity =>
        {
            // Create indexes for faster searching and filtering
            entity.HasIndex(b => b.Title);
            entity.HasIndex(b => b.Price);
        });

        modelBuilder.Entity<Favourite>(entity =>
        {
            // Each favourite links to one book
            entity.HasOne(f => f.Book)
                  .WithMany(b => b.Favourites)
                  .HasForeignKey(f => f.BookId)
                  .OnDelete(DeleteBehavior.Cascade);

            // Prevent duplicate favourites for the same book
            entity.HasIndex(f => f.BookId).IsUnique();
        });
    }
}