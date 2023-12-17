const puppeteer = require('puppeteer');
const fs = require('fs/promises');

const favoriteCats = [];
async function main() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    const url = 'https://www.sospets.co.il/cats-adoption';
    await page.goto(url, {'timeout': 300000});
    
    const catsarray = await page.evaluate(() => {
        const cats = document.querySelectorAll('[id^="comp-kcbmlyum__"]');
        const catsArray = [];
        for (const cat of cats) {
          console.log("Cat Element:", cat);
          const catObj = {};
          catObj.id = cat.id;
          console.log(cat.getAttribute('title'));
          catObj.name = cat.getAttribute('title');
          catObj.image = cat.querySelector('img').src;
          catsArray.push(catObj);
        }
        return catsArray;
    })

     console.log(catsarray);

    // //extract cats names
    // const catsNames = await page.evaluate(() => {
    //     const elements = document.querySelectorAll('[id^="comp-kcbmlyum__"]');
    //     const titles = [];
    //     elements.forEach((element) => {
    //         const title = element.getAttribute('title');
    //         if (title) {
    //             titles.push(title);
    //          }
    //     });
    //     return titles;
    // })
    // await fs.writeFile('catsNames.txt', catsNames.join())

    //   // Extract image URLs
    // const imageUrls = await page.evaluate(() => {
    //   const images = document.querySelectorAll("[id^='comp-kcbmlyum__'] img");
    //   const urls = Array.from(images).map(img => img.src);
    //   return urls;
    // });

    await browser.close()
}

// function toggleHeart(catId) {
//   var heartIcon = document.getElementById('heart-' + catId);
//   if (heartIcon.classList.contains('fas')) {
//     heartIcon.classList.replace('fas', 'far');
//     heartIcon.classList.remove('red-heart');
//     favoriteCats.push(catId);
//   } else {
//     heartIcon.classList.replace('far', 'fas');
//     heartIcon.classList.add('red-heart');
//   }
// }


main().catch(error => console.error(error));



    
    // const catsImages = await page.$$eval("img" , (imgs)=> {
    //     return imgs.map(img => img.src)        
    // })


    // for (const cat of catsImages) {
    //     const imagePage = await page.goto(cat)
    //     await fs.writeFile(cat.split("/").pop(), await imagePage.buffer())
    // }

      // Wait for the element that contains the dynamically loaded images

    // const catsImages = await page.$$eval('img', (imgs) => {
    //     return imgs
    //       .filter((img) => img.src && img.src.toLowerCase().startsWith('http'))
    //       .map((img) => img.src);
    //   });
      
      
    //   for (const catUrl of catsImages) {
    //     try {
    //       const imagePage = await page.goto(catUrl);
    //       const fileName = catUrl.split("/").pop(); // Extract file name (optional)
    //       await fs.writeFile(fileName, await imagePage.buffer());
    //       console.log(`Image ${fileName} saved successfully.`);
    //     } catch (error) {
    //       console.error(`Error fetching or saving image from URL: ${catUrl}`);
    //       console.error(error);
    //     }
    //   }
      

    // const imageUrls = await page.evaluate(() => {
    //   const images = document.querySelectorAll('.HlRz5e.BI8PVQ[data-image-info][data-src^="https://static.wixstatic.com/"]:not([data-image-info*="284x397"])');


    //   const urls = [];
    //   images.forEach(function (element) {
    //       var nestedImgElement = element.querySelector('img');
    //       if (nestedImgElement) {
    //           var imageUrl = nestedImgElement.getAttribute('src');
    //           if (imageUrl)
    //             urls.push(imageUrl);
    //       } else {
    //           console.log('Nested img element not found inside an element with class HlRz5e');
    //       }
    //   });
    //   return urls;
    // });