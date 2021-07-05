const scraperObject = {
    url: 'https://www.braesul.com.br/produtos',
    async scraper(browser, category) {

        let page = await browser.newPage();
        // console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);
        // Select the line of product to be displayed

        let selectedCategory = await page.$$eval('.sidebar-block__content> ul > li > a', (links, _category) => {
            // Search for the element that has the matching text
            links = links.map(a => a.textContent.replace(/(\r\n\t|\n|\r|\t|^\s|\s$|\B\s|\s\B)/gm, "") === _category ? a : null);
            let link = links.filter(tx => tx !== null)[0];
            return link.href;
        }, category);

        // // Navigate to the selected category
        await page.goto(selectedCategory);
        let scrapedData = [];
        var countPage = 1

        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage() {

            await page.waitForSelector('.product-image');

            // Get the link to all the required products
            let urls = await page.$$eval('.col-12 > section .col-6', links => {
                links = links.map(el => el.querySelector('.product-card > a').href)
                return links;
            });

            // Loop through each of those links, open a new page instance and get the relevant data from them
            var count = 0
            let pagePromise = (link) => new Promise(async (resolve, reject) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);
                dataObj['productTitle'] = await newPage.$eval('.position-relative > h1', text => text.textContent);
                dataObj['productPriceFinal'] = await newPage.$eval('.product-price-final', text => text.textContent);
                dataObj['productPriceDiscount'] = await newPage.$eval('.product-price-discount', (text) => text.textContent).catch(() => dataObj['productPriceFinal'])
                dataObj['productIimageUrl'] = await newPage.$eval('.product-gallery img', img => img.src);
                dataObj['productDescription'] = await newPage.$eval('.product-description-item p', p => p.textContent);
                dataObj['productLine'] = category;
                resolve(dataObj);
                await newPage.close();
            });

            for (link in urls) {
                let currentPageData = await pagePromise(urls[link]);
                scrapedData.push(currentPageData);
            }

            // When all the data on this page is done, click the next button and start the scraping of the next page
            // You are going to check if this button exist first, so you know if there really is a next page.
            let hyperlink_next = await page.$$eval('.paginate', links => {
                links = links.map(el => el.querySelector('.paginate__item--next > a').href)
                return links;
            });

            let pageOfNext = [...new Set(hyperlink_next)].toString().replace(/\D/gim, '');

            if (pageOfNext > countPage) {
                countPage++
                console.log('entrou no botão next')
                await page.$$eval('.paginate', links => {
                    links = links.map(el => el.querySelector('.paginate__item--next > a').click())
                    return links;
                });

                return scrapeCurrentPage(); // Call this function recursively
            }

            await page.close();
            return scrapedData;
        }
        let data = await scrapeCurrentPage();
        // console.log(data);
        return data;

    }
}


module.exports = scraperObject;