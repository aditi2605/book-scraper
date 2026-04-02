# BookScraper

A full-stack web scraping project I built to learn how scraping actually works from downloading HTML to extracting data, storing it in a database, and displaying it in a dashboard.

It scrapes book data from [books.toscrape.com](http://books.toscrape.com) (a site built specifically for scraping practice: no rules broken here) and displays everything in a React dashboard where you can search, filter, favourite books, and see price/rating analytics.

## Why I Built This

I wanted to understand web scraping properly: not just follow a tutorial, but actually know what's happening at each step. Things like: what's the difference between downloading raw HTML vs using a headless browser? How do you find specific elements on a page? What are the legal and ethical rules around scraping in the UK?

Building something real was the best way to learn all of that.

## What It Does

- **Scrapes books** using two different approaches (so I could compare them)
- **Search and filter** — find books by title, price range, rating, stock status
- **Analytics dashboard** — charts showing price distribution, rating breakdown
- **Deal finder** — surfaces cheap books with high ratings (best value)
- **Favourites** — save books to a SQLite database
- **CSV export** — download your scraped data
- **Live progress** — SignalR pushes real-time updates as pages are scraped

## The Two Scraping Approaches

The main thing I wanted to learn was the difference between static and dynamic scraping:

**HtmlAgilityPack (HAP)** — downloads the raw HTML and parses it. Fast, lightweight, but only works if the data is already in the HTML source. This is the C# equivalent of Python's BeautifulSoup.

**Playwright** — launches an actual headless browser (Chromium), navigates to the page, waits for JavaScript to load, then reads the rendered page. Slower but can handle any website, including JavaScript-heavy ones.

For books.toscrape.com, HAP is all you need since it's a static site. But I included Playwright to learn the technique for when I need to scrape dynamic sites in the future.

## Tech Stack

**Backend:** C# / ASP.NET Core Web API, Entity Framework Core, SQLite, SignalR, HtmlAgilityPack, Playwright

**Frontend:** React, TypeScript, Recharts, Tailwind CSS, SignalR client

## Running It Locally

You'll need: .NET 10 SDK, Node.js 20+, and PowerShell (for Playwright browser install).

**Backend:**
```bash
cd backend
dotnet restore
dotnet build
pwsh bin/Debug/net10.0/playwright.ps1 install
dotnet run
# API runs at http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
# UI runs at http://localhost:5173
```

Open http://localhost:5173, pick a scraping engine, set how many pages, and click Start Scraping.

## What I Learned

- The scraping pattern is the same in every language: **fetch → parse → select → extract**
- HtmlAgilityPack uses XPath, Playwright uses CSS selectors — different syntax, same job
- SQLite is great for learning projects — no server, just a file
- Always check robots.txt and Terms of Service before scraping any site
- Add delays between requests, hammering a server is rude and will get you blocked
- UK GDPR applies if you're scraping personal data, public product info is generally fine, people's data is not

## Project Structure
```
backend/
  Controllers/     — API endpoints (books, favourites)
  Services/        — Scraping logic (HAP + Playwright)
  Models/          — Data shapes (Book, Favourite, DTOs)
  Data/            — Database context (SQLite)
  Hubs/            — SignalR hub for live progress

frontend/
  src/components/  — React UI components
  src/hooks/       — API calls and SignalR connection
  src/types/       — TypeScript types matching backend models
```

## Ethical Note

This project only scrapes books.toscrape.com — a website that exists specifically for people to practise scraping on. The scraper includes a 1-second delay between requests and identifies itself with a descriptive User-Agent header.
