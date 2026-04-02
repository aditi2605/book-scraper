using HtmlAgilityPack;
using BookScraper.Models;

namespace BookScraper.Services;


public class HapScraperService : IScraperService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _config;
    private readonly ILogger<HapScraperService> _logger;

    public string EngineName => "HAP";

    public HapScraperService(
        HttpClient httpClient,
        IConfiguration config,
        ILogger<HapScraperService> logger)
    {
        _httpClient = httpClient;
        _config = config;
        _logger = logger;

        var userAgent = _config["ScrapingConfig:UserAgent"] ?? "BookScraperBot/1.0";
        _httpClient.DefaultRequestHeaders.UserAgent.ParseAdd(userAgent);
    }

    public async Task<List<Book>> ScrapeAllBooksAsync(
        int? maxPages = null,
        Func<ScrapeProgress, Task>? onProgress = null)
    {
        var allBooks = new List<Book>();
        var baseUrl = _config["ScrapingConfig:BaseUrl"] ?? "https://books.toscrape.com";
        var delay = int.Parse(_config["ScrapingConfig:DelayBetweenRequestsMs"] ?? "1000");

        int pageNumber = 1;
        string? currentUrl = $"{baseUrl}/catalogue/page-1.html";

        while (currentUrl != null)
        {
            if (maxPages.HasValue && pageNumber > maxPages.Value)
                break;

            _logger.LogInformation("Scraping page {Page} with HAP...", pageNumber);

            try
            {
    
                var html = await _httpClient.GetStringAsync(currentUrl);

                var doc = new HtmlDocument();
                doc.LoadHtml(html);

                
                var bookNodes = doc.DocumentNode.SelectNodes(
                    "//article[@class='product_pod']"
                );

                if (bookNodes == null)
                {
                    _logger.LogWarning("No books found on page {Page}", pageNumber);
                    break;
                }

                foreach (var bookNode in bookNodes)
                {
                    var book = ParseBookNode(bookNode, baseUrl);
                    if (book != null)
                    {
                        book.ScrapedBy = EngineName;
                        allBooks.Add(book);
                    }
                }

                // Send progress update via SignalR
                if (onProgress != null)
                {
                    await onProgress(new ScrapeProgress
                    {
                        CurrentPage = pageNumber,
                        TotalPages = 50,
                        BooksFound = allBooks.Count,
                        Status = "scraping",
                        Engine = EngineName
                    });
                }

                // Find the "next page" link
                var nextNode = doc.DocumentNode.SelectSingleNode(
                    "//li[@class='next']/a"
                );

                if (nextNode != null)
                {
                    var nextHref = nextNode.GetAttributeValue("href", "");
                    currentUrl = $"{baseUrl}/catalogue/{nextHref}";
                    pageNumber++;
                    await Task.Delay(delay);  
                }
                else
                {
                    currentUrl = null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error scraping page {Page}", pageNumber);
                break;
            }
        }

        // Send final progress
        if (onProgress != null)
        {
            await onProgress(new ScrapeProgress
            {
                CurrentPage = pageNumber,
                TotalPages = pageNumber,
                BooksFound = allBooks.Count,
                Status = "complete",
                Engine = EngineName
            });
        }

        _logger.LogInformation("HAP scraping complete: {Count} books", allBooks.Count);
        return allBooks;
    }

    private Book? ParseBookNode(HtmlNode bookNode, string baseUrl)
    {
        try
        {
            // TITLE: <h3><a title="...">
            var titleNode = bookNode.SelectSingleNode(".//h3/a");
            var title = titleNode?.GetAttributeValue("title", "") ?? "";

            // URL: build full URL from relative href
            var relativeUrl = titleNode?.GetAttributeValue("href", "") ?? "";
            var bookUrl = $"{baseUrl}/catalogue/{relativeUrl.Replace("../", "")}";

            // PRICE: <p class="price_color">£51.77</p>
            var priceNode = bookNode.SelectSingleNode(".//p[@class='price_color']");
            var priceText = priceNode?.InnerText.Trim() ?? "£0.00";
            var price = double.Parse(
                priceText.Replace("£", "").Replace("Â", ""),
                System.Globalization.CultureInfo.InvariantCulture
            );

            // RATING : <p class="star-rating Three">
            var ratingNode = bookNode.SelectSingleNode(
                ".//p[contains(@class, 'star-rating')]"
            );
            var ratingClass = ratingNode?.GetAttributeValue("class", "") ?? "";
            var rating = ParseRating(ratingClass);

            // Avability
            var stockNode = bookNode.SelectSingleNode(
                ".//p[contains(@class, 'instock')]"
            );
            var inStock = stockNode?.InnerText.Contains("In stock") ?? false;

            // Image
            var imgNode = bookNode.SelectSingleNode(".//img");
            var imgSrc = imgNode?.GetAttributeValue("src", "") ?? "";
            var imageUrl = imgSrc.StartsWith("http")
                ? imgSrc
                : $"{baseUrl}/{imgSrc.Replace("../", "")}";

            return new Book
            {
                Title = title,
                Price = price,
                PriceDisplay = priceText,
                Rating = rating,
                InStock = inStock,
                Url = bookUrl,
                ImageUrl = imageUrl,
                ScrapedAt = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse book node");
            return null;
        }
    }

    private static int ParseRating(string cssClass)
    {
        if (cssClass.Contains("One")) return 1;
        if (cssClass.Contains("Two")) return 2;
        if (cssClass.Contains("Three")) return 3;
        if (cssClass.Contains("Four")) return 4;
        if (cssClass.Contains("Five")) return 5;
        return 0;
    }
}


