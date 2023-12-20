const puppeteer = require('puppeteer');
const express = require('express');
const fs = require('fs');
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

        fs.writeFileSync('combinedData.json', JSON.stringify(combinedData, null, 2), 'utf-8');
        // Render the index.ejs template with the combined data
        res.render('index', { cardDetails: combinedData });
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
          
    });

    await browser.close();

    return cardDetails;
}

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

