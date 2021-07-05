const pageScraper = require('./pageScraper');
const fs = require('fs');
async function scrapeAll(browserInstance){
    let browser;
    try{
        browser = await browserInstance;
        let scrapedData = {};

        // Call the scraper for different set of products to be scraped
        scrapedData['Bond Angel'] = await pageScraper.scraper(browser, 'Bond Angel');
        scrapedData['Divine'] = await pageScraper.scraper(browser, 'Divine');
        scrapedData['Gorgeous'] = await pageScraper.scraper(browser, 'Gorgeous');
        scrapedData['Revival'] = await pageScraper.scraper(browser, 'Revival');
        scrapedData['Soul Color'] = await pageScraper.scraper(browser, 'Soul Color');
        scrapedData['Tratamento'] = await pageScraper.scraper(browser, 'Tratamento');

        await browser.close();
        fs.writeFile("data.json", JSON.stringify(scrapedData), 'utf8', function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The data has been scraped and saved successfully! View it at './data.json'");
        });
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}


module.exports = (browserInstance) => scrapeAll(browserInstance)