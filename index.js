const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;

app.set('view engine', 'ejs');
app.use(express.static('public'));

let combinedData = []; // Declare combinedData globally


// Define an async function to fetch and cache the data

async function fetchDataAndCache() {
  try {
    const sospetsData = await fetchDataFromSospets();
    const letliveData = await fetchDataFromLetLive();
    const rlaData = await fetchDataFromRla();
    const petProtectHaifaData = await fetchDataFromPetProtectHaifa();
    
   combinedData = sospetsData.concat(letliveData, rlaData, petProtectHaifaData);
    
    console.log('Finished fetching data');
    fs.writeFileSync('combinedData.json', JSON.stringify(combinedData, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error fetching and caching data:', error.message);
  }
}

// Call the fetchDataAndCache function right after setting up the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  await fetchDataAndCache();
});

app.get('/', async (req, res) => {
    try {
        // Render the index.ejs template with the combined data
        res.render('index.ejs', { cardDetails: combinedData });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.get('/combinedData', (req, res) => {
    try {
        const rawData = fs.readFileSync('combinedData.json', 'utf-8');
        const data = JSON.parse(rawData);
        res.json(data);
    } catch (error) {
        console.error('Error reading combinedData.json:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


async function fetchDataFromSospets() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.sospets.co.il/cats-adoption', { timeout: 20000 });

    let isDisabled = await page.evaluate(() => document.querySelector('.kuTaGy').disabled);

    while (await page.$('.kuTaGy') && !isDisabled) {
      await page.click('.kuTaGy');
      await page.waitForTimeout(500);
      
      isDisabled = await page.evaluate(() => document.querySelector('.kuTaGy').disabled);
    }

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

    return cardDetails;
  } catch (error) {
    console.error(`Error fetching data from Sospets: ${error.message}`);
    return []; // Return an empty array in case of an error
  } finally {
    await browser.close();
  }
}


async function fetchDataFromLetLive() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  const baseUrl = 'https://www.letlive.org.il/?post_type=pet&pet-cat=pc-cat';
  let currentPage = 1;

  const cardDetails = [];

  try {
    do {
      await page.goto(`${baseUrl}&paged=${currentPage}`, { timeout: 20000 });

      const pageCardDetails = await page.evaluate(() => {
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
      });

      cardDetails.push(...pageCardDetails);
      const nextButton = await page.$('a[href*="paged=' + (currentPage + 1) + '"]');

      if (nextButton) {
        // Click the "הבא" (Next) link to load the next page
        await Promise.all([
          page.waitForNavigation(), // Wait for the page to navigate
          nextButton.click(),
        ]);
        currentPage++;
      } else {
        break;
      }
    } while (true);

    return cardDetails;
  } catch (error) {
    console.error(`Error fetching data from LetLive: ${error.message}`);
    return []; // Return an empty array in case of an error
  } finally {
    await browser.close();
  }
}


async function fetchDataFromRla() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto('https://www.rla.org.il/adoption/cats/', { timeout: 20000 });

    const cardDetails = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('.span3'));

      return cards.map(card => {
        const imgElement = card.querySelector('img');
        const imgSrc = imgElement ? imgElement.src : '';

        const nameElement = card.querySelector('.ui--content-box-title-text');
        const name = nameElement ? nameElement.textContent : '';

        const location = 'ראשון אוהבת חיות';

        const anchorTag = card.querySelector('a');
        const href = anchorTag ? anchorTag.getAttribute('href') : '';

        return { name, imgSrc, location, href };
      });
    });

    const detailedCardDetails = [];
    for (const card of cardDetails) {
      const newPage = await browser.newPage();
      try {
        await newPage.goto(card.href, { timeout: 80000 });
        const description = await newPage.$eval('.ui--tagline-content p', element => element.innerText);

        const keywords = ['בן', 'זכר', 'הוא', 'אותו'];
        const isMale = keywords.some(keyword => description.includes(keyword)) && !description.includes('היא');
        detailedCardDetails.push({ ...card, description, isMale });
      } catch (error) {
        console.error(`Error processing page ${card.href}: ${error.message}`);
      } finally {
        await newPage.close();
      }
    }

    return detailedCardDetails;
  } catch (error) {
    console.error(`Error fetching data from Rla: ${error.message}`);
    return []; // Return an empty array in case of an error
  } finally {
    await browser.close();
  }
}


async function fetchDataFromPetProtectHaifa() {
  const baseUrl = 'http://www.petprotect.org.il';
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  try {
    await page.goto(`${baseUrl}/adopt-cat`, { timeout: 20000 });

    const cardDetails = await page.evaluate(baseUrl => {
      const cards = Array.from(document.querySelectorAll('.quadruple'));

      return cards.map(card => {
        const imgElement = card.querySelector('img');
        const imgSrc = imgElement ? imgElement.src : '';

        const nameElement = card.querySelector('h2');
        const name = nameElement ? nameElement.textContent.trim() : '';

        const location = 'אגודת צער בעלי חיים חיפה';

        const anchorTag = card.querySelector('a');
        const relativeHref = anchorTag ? anchorTag.getAttribute('href') : '';
        const href = baseUrl + relativeHref;

        return { name, imgSrc, location, href };
      });
    }, baseUrl);

    const detailedCardDetails = [];
    for (const card of cardDetails) {
      const newPage = await browser.newPage();
      try {
        await newPage.goto(card.href, { timeout: 80000 });

        const description = await newPage.$eval('.titledog + p', paragraph => paragraph.textContent);

        const dogDataElement = await newPage.$('.dogdata');
        const secondDivText = await newPage.evaluate(el => el.children[1].textContent, dogDataElement);
        const isMale = secondDivText.includes('זכר');

        detailedCardDetails.push({ ...card, description, isMale });
      } catch (error) {
        console.error(`Error processing page ${card.href}: ${error.message}`);
      } finally {
        await newPage.close();
      }
    }

    return detailedCardDetails;
  } catch (error) {
    console.error(`Error fetching data from PetProtectHaifa: ${error.message}`);
    return []; // Return an empty array in case of an error
  } finally {
    await browser.close();
  }
}







