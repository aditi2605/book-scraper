using Microsoft.Playwright;
using BookScraper.Models;

namespace BookScraper.Services;

public class PlaywrightScraperService : IScraperService
{
    private readonly IConfiguration _config;
    private readonly ILogger<PlaywrightScraperService> _logger;

    public string EngineName => "Playwright";

    public PlaywrightScraperService(
        IConfiguration config,
        ILogger<PlaywrightScraperService> logger)
    {
        _config = config;
        _logger = logger;
    }

    public async Task<List<Book>> ScrapeAllBooksAsync(
        int? maxPages = null,
        Func<ScrapeProgress, Task>? onProgress = null)
    {
        var allBooks = new List<Book>();
        var baseUrl = _config["ScrapingConfig:BaseUrl"] ?? "https://books.toscrape.com";
        var delay = int.Parse(_config["ScrapingConfig:DelayBetweenRequestsMs"] ?? "1000");

        
        using var playwright = await Playwright.CreateAsync();

        await using var browser = await playwright.Chromium.LaunchAsync(
            new BrowserTypeLaunchOptions
            {
                Headless = true  
            }
        );

        var userAgent = _config["ScrapingConfig:UserAgent"] ?? "BookScraperBot/1.0";
        await using var context = await browser.NewContextAsync(
            new BrowserNewContextOptions { UserAgent = userAgent }
        );

        var page = await context.NewPageAsync();

        int pageNumber = 1;
        string? currentUrl = $"{baseUrl}/catalogue/page-1.html";

        while (currentUrl != null)
        {
            if (maxPages.HasValue && pageNumber > maxPages.Value)
                break;

            _logger.LogInformation("Scraping page {Page} with Playwright...", pageNumber);

            try
            {
              
                await page.GotoAsync(currentUrl, new PageGotoOptions
                {
                    WaitUntil = WaitUntilState.NetworkIdle
                });

                
                var bookElements = await page.QuerySelectorAllAsync(
                    "article.product_pod"
                );

                foreach (var element in bookElements)
                {
                    var book = await ParseBookElement(element, baseUrl);
                    if (book != null)
                    {
                        book.ScrapedBy = EngineName;
                        allBooks.Add(book);
                    }
                }

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

                
                var nextButton = await page.QuerySelectorAsync("li.next > a");

                if (nextButton != null)
                {
                    var nextHref = await nextButton.GetAttributeAsync("href");
                    if (!string.IsNullOrEmpty(nextHref))
                    {
                        currentUrl = $"{baseUrl}/catalogue/{nextHref}";
                        pageNumber++;
                        await Task.Delay(delay);
                    }
                    else
                    {
                        currentUrl = null;
                    }
                }
                else
                {
                    currentUrl = null;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error on page {Page} with Playwright", pageNumber);
                break;
            }
        }

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

        _logger.LogInformation("Playwright complete: {Count} books", allBooks.Count);
        return allBooks;
    }

    private async Task<Book?> ParseBookElement(IElementHandle element, string baseUrl)
    {
        try
        {
            var titleElement = await element.QuerySelectorAsync("h3 > a");
            var title = await titleElement!.GetAttributeAsync("title") ?? "";

            var relativeUrl = await titleElement.GetAttributeAsync("href") ?? "";
            var bookUrl = $"{baseUrl}/catalogue/{relativeUrl.Replace("../", "")}";

            var priceElement = await element.QuerySelectorAsync(".price_color");
            var priceText = (await priceElement!.InnerTextAsync()).Trim();
            var price = decimal.Parse(
                priceText.Replace("£", "").Replace("Â", ""),
                System.Globalization.CultureInfo.InvariantCulture
            );

            var ratingElement = await element.QuerySelectorAsync("[class*='star-rating']");
            var ratingClass = await ratingElement!.GetAttributeAsync("class") ?? "";
            var rating = ParseRating(ratingClass);

            var stockElement = await element.QuerySelectorAsync(".instock");
            var stockText = stockElement != null ? await stockElement.InnerTextAsync() : "";
            var inStock = stockText.Contains("In stock");

            var imgElement = await element.QuerySelectorAsync("img");
            var imgSrc = await imgElement?.GetAttributeAsync("src") ?? "";
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
            _logger.LogWarning(ex, "Failed to parse book element");
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
