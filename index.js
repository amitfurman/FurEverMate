const puppeteer = require('puppeteer');
const fs = require('fs/promises');

async function main() {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()
    const url = 'https://www.sospets.co.il/cats-adoption'
    await page.goto(url, {'timeout': 10000, 'waitUntil':'networkidle2'})
   // await page.goto('https://www.sospets.co.il/cats-adoption')
    
    const catsNames = await page.evaluate(() => {
        const elements = document.querySelectorAll('[id^="comp-kcbmlyum__"]');
        const titles = [];
        elements.forEach((element) => {
            const title = element.getAttribute('title');
            if (title) {
                titles.push(title);
             }
        });
        return titles;
        //return Array.from(document.querySelectorAll("#comp-kcbmlyur__1c2681e7-a94d-4b60-8d6b-8aaa779f4ac1 > h4 > span > span > span > span")).map((name) => name.innerText)
    })
    await fs.writeFile('catsNames.txt', catsNames.join())
    
    // const catsImages = await page.$$eval("img" , (imgs)=> {
    //     return imgs.map(img => img.src)        
    // })

    // for (const img of catsImages) {
    //     const imagePage = await page.goto(img)
    //     await fs.writeFile(img.split("/").pop(), await imagePage.buffer())
    // }

    await browser.close()
}

main().catch(error => console.error(error));
