const puppeteer = require('puppeteer');
const fs = require('fs/promises');

const favoriteCats = [];
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


    // for (const cat of catsImages) {
    //     const imagePage = await page.goto(cat)
    //     await fs.writeFile(cat.split("/").pop(), await imagePage.buffer())
    // }

      // Wait for the element that contains the dynamically loaded images

    const catsImages = await page.$$eval('img', (imgs) => {
        return imgs
          .filter((img) => img.src && img.src.toLowerCase().startsWith('http'))
          .map((img) => img.src);
      });
      
      
      for (const catUrl of catsImages) {
        try {
          const imagePage = await page.goto(catUrl);
          const fileName = catUrl.split("/").pop(); // Extract file name (optional)
          await fs.writeFile(fileName, await imagePage.buffer());
          console.log(`Image ${fileName} saved successfully.`);
        } catch (error) {
          console.error(`Error fetching or saving image from URL: ${catUrl}`);
          console.error(error);
        }
      }
      
      
    await browser.close()
}

function toggleHeart(catId) {
  var heartIcon = document.getElementById('heart-' + catId);
  if (heartIcon.classList.contains('fas')) {
    heartIcon.classList.replace('fas', 'far');
    heartIcon.classList.remove('red-heart');
    favoriteCats.push(catId);
  } else {
    heartIcon.classList.replace('far', 'fas');
    heartIcon.classList.add('red-heart');
  }
}


main().catch(error => console.error(error));
