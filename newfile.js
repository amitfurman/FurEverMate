const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    // Navigate to a sample webpage
    await page.goto('https://example.com');

    // Run the query selector and print the result
    const result = await page.evaluate(() => {
        const selectorResult = document.querySelectorAll('[id^="comp-kcbmlyum__"]');
        return Array.from(selectorResult);
    });

    console.log(result);

    // Close the browser
    await browser.close();
})();
