
// Import the Puppeteer library
const puppeteer = require('puppeteer');
 
// Define an asynchronous function to run our code
(async () => {
    // Launch a new browser instance using Puppeteer
    const browser = await puppeteer.launch();
 
    // Open a new page in the browser
    const page = await browser.newPage();
 
    // Navigate to the specified URL
    await page.goto('https://www.sospets.co.il/cats-adoption', { timeout: 20000 });
 
    // Extract details from each card on the page
    const cardDetails = await page.evaluate(() => {
        // Step 1: Retrieve all card elements
        const cards = Array.from(document.querySelectorAll('.Zc7IjY'));
 
        // Step 2: Process each card to extract details
        return cards.map(card => {
            // Find the image element in the card and get its source (src) attribute
            const imgElement = card.querySelector('img');
            const imgSrc = imgElement ? imgElement.src : '';
 
            // Split the text inside the card into lines and take the first two lines
            const textLines = card.innerText.split('\n\n').slice(0, 2);
            const name = textLines[0] || '';
            const description = textLines[1] || '';
 
            // Return an object containing the name, description, and image source for each card
            return { name, description, imgSrc };
        });
    });
 
    // Print the details of each card
    cardDetails.forEach((card, index) => {
        console.log(`Card ${index + 1} Details:`);
        console.log('Name:', card.name);
        console.log('Description:', card.description);
        console.log('Image Source:', card.imgSrc);
        console.log('-----------------------------------');
    });
 
    // Close the browser after finishing
    await browser.close();
})();

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



// const puppeteer = require('puppeteer');
// const fs = require('fs/promises');

// const favoriteCats = [];
// async function main() {
//     const browser = await puppeteer.launch();
//     const page = await browser.newPage();
//     const url = 'https://www.sospets.co.il/cats-adoption';
//     await page.goto(url, {'timeout': 300000});
    
//     const catsarray = await page.evaluate(() => {
//         const cats = document.querySelectorAll('[id^="comp-kcbmlyum__"]');
//         const catsArray = [];
//         for (const cat of cats) {
//           console.log("Cat Element:", cat);
//           const catObj = {};
//           catObj.id = cat.id;
//           console.log(cat.getAttribute('title'));
//           catObj.name = cat.getAttribute('title');
//           catObj.image = cat.querySelector('img').src;
//           catsArray.push(catObj);
//         }
//         return catsArray;
//     })

//      console.log(catsarray);

//     // //extract cats names
//     // const catsNames = await page.evaluate(() => {
//     //     const elements = document.querySelectorAll('[id^="comp-kcbmlyum__"]');
//     //     const titles = [];
//     //     elements.forEach((element) => {
//     //         const title = element.getAttribute('title');
//     //         if (title) {
//     //             titles.push(title);
//     //          }
//     //     });
//     //     return titles;
//     // })
//     // await fs.writeFile('catsNames.txt', catsNames.join())

//     //   // Extract image URLs
//     // const imageUrls = await page.evaluate(() => {
//     //   const images = document.querySelectorAll("[id^='comp-kcbmlyum__'] img");
//     //   const urls = Array.from(images).map(img => img.src);
//     //   return urls;
//     // });

//     await browser.close()
// }

// // function toggleHeart(catId) {
// //   var heartIcon = document.getElementById('heart-' + catId);
// //   if (heartIcon.classList.contains('fas')) {
// //     heartIcon.classList.replace('fas', 'far');
// //     heartIcon.classList.remove('red-heart');
// //     favoriteCats.push(catId);
// //   } else {
// //     heartIcon.classList.replace('far', 'fas');
// //     heartIcon.classList.add('red-heart');
// //   }
// // }


// main().catch(error => console.error(error));



    
//     // const catsImages = await page.$$eval("img" , (imgs)=> {
//     //     return imgs.map(img => img.src)        
//     // })


//     // for (const cat of catsImages) {
//     //     const imagePage = await page.goto(cat)
//     //     await fs.writeFile(cat.split("/").pop(), await imagePage.buffer())
//     // }

//       // Wait for the element that contains the dynamically loaded images

//     // const catsImages = await page.$$eval('img', (imgs) => {
//     //     return imgs
//     //       .filter((img) => img.src && img.src.toLowerCase().startsWith('http'))
//     //       .map((img) => img.src);
//     //   });
      
      
//     //   for (const catUrl of catsImages) {
//     //     try {
//     //       const imagePage = await page.goto(catUrl);
//     //       const fileName = catUrl.split("/").pop(); // Extract file name (optional)
//     //       await fs.writeFile(fileName, await imagePage.buffer());
//     //       console.log(`Image ${fileName} saved successfully.`);
//     //     } catch (error) {
//     //       console.error(`Error fetching or saving image from URL: ${catUrl}`);
//     //       console.error(error);
//     //     }
//     //   }
      

//     // const imageUrls = await page.evaluate(() => {
//     //   const images = document.querySelectorAll('.HlRz5e.BI8PVQ[data-image-info][data-src^="https://static.wixstatic.com/"]:not([data-image-info*="284x397"])');


//     //   const urls = [];
//     //   images.forEach(function (element) {
//     //       var nestedImgElement = element.querySelector('img');
//     //       if (nestedImgElement) {
//     //           var imageUrl = nestedImgElement.getAttribute('src');
//     //           if (imageUrl)
//     //             urls.push(imageUrl);
//     //       } else {
//     //           console.log('Nested img element not found inside an element with class HlRz5e');
//     //       }
//     //   });
//     //   return urls;
//     // });

    // Import the Puppeteer library