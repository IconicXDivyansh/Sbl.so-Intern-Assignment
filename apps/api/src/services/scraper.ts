import puppeteer from 'puppeteer';

export interface ScrapedData {
  title: string;
  content: string;
  url: string;
  timestamp: Date;
}

/**
 * Scrapes a website and extracts its content
 * @param url - The URL to scrape
 * @returns Scraped data including title, content, and metadata
 */
export async function scrapeWebsite(url: string): Promise<ScrapedData> {
  console.log(`🌐 Starting Puppeteer browser for: ${url}`);
  
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--disable-gpu',
    ],
  });

  try {
    const page = await browser.newPage();
    
    // Set a reasonable timeout
    await page.setDefaultNavigationTimeout(30000);
    
    // Set user agent to avoid being blocked (using new API)
    await page.setExtraHTTPHeaders({
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    });

    console.log(`📡 Navigating to: ${url}`);
    // Use domcontentloaded instead of networkidle2 for faster loading and better resilience
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });
    
    // Wait a bit for dynamic content to load
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract page data
    const data = await page.evaluate(() => {
      // Get title
      const title = document.title || 'No title found';

      // Remove script and style tags
      const scripts = document.querySelectorAll('script, style, noscript, iframe');
      scripts.forEach(el => el.remove());

      // Get main content (try multiple strategies)
      let content = '';
      
      // Strategy 1: Look for main content areas
      const mainSelectors = ['main', 'article', '[role="main"]', '.content', '#content'];
      for (const selector of mainSelectors) {
        const element = document.querySelector(selector) as HTMLElement;
        if (element) {
          content = element.innerText;
          break;
        }
      }

      // Strategy 2: Fall back to body if no main content found
      if (!content || content.length < 100) {
        content = document.body.innerText;
      }

      // Clean up the content
      content = content
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .replace(/\n{3,}/g, '\n\n') // Replace multiple newlines with double newline
        .trim();

      return { title, content };
    });

    console.log(`✅ Successfully scraped ${url} (${data.content.length} characters)`);

    return {
      title: data.title,
      content: data.content,
      url,
      timestamp: new Date(),
    };
  } catch (error) {
    console.error(`❌ Error scraping ${url}:`, error);
    throw new Error(`Failed to scrape website: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    await browser.close();
    console.log(`🔒 Browser closed for: ${url}`);
  }
}
