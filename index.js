const puppeteer = require('puppeteer');
const express = require('express');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.get('/', async (req, res) => {
    try {
        // Fetch data from https://www.sospets.co.il/cats-adoption
        const sospetsData = await fetchDataFromSospets();

        // Fetch data from https://www.letlive.org.il/?post_type=pet&pet-cat=pc-cat
        const letliveData = await fetchDataFromLetLive();

        // Combine the data from both sources
        const combinedData = sospetsData.concat(letliveData);

        // Render the index.ejs template with the combined data
        res.render('index', { cardDetails: combinedData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

async function fetchDataFromSospets() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.sospets.co.il/cats-adoption', { timeout: 20000 });

    const cardDetails = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.Zc7IjY'));

        return cards.map(card => {
            const imgElement = card.querySelector('img');
            const imgSrc = imgElement ? imgElement.src : '';

            const textLines = card.innerText.split('\n\n').slice(0, 2);
            const name = textLines[0] || '';
            const description = textLines[1] || '';

            const location = 'SOS הרצליה';
            const isMale = description.includes('בן');

            const anchorTag = card.querySelector('a');
            const href = anchorTag ? anchorTag.getAttribute('href') : '';

            return { name, description, imgSrc, location, isMale, href };
        });
    });

    await browser.close();
    return cardDetails;
}

async function fetchDataFromLetLive() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.letlive.org.il/?post_type=pet&pet-cat=pc-cat', { timeout: 20000 });

    const cardDetails = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.pet-details'));

        return cards.map(card => {
            const imgElement = card.querySelector('img');
            const imgSrc = imgElement ? imgElement.src : '';
          
            const textLines = card.innerText.split('\n\n').slice(0, 2) || '';
            const anchorTag = card.querySelector('a');
            const href = anchorTag ? anchorTag.getAttribute('href') : '';
          
            const { name, location, isMale } = (() => {
              const petDetailsGenderElements = card.querySelectorAll('.pet-details-gendar');
              let isMale = false;
              let location = '';
          
              // Iterate through the elements and check their content
              petDetailsGenderElements.forEach(element => {
                const textContent = element.innerText;
          
                // Check if the element contains the word "זכר"
                if (textContent.includes('זכר')) {
                  isMale = true;
                }
          
                // Check if the element contains specific location text
                if (!textContent.includes('זכר') && !textContent.includes('נקבה')) {
                  location = textContent;
                }
              });
          
              return { 
                name: (() => {
                    const h3Element = card.querySelector('h3 a');
                    if (h3Element) {
                      const href = h3Element.getAttribute('href');
                      const petParam = new URL(href).searchParams.get('pet');
                  
                      // Extract only the part before the hyphen
                      return petParam.split('-')[0] || '';
                    }
                    return '';
                  })(),
                location,
                isMale
              };
            })();
          
            return { name, description: textLines[1] || '', imgSrc, location, isMale, href };
          });
          

        // return cards.map(card => {
        //     const imgElement = card.querySelector('img');
        //     const imgSrc = imgElement ? imgElement.src : '';

        //     const textLines = card.innerText.split('\n\n').slice(0, 2) || '';

        //     let name = '';
        //     const h3Element = document.querySelector('h3 a');
        //     if (h3Element) {
        //         const href = h3Element.getAttribute('href');
        //         name = decodeURIComponent(new URL(href).searchParams.get('pet'));
        //     }

        //     const description = textLines[1] || '';

        //     const petDetailsGenderElements = document.querySelectorAll('.pet-details-gendar');
        //     let isMale = false;
        //     let location = '';

        //     // Iterate through the elements and check their content
        //     petDetailsGenderElements.forEach(element => {
        //     const textContent = element.innerText;

        //     // Check if the element contains the word "זכר"
        //     if (textContent.includes('זכר')) {
        //         isMale = true;
        //     }

        //     // Check if the element contains specific location text
        //     if (!textContent.includes('זכר') && !textContent.includes('נקבה')) {
        //         location = textContent;
        //     }
        //     });

        //     return { name, description, imgSrc, location, isMale };
        // });
    });

    await browser.close();

    return cardDetails;
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// // Import the Puppeteer library
// const puppeteer = require('puppeteer');
// const express = require('express');
// const app = express();
// const PORT = 3000;

// app.set('view engine', 'ejs');
// app.use(express.static('public'));

// app.get('/', async (req, res) => {
//     try {
//       const browser = await puppeteer.launch();
//       const page = await browser.newPage();
//       await page.goto('https://www.sospets.co.il/cats-adoption', { timeout: 20000 });
  
//       const cardDetails = await page.evaluate(() => {
//         const cards = Array.from(document.querySelectorAll('.Zc7IjY'));
  
//         return cards.map(card => {
//           const imgElement = card.querySelector('img');
//           const imgSrc = imgElement ? imgElement.src : '';
  
//           const textLines = card.innerText.split('\n\n').slice(0, 2);
//           const name = textLines[0] || '';
//           const description = textLines[1] || '';
  
//           const location = 'SOS הרצליה';
//           const isMale = description.includes('בן');
//           return { name, description, imgSrc, location, isMale };
//         });
//       });
  
//       await browser.close();
  
//       // Render the index.ejs template with the cardDetails
//       res.render('index', { cardDetails });
//     } catch (error) {
//       console.error(error);
//       res.status(500).send('Internal Server Error');
//     }
//   });

//   app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
//   });
 
// // Define an asynchronous function to run our code
// (async () => {
//     // Launch a new browser instance using Puppeteer
//     const browser = await puppeteer.launch();
 
//     // Open a new page in the browser
//     const page = await browser.newPage();
 
//     // Navigate to the specified URL
//     await page.goto('https://www.sospets.co.il/cats-adoption', { timeout: 20000 });
 
//     // Extract details from each card on the page
//     const cardDetails = await page.evaluate(() => {
//         // Step 1: Retrieve all card elements
//         const cards = Array.from(document.querySelectorAll('.Zc7IjY'));
 
//          // Step 2: Dynamically create cards based on the data
//         const catContainer = document.querySelector('.cats-container');
//         const cardTemplate = document.getElementById('catCardTemplate'); 


//         // Step 3: Process each card to extract details
//         return cards.map(card => {
//             // Find the image element in the card and get its source (src) attribute
//             const imgElement = card.querySelector('img');
//             const imgSrc = imgElement ? imgElement.src : '';
 
//             // Split the text inside the card into lines and take the first two lines
//             const textLines = card.innerText.split('\n\n').slice(0, 2);
//             const name = textLines[0] || '';
//             const description = textLines[1] || '';

//                     // Clone the template
//             const cardClone = cardTemplate ? document.importNode(cardTemplate.content, true) : null;

//             // Update the content of the cloned template with data
//             cardClone.querySelector('img').src = card.imgSrc;
//             cardClone.querySelector('h5').textContent = card.name;
//             cardClone.querySelector('.description h3 p').textContent = card.description;

//             // Append the cloned template to the cat container
//             catContainer.appendChild(cardClone);
 
//             // Return an object containing the name, description, and image source for each card
//             return { name, description, imgSrc };
//         });
//     });
 
//     // Close the browser after finishing
//     await browser.close();
// })();





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