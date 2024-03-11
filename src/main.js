import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';
import axios from 'axios';

const galleryContainer = document.querySelector('.gallery');
const loaderContainer = document.getElementById('loader');
const loadMoreBtn = document.getElementById('load-more');
const searchForm = document.getElementById('search-form');
const loadingIndicator = document.getElementById('loading-indicator');

import { apiKey } from './js/pixabay-api';

if (!apiKey) {
  console.error(
    'API key is missing. Please provide the API key in the .env file.'
  );
}

let currentPage = 1;
let currentQuery = '';
let currentImagesCount = 0;

function showLoadMoreBtn(show) {
  loadMoreBtn.style.display = show ? 'block' : 'none';
}

import { toastSuccess, toastError } from './js/render-functions';

let totalHits = 0;

async function searchImages(query, page = 1) {
  const url = `https://pixabay.com/api/?key=${apiKey}&q=${encodeURIComponent(
    query
  )}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}&per_page=15`;
  try {
    const response = await axios.get(url);
    totalHits = response.data.totalHits;
    return response.data.hits;
  } catch (error) {
    console.error('Error fetching images:', error);
    toastError('Failed to fetch images.');
    throw error;
  }
}

async function scrollToNextGroup() {
  const cardHeight = galleryContainer
    .querySelector('.image-card')
    .getBoundingClientRect().height;
  window.scrollBy({
    top: 2 * cardHeight,
    left: 0,
    behavior: 'smooth',
  });
}

searchForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  showLoadMoreBtn(false);
  const query = document.getElementById('query').value.trim();
  if (!query) {
    iziToast.warning({
      title: 'Warning',
      message: 'Please enter a search query.',
    });
    return;
  }
  try {
    loaderContainer.style.display = 'block';
    currentQuery = query;
    currentPage = 1;
    const images = await searchImages(query, currentPage);
    if (images.length > 0) {
      displayImages(images);
      toastSuccess(`Was found: ${images.length} images`);
      initializeLightbox();
      showLoadMoreBtn(true);
    } else {
      galleryContainer.innerHTML = '';
      toastError(
        'Sorry, there are no images matching your search query. Please try again!'
      );
      showLoadMoreBtn(false);
    }
  } finally {
    loaderContainer.style.display = 'none';
  }
});

loadMoreBtn.addEventListener('click', async function () {
  try {
    loaderContainer.style.display = 'block';
    loadingIndicator.style.display = 'block';
    currentPage++;
    const images = await searchImages(currentQuery, currentPage);
    if (images.length > 0) {
      appendImages(images);
      toastSuccess(`Loaded additional ${images.length} images`);
      initializeLightbox();
      if (images.length < 15) {
        toastError(
          'We are sorry, but you have reached the end of search results.'
        );
        showLoadMoreBtn(false);
      }

      scrollToNextGroup();
    } else {
      toastError('No more images to load');
      showLoadMoreBtn(false);
    }
  } catch (error) {
    console.error('Error fetching images:', error);
    toastError('Failed to fetch additional images.');
  } finally {
    loaderContainer.style.display = 'none';
    loadingIndicator.style.display = 'none';
  }
});

function displayImages(images) {
  galleryContainer.innerHTML = '';
  appendImages(images);
}

function appendImages(images) {
  const fragment = document.createDocumentFragment();
  images.forEach(image => {
    const {
      largeImageURL,
      webformatURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    } = image;
    const imageCard = document.createElement('div');
    imageCard.classList.add('image-card');
    imageCard.innerHTML = `
            <a href="${largeImageURL}" data-lightbox="image-set" data-title="${tags}">
                <img src="${webformatURL}" alt="${tags}">
                <div class="info">Likes: ${likes}, Views: ${views}, Comments: ${comments}, Downloads: ${downloads}</div>
            </a>
        `;
    fragment.appendChild(imageCard);
  });
  galleryContainer.appendChild(fragment);

  currentImagesCount += images.length;
}

let lightbox = null;

function initializeLightbox() {
  if (lightbox) {
    lightbox.destroy();
  }
  lightbox = new SimpleLightbox('.gallery a');
}
