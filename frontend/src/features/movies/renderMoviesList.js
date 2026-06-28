import moviesData from '../../../data/movies.json';
import openEditor from './openEditor.js';
import { createMovieCard } from '../../components/MovieCard.js';

const listContainer = document.getElementById('movies-grid');

export function renderMoviesList() {
  if (!listContainer) return;

  listContainer.innerHTML = '';

  moviesData.forEach(movie => {
    const posterPath = `/posters/${movie.id}.jpg`;
    const card = createMovieCard(movie, posterPath);

    const img = card.querySelector('.poster-img');
    if (img) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', () => openEditor(movie, posterPath));
    }

    listContainer.appendChild(card);
  });
}

export default renderMoviesList;