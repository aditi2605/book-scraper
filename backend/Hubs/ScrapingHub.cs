using Microsoft.AspNetCore.SignalR;
using BookScraper.Models;

namespace BookScraper.Hubs;

public class ScrapingHub : Hub
{
    private readonly ILogger<ScrapingHub> _logger;

    public ScrapingHub(ILogger<ScrapingHub> logger)
    {
        _logger = logger;
    }

    public override async Task OnConnectedAsync()
    {
        _logger.LogInformation("Client connected: {Id}", Context.ConnectionId);
        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Client disconnected: {Id}", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }
}