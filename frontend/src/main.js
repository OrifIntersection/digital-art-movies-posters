// Imports
import "./style.css";
import renderMoviesList from './movies/renderMoviesList.js';
import closeEditor from './movies/closeEditor.js';

// Back button in editor
const backButton = document.getElementById('back-button');
backButton && backButton.addEventListener('click', closeEditor);

// Launch the app
renderMoviesList();