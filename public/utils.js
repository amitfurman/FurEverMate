console.log('Utils.js loaded!');


function toggleHeart(catId) {
    console.log('toggleHeart called with catId:', catId);
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