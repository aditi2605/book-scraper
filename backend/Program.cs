using Microsoft.EntityFrameworkCore;
using BookScraper.Data;
using BookScraper.Hubs;
using BookScraper.Services;

var builder = WebApplication.CreateBuilder(args);

// Register controllers
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy =
            System.Text.Json.JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

// Register SQLite database
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(
        builder.Configuration.GetConnectionString("DefaultConnection")
    )
);

// Register scraper services
builder.Services.AddHttpClient<HapScraperService>();
builder.Services.AddScoped<PlaywrightScraperService>();

// Register SignalR
builder.Services.AddSignalR();

// CORS — allows React frontend to call this API
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:5173",
                "http://localhost:3000"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

app.UseCors("AllowFrontend");
app.MapControllers();
app.MapHub<ScrapingHub>("/hubs/scraping");

// Auto-create database on startup
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    db.Database.EnsureCreated();
}

Console.WriteLine("\n📚 BookScraper API is running!");
Console.WriteLine("   API: http://localhost:5000");
Console.WriteLine("   Try: http://localhost:5000/api/books\n");

app.Run();