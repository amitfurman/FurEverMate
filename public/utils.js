let favoriteCats = [];
const locationMapping = {
  'north': ['תנו לחיות לחיות צפון','אגודת צער בעלי חיים חיפה'],
  'center': ['SOS הרצליה', 'תנו לחיות לחיות מרכז','כלביית כפר רות','ראשון אוהבת חיות'],
  'hasharon': 'תנו לחיות לחיות שרון',
  'south': 'תנו לחיות לחיות דרום',
};

function toggleHeart(catId) {
  var heartIcon = document.getElementById('heart-' + catId);

  if (heartIcon.classList.contains('fas')) {
    heartIcon.classList.replace('fas', 'far');
    heartIcon.classList.remove('red-heart');
    removeFromFavorites(catId);
  } else {
    heartIcon.classList.replace('far', 'fas');
    heartIcon.classList.add('red-heart');
    addToFavorites(catId);
  }
  saveFavoriteCatsToLocalStorage();
}

async function fetchAndFilterCards() {
  try {
      const response = await fetch('/combinedData');
      const data = await response.json();

      saveFiltersToLocalStorage();
      sortAndFilterCards(data);
  } catch (error) {
      console.error('Error fetching data from server:', error);
  }
}

function sortAndFilterCards(cardDetails) {
    const selectedOptions = getSelectedArea();
    const selectedGender = getSelectedGender();
    const mappedOptions = selectedOptions.flatMap(option => {
    const mappedValue = locationMapping[option];
  
    if (Array.isArray(mappedValue)) {
      return mappedValue;
    } else if (mappedValue) {
      return [mappedValue];
    } else {
      return [];
    }
  });

    const filteredCards = cardDetails.filter(card => {
      const locationMatch = mappedOptions.length === 0 || mappedOptions.includes(card.location);
      const genderMatch = selectedGender.length === 0 ||
                        (selectedGender.includes('female') && selectedGender.includes('male')) ||
                        (selectedGender.includes(card.isMale ? 'male' : 'female') && card.isMale === (selectedGender.includes('male')));

      return locationMatch && genderMatch;
    });

    const totalCatsContainer = document.getElementById('totalCatsContainer');
    
    totalCatsContainer.innerHTML = `<div class="centered-text"><p class="left-aligned">${filteredCards.length} חתולים לאימוץ</p></div>`;
   
    const cardsContainer = document.querySelector('.cats-container');
    cardsContainer.innerHTML = '';

    if (filteredCards.length === 0) {
      const noResultsMessage = document.createElement('div');
      noResultsMessage.classList.add('no-results-message');

      const boldLine = document.createElement('p');
      boldLine.classList.add('bold-line');
      boldLine.textContent = '): לא נמצאו חתולים שעונים על הקריטריונים שביקשת ';

      const regularLine = document.createElement('p');
      regularLine.textContent = 'אנא נסה חיפוש אחר';

      noResultsMessage.appendChild(boldLine);
      noResultsMessage.appendChild(regularLine);
      cardsContainer.appendChild(noResultsMessage);
  } else {
      filteredCards.forEach((card, index) => {
          const cardElement = createCardElement(card, index);
          cardsContainer.appendChild(cardElement);
      });
  }
}

function saveFiltersToLocalStorage() {
  const selectedArea = getSelectedArea();
  const selectedGender = getSelectedGender();
  const filters = {
    selectedArea,
    selectedGender,
  };

  localStorage.setItem('catFilters', JSON.stringify(filters));
}

function loadFiltersFromLocalStorage() {
  const storedFilters = localStorage.getItem('catFilters');

  if (storedFilters) {
    const filters = JSON.parse(storedFilters);

    setCheckboxes('filter-checkbox', filters.selectedArea);
    setCheckboxes('filter-gender-checkbox', filters.selectedGender);
  }
}

function setCheckboxes(className, selectedValues) {
  const checkboxes = document.querySelectorAll(`.${className}`);

  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectedValues.includes(checkbox.value);
  });
}

function getSelectedArea() {
    const checkboxes = Array.from(document.querySelectorAll('.filter-checkbox'));
    const selectedOptions = checkboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

    return selectedOptions;
}

function getSelectedGender() {
  const genderCheckboxes = Array.from(document.querySelectorAll('.filter-gender-checkbox'));
  const selectedGender = genderCheckboxes.filter(checkbox => checkbox.checked).map(checkbox => checkbox.value);

  return selectedGender;
}

function createCardElement(card, index) {
    const cardDiv = document.createElement('div');
    cardDiv.classList.add('cat');

    const cardLink = document.createElement('a');
    cardLink.href = card.href;
    cardLink.target = '_blank';
    cardLink.classList.add('card-link');

    const imgElement = document.createElement('img');
    imgElement.src = card.imgSrc;
    imgElement.alt = '';

    cardLink.appendChild(imgElement);

    const infoDiv = document.createElement('div');
    infoDiv.classList.add('info');

    const locationHeading = document.createElement('h5');
    locationHeading.textContent = card.location;

    const heartDiv = document.createElement('div');
    const heartIcon = document.createElement('i');
    heartIcon.id = `heart-cat${index + 1}`;
    heartIcon.classList.add('far', 'fa-heart');
    heartIcon.onclick = () => toggleHeart(`cat${index + 1}`);
    heartDiv.appendChild(heartIcon);

    const descriptionDiv = document.createElement('div');
    descriptionDiv.classList.add('description');

    const nameHeading = document.createElement('h3');
    nameHeading.textContent = card.name;
    
    const spaceTextNode = document.createTextNode(' ');
    nameHeading.appendChild(spaceTextNode);
    
    const genderIcon = document.createElement('span');
    genderIcon.classList.add(card.isMale ? 'male-sign' : 'female-sign');
    const genderIconClass = card.isMale ? 'fas fa-mars' : 'fas fa-venus';
    genderIcon.innerHTML = `<i class="${genderIconClass}"></i>`;
    
    nameHeading.appendChild(genderIcon);
    
    const descriptionParagraph = document.createElement('p');
    descriptionParagraph.textContent = card.description;

    descriptionDiv.appendChild(nameHeading);
    descriptionDiv.appendChild(descriptionParagraph);

    infoDiv.appendChild(locationHeading);
    infoDiv.appendChild(heartDiv);
    infoDiv.appendChild(descriptionDiv);

    cardDiv.appendChild(cardLink);
    cardDiv.appendChild(infoDiv);

    return cardDiv;
}

function addToFavorites(catId) {
  if (!favoriteCats.includes(catId)) {
    favoriteCats.push(catId);
  }
}

function removeFromFavorites(catId) {
  const index = favoriteCats.indexOf(catId);
  if (index !== -1) {
    favoriteCats.splice(index, 1);
  }
}

function saveFavoriteCatsToLocalStorage() {
  localStorage.setItem('favoriteCats', JSON.stringify(favoriteCats));
}

function loadFavoriteCatsFromLocalStorage() {
  const favoritesJSON = localStorage.getItem('favoriteCats');
  return favoritesJSON ? JSON.parse(favoritesJSON) : [];
}

function updateHeartIcons() {
  favoriteCats.forEach(catId => {
    const heartIcon = document.getElementById('heart-' + catId);
    if (heartIcon) {
      heartIcon.classList.replace('far', 'fas');
      heartIcon.classList.add('red-heart');
    }
  });
}

