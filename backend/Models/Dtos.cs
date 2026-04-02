namespace BookScraper.Models;

public class BookAnalytics
{
    public int TotalBooks { get; set; }
    public double AveragePrice { get; set; }
    public double MinPrice { get; set; }
    public double MaxPrice { get; set; }
    public double AverageRating { get; set; }
    public int InStockCount { get; set; }
    public int OutOfStockCount { get; set; }
    public List<RatingGroup> RatingDistribution { get; set; } = new();
    public List<PriceRange> PriceDistribution { get; set; } = new();
}

public class RatingGroup
{
    public int Rating { get; set; }
    public int Count { get; set; }
    public double AveragePrice { get; set; }
}

public class PriceRange
{
    public string Range { get; set; } = string.Empty;
    public int Count { get; set; }
}

public class BookDeal
{
    public Book Book { get; set; } = null!;
    public double ValueScore { get; set; }
    public string DealReason { get; set; } = string.Empty;
}

public class ScrapeProgress
{
    public int CurrentPage { get; set; }
    public int TotalPages { get; set; }
    public int BooksFound { get; set; }
    public string Status { get; set; } = string.Empty;
    public string Engine { get; set; } = string.Empty;
}