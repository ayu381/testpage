const api = 'https://www.randyconnolly.com/funwebdev/3rd/api/music/songs-nested.php';

// JSON parsing for each file given
const artists = JSON.parse(artistContent);
const genres = JSON.parse(genreContent);

// Variables for forms
const songSearch = document.querySelector('#song-search');
const artistSelect = document.querySelector('#artist-select');
const genreSelect = document.querySelector('#genre-select');

// Variables for radio buttons
const titleOption = document.querySelector('#title-option');
const artistOption = document.querySelector('#artist-option');
const genreOption = document.querySelector('#genre-option');

// Initially disable artist and genre select forms before using their respective radio buttons
artistSelect.disabled = true;
genreSelect.disabled = true;

// Event listeners for radio buttons
titleOption.addEventListener('change', () => handleRadioChange(songSearch, artistSelect, genreSelect));
artistOption.addEventListener('change', () => handleRadioChange(artistSelect, songSearch, genreSelect));
genreOption.addEventListener('change', () => handleRadioChange(genreSelect, songSearch, artistSelect));

// Set which radio buttons are active
function handleRadioChange(selected, disabled1, disabled2) {
    selected.disabled = false;
    disabled1.disabled = true;
    disabled2.disabled = true;
}

// Define originalData as an empty array initially
let originalData = [];

// Function to populate rows with song data
function songDisplay() {
    // Check if data is in local storage
    const storedData = localStorage.getItem('songData');
    if (storedData) {
        // Parse stored data
        const localData = JSON.parse(storedData);

        // Sort
        const sortedLocalData = sortSongs(localData);
        displaySongs(sortedLocalData);

        // Update originalData with the sorted data
        originalData = sortedLocalData;
        console.log("Data is in localstorage");
    } else {
        fetch(api)
            .then(response => response.json())
            .then(data => {
                // Sort
                const sortedApiData = sortSongs(data);
                displaySongs(sortedApiData);

                // Save data to local storage
                localStorage.setItem('songData', JSON.stringify(data));

                // Update originalData with the sorted data
                originalData = sortedApiData;
            })
            .catch(error => console.error('Error fetching data:', error));
    }
}

// Function to display filtered songs
function displayFilteredSongs(filteredSongs) {
    displaySongs(filteredSongs);
}

// Create rows and append cells
function displaySongs(songsToDisplay) {
    const tableBody = document.querySelector("#search-results tbody");

    // Clear existing rows
    tableBody.textContent = '';

    // Iterate through each song and create a new row in the table
    songsToDisplay.forEach((song) => {
        const row = document.createElement("tr");

        // Append cells
        appendCreateCells(row, song);

        // Add button cell
        const addToPlaylistCell = document.createElement("td");
        const addToPlaylistButton = document.createElement("button");
        addToPlaylistButton.textContent = "Add";
        addToPlaylistButton.addEventListener("click", function () {
            addToPlaylist(song); 
        });
        addToPlaylistCell.appendChild(addToPlaylistButton);
        row.appendChild(addToPlaylistCell);

        // Add click event for each cell in the row (excluding the "Add" button cell)
        row.querySelectorAll("td:not(:last-child)").forEach((cell) => {
            cell.addEventListener("click", () => rowClicked(song, songsToDisplay));
        });

        tableBody.appendChild(row);
    });
}

// Creates all the rows of each category
function appendCreateCells(row, song) {
    row.appendChild(createCell(song.title));
    row.appendChild(createCell(song.artist.name));
    row.appendChild(createCell(song.year));
    row.appendChild(createCell(song.genre.name));
    row.appendChild(createCell(song.details.popularity));
}

// Function to create cell for each row - then appended above
function createCell(value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    return cell;
}

// Artist select options function
function artistOptions() {
    const artistSelect = document.querySelector("#artist-select");

    // Create an option for each artist and add it to the select element
    artists.forEach((artist) => {
        const option = document.createElement("option");
        option.value = artist.name;
        option.textContent = artist.name;
        artistSelect.appendChild(option);
    });

    // Event listener for changes in the artist dropdown
    artistSelect.addEventListener('change', function () {
        filterSongs();
    });
}

// Genre select options function
function genreOptions() {
    const genreSelect = document.querySelector("#genre-select");

    // Create an option for each genre and add it to the select element
    genres.forEach((genre) => {
        const option = document.createElement("option");
        option.value = genre.name;
        option.textContent = genre.name;
        genreSelect.appendChild(option);
    });

    // Event listener for changes in the genre dropdown
    genreSelect.addEventListener('change', filterSongs);
}

// Event listeners for forms
document.querySelector("#artist-select").addEventListener('change', filterSongs);
document.querySelector("#genre-select").addEventListener('change', filterSongs);
document.querySelector("#search-button").addEventListener("click", filterSongs);

// Function to filter songs based on selected artist, genre, and title
function filterSongs() {
    const selectedArtist = document.querySelector("#artist-select").value;
    const selectedGenre = document.querySelector("#genre-select").value;
    const typedTitle = document.querySelector("#song-search").value.toLowerCase();

    // Retrieve data from local storage or API
    const storedData = localStorage.getItem('songData');
    const songs = storedData ? JSON.parse(storedData) : [];

    let sortedSongs = sortSongs(songs, 'title', sortTitleOrder);

    // Adjust the sorting for the artist based on the current order
    if (sortArtistOrder === 'desc') {
        sortedSongs = sortSongs(sortedSongs, 'artist', 'asc');
    }

    if (sortGenreOrder === 'desc') {
        sortedSongs = sortSongs(sortedSongs, 'genre', 'asc');
    }

    if (sortYearOrder === 'desc') {
        sortedSongs = sortSongs(sortedSongs, 'year', 'asc');
    }

    if (sortPopularityOrder === 'desc') {
        sortedSongs = sortSongs(sortedSongs, 'popularity', 'asc');
    } 

    const filteredSongs = sortedSongs.filter(song =>
        (!selectedArtist || song.artist.name === selectedArtist) &&
        (!selectedGenre || song.genre.name === selectedGenre) &&
        (!typedTitle || song.title.toLowerCase().startsWith(typedTitle))
    );

    displayFilteredSongs(filteredSongs);
}

// Retrieve header ids
const titleTh = document.querySelector("#title-th");
const artistTh = document.querySelector("#artist-th");
const yearTh = document.querySelector("#year-th");
const genreTh = document.querySelector("#genre-th");
const popularityTh = document.querySelector("#popularity-th");

// Global variables for ordering
let sortTitleOrder = 'asc';
let sortArtistOrder = 'asc';
let sortYearOrder = 'asc';
let sortGenreOrder = 'asc';
let sortPopularityOrder = 'asc';

// Sorting function for songs
function sortSongs(songsSorted, sortBy, sortOrder) {
    return songsSorted.sort((a, b) => {
        const valueA = getValue(a, sortBy);
        const valueB = getValue(b, sortBy);

        if (sortBy === 'artist') {
            // For artist sorting, consider both artist and title
            const artistComparison = valueA.localeCompare(valueB);
            if (sortOrder === 'asc') {
                return artistComparison === 0 ? a.title.localeCompare(b.title) : artistComparison;
            } else {
                return artistComparison === 0 ? b.title.localeCompare(a.title) : -artistComparison;
            }
        } else if (sortBy === 'year') {
            // Use parseInt to convert years to numbers for numerical comparison
            return sortOrder === 'asc' ? parseInt(valueA) - parseInt(valueB) : parseInt(valueB) - parseInt(valueA);
        } else if (sortBy === 'genre') {
            // For genre sorting, consider both genre and title
            const genreComparison = valueA.localeCompare(valueB);
            if (sortOrder === 'asc') {
                return genreComparison === 0 ? a.title.localeCompare(b.title) : genreComparison;
            } else {
                return genreComparison === 0 ? b.title.localeCompare(a.title) : -genreComparison;
            }
        } else if (sortBy === 'popularity'){
            return sortOrder === 'asc' ? parseInt(valueA) - parseInt(valueB) : parseInt(valueB) - parseInt(valueA);
        }
        // Use localeCompare for string comparison
        return sortOrder === 'asc' ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA);
    });
}

function getValue(song, sortBy) {
    if (sortBy === 'title') {
        return song.title ? song.title.toUpperCase() : '';
    } else if (sortBy === 'artist') {
        // Change to return the actual artist name (not uppercase)
        return song.artist && song.artist.name ? song.artist.name : '';
    } else if (sortBy === 'genre') {
        return song.genre && song.genre.name ? song.genre.name.toUpperCase() : '';
    } else if (sortBy === 'year') {
        return song.year ? song.year.toString() : '';
    } else if (sortBy === 'popularity') {
        return song.details && song.details.popularity ? song.details.popularity.toString() : '';
    }

    // Start page with data
    return '';
}

// Function for toggling sorts
function toggleSortOrder(sortBy) {
    if (sortBy === 'title') {
        sortTitleOrder = sortTitleOrder === 'asc' ? 'desc' : 'asc';
        sortArtistOrder = 'asc';
        sortYearOrder = 'asc';
        sortGenreOrder = 'asc';
        sortPopularityOrder = 'asc';
    } else if (sortBy === 'artist') {
        sortArtistOrder = sortArtistOrder === 'asc' ? 'desc' : 'asc';
        sortTitleOrder = 'asc';
        sortYearOrder = 'asc'; 
        sortGenreOrder = 'asc';
        sortPopularityOrder = 'asc';
    } else if (sortBy === 'year') {
        sortYearOrder = sortYearOrder === 'asc' ? 'desc' : 'asc';
        sortTitleOrder = 'asc';
        sortArtistOrder = 'asc'; 
        sortGenreOrder = 'asc';
        sortPopularityOrder = 'asc';
    } else if (sortBy === 'genre') {
        sortGenreOrder = sortGenreOrder === 'asc' ? 'desc' : 'asc';
        sortTitleOrder = 'asc';
        sortArtistOrder = 'asc'; 
        sortYearOrder = 'asc';
        sortPopularityOrder = 'asc';
    } else if (sortBy === 'popularity') {
        sortPopularityOrder = sortPopularityOrder === 'asc' ? 'desc' : 'asc';
        sortTitleOrder = 'asc';
        sortArtistOrder = 'asc'; 
        sortYearOrder = 'asc';
        sortGenreOrder = 'asc';
    }
}

// Click event listeners for headers
titleTh.addEventListener('click', function () {
    toggleSortOrder('title');
    updateSortIndicator(titleTh, sortTitleOrder); 
    filterSongs();
});

artistTh.addEventListener('click', function () {
    toggleSortOrder('artist');
    filterSongs();
    updateSortIndicator(artistTh, sortArtistOrder);
});

yearTh.addEventListener('click', function () {
    toggleSortOrder('year'); 
    filterSongs(); 
    updateSortIndicator(yearTh, sortYearOrder);
});

genreTh.addEventListener('click', function () {
    toggleSortOrder('genre'); 
    filterSongs(); 
    updateSortIndicator(genreTh, sortGenreOrder);
});

popularityTh.addEventListener('click', function () {
    toggleSortOrder('popularity'); 
    filterSongs(); 
    updateSortIndicator(popularityTh, sortPopularityOrder);
});

// Event listening for clearing table data
document.querySelector("#clear-button").addEventListener("click", clearFormAndTable);

function clearFormAndTable() {
    // Clear text input in search form
    songSearch.value = '';

    // Reset radio buttons to default
    titleOption.checked = true;
    artistOption.checked = false;
    genreOption.checked = false;

    // Disable and reset select elements
    artistSelect.disabled = true;
    genreSelect.disabled = true;
    artistSelect.selectedIndex = 0;
    genreSelect.selectedIndex = 0;

    // Reset table sort
    sortTitleOrder = 'asc';
    sortArtistOrder = 'asc';
    sortYearOrder = 'asc';
    sortGenreOrder = 'asc';
    sortPopularityOrder = 'asc';

    // Call filterSongs to refresh the displayed data with the originalData
    filterSongs();

    // Reset arrow position
    updateSortIndicator(titleTh, sortTitleOrder);
}

// Function for indicator arrows
function updateSortIndicator(header, sortOrder) {
    // Remove existing sort classes
    titleTh.classList.remove('asc', 'desc');
    artistTh.classList.remove('asc', 'desc');
    yearTh.classList.remove('asc', 'desc');
    genreTh.classList.remove('asc', 'desc');
    popularityTh.classList.remove('asc', 'desc');

    // Add arrow to current sort class
    header.classList.add(sortOrder);
}

document.addEventListener('DOMContentLoaded', function() {
// Call all needed functions when window is loaded

    // Load select form options
    artistOptions();
    genreOptions();

    // Load the songs and sort them by title
    songDisplay();
    filterSongs();

    // Load arrow for title header
    updateSortIndicator(titleTh, sortTitleOrder);

});