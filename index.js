require('dotenv').config();
const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');

const dbURI = process.env.MONGO_URI 
const Cat = require('./models/cat');

//connect to mongodb
mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    console.log('Connected to MongoDB');
    app.listen(PORT, async () => {
      console.log(`Server is running on port ${PORT}`);
      await fetchDataAndCache();
    });
  })
  .catch((err) => console.log(err));


app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use((req, res, next) => {
  const currentRoute = req.originalUrl.replace('/', '') || 'home';
  res.locals.currentPage = currentRoute;
  next();
});
let combinedData = []; 

async function fetchDataAndCache() {
  try {
    const sospetsData = await fetchDataFromSospets();
    const letliveData = await fetchDataFromLetLive();
    const rlaData = await fetchDataFromRla();
    const petProtectHaifaData = await fetchDataFromPetProtectHaifa();
    combinedData = sospetsData.concat(letliveData, rlaData, petProtectHaifaData);
    const catInstances = combinedData.map(catData => new Cat(catData));
    await saveCatsToDatabase(catInstances);
    
    console.log('Finished fetching data');
  } catch (error) {
    console.error('Error fetching and caching data:', error.message);
  }
}

app.get('/', async (req, res) => {
  try {
      const catsFromDatabase = await Cat.find();

      res.render('index.ejs', { cardDetails: catsFromDatabase });
  } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
  }
});


app.get('/combinedData', async (req, res) => {
    try {
        const catsFromDatabase = await Cat.find();
        res.json(catsFromDatabase);
    } catch (error) {
        console.error('Error reading cats from database:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/about', (req, res) => {
  res.render('about.ejs');
});

function handleError(message, error) {
  console.error(`${message}: ${error.message}`);
  return []; 
}

async function fetchDataFromSospets() {
  const browser = await puppeteer.launch();

  try {
    const page = await browser.newPage();
    await page.goto('https://www.sospets.co.il/cats-adoption', { timeout: 20000 });

    let loadMoreCatsButton = await page.evaluate(() => document.querySelector('.PlZyDq').disabled);
    while (await page.$('.PlZyDq') && !loadMoreCatsButton) {
      await page.click('.PlZyDq');
      await page.waitForTimeout(500);
      loadMoreCatsButton = await page.evaluate(() => document.querySelector('.PlZyDq').disabled);    }
      const cardDetails = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll('.Zc7IjY'));

        return cards.map(card => {
          const imgElement = card.querySelector('img');
          const imgSrc = imgElement ? imgElement.src : '';
          const textLines = card.innerText.split('\n\n').slice(0, 2);
          const name = textLines[0] || '';
          const description = textLines[1] || '';
          const isMale = description.includes('בן');

          const anchorTag = card.querySelector('a');
          const href = anchorTag ? anchorTag.getAttribute('href') : '';

            return{
              name,
              description,
              imgSrc,
              location: 'SOS הרצליה',
              isMale,
              href,
            };
         });
    });

    return cardDetails;
  } catch (error) {
    return handleError('Error fetching data from Sospets', error);
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
        
            petDetailsGenderElements.forEach(element => {
              const textContent = element.innerText;
              if (textContent.includes('זכר')) {
                isMale = true;
              }
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
        await Promise.all([
          page.waitForNavigation(),
          nextButton.click(),
        ]);
        currentPage++;
      } else {
        break;
      }
    } while (true);

    return cardDetails;
  } catch (error) {
    return handleError('Error fetching data from Letlive', error);
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
    return handleError('Error fetching data from Rla', error);
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
    return handleError('Error fetching data from PetProtectHaifa', error);
  } finally {
    await browser.close();
  }
}

async function saveCatsToDatabase(catObjects) {
  try {
    const savedCats = await Cat.find();

    const catsToRemove = savedCats.filter(savedCat => {
      return !catObjects.some(newCat => newCat.href === savedCat.href);
    });

    // Remove cats that are no longer present on the website
    if (catObjects.length > 0) {
      for (const catToRemove of catsToRemove) {
        await Cat.deleteOne({ _id: catToRemove._id });
        console.log(`Cat '${catToRemove.name}' removed from the database.`);
      }
    } else {
      console.log('No cats to add to the database. Skipping deletion process.');
    }

    for (const cat of catObjects) {
      const existingCat = await Cat.findOne({ href: cat.href });

      if (!existingCat) {
        await cat.save();
        console.log(`New cat '${cat.name}' saved to the database.`);
      } else {
        console.log(`Cat '${cat.name}' is already in the database.`);
      }
    }
  } catch (error) {
    console.error('Error saving cats to the database:', error);
  }
}
