// Consts for views and buttons
const removeAllButton = document.querySelector("#remove-all-button");
const searchSongsView = document.querySelector("#search-songs-view");
const playlistView = document.querySelector("#playlist-view");

//Make playlist view hidden initially
playlistView.style.display = "none";

// Event listeners for Playlist and Remove All buttons
playlistButton.addEventListener("click", toggleViews);
removeAllButton.addEventListener("click", removeAllFromPlaylist);

// Playlist data
let playlistData = [];

// Toggle between Search Songs and Playlist Views
function toggleViews() {
    if (searchSongsView.style.display !== "none") {
        showPlaylistView();
    } else {
        showSearchSongsView();
    }
}

// Show Playlist View and update button text
function showPlaylistView() {
    searchSongsView.style.display = "none";
    playlistView.style.display = "block";
    playlistButton.textContent = "Close Playlist";
}

// Show Search Songs View and update button text
function showSearchSongsView() {
    searchSongsView.style.display = "block";
    playlistView.style.display = "none";
    playlistButton.textContent = "Playlist";
}

// Add a song to playlist
function addToPlaylist(song) {
    const isDuplicate = playlistData.some((item) => item.song_id === song.song_id);
    
    if (!isDuplicate) {
        playlistData.push(song);
        updatePlaylistView();
        displayPopUp(`Song "${song.title}" by ${song.artist.name} added to the playlist.`);
    } else {
        displayPopUp(`Song "${song.title}" by ${song.artist.name} is already in the playlist.`);
    }
}

//Display a pop-up notification
function displayPopUp(msg) {
    const notificationPanel = document.createElement("div");
    notificationPanel.className = "notification";
    notificationPanel.textContent = msg;

    // Append the notification panel to the body
    document.body.appendChild(notificationPanel);

    // Sets duration for notification 3 secnods
    setTimeout(() => {
        document.body.removeChild(notificationPanel);
    }, 3000);
}

// Update displayed playlist and summary
function updatePlaylistView() {
    const playlistTableBody = document.querySelector("#playlist-view tbody");
    playlistTableBody.textContent = '';

    // Iterate through each song and create a new row in the table
    playlistData.forEach((song) => {
        const row = document.createElement("tr");
        appendCreateCells(row, song);
        appendRemoveButton(row, song.song_id);
        playlistTableBody.appendChild(row);
        row.addEventListener("click", () => rowClicked(song, playlistData));
    });

    updatePlaylistSummary();
}

// Append remove button to a table row
function appendRemoveButton(row, songId) {
    const removeButtonCell = document.createElement("td");
    const removeButton = document.createElement("button");
    removeButton.textContent = "Remove";

    // Add a click event listener to remove button
    removeButton.addEventListener("click", (event) => {
        // Prevent click event from propagating to row click event
        event.stopPropagation();
        // Call removeFromPlaylist function
        removeFromPlaylist(songId);
    });

    removeButtonCell.appendChild(removeButton);
    row.appendChild(removeButtonCell);
}

// Update playlist song count and popularity average info
function updatePlaylistSummary() {
    const playlistCount = document.querySelector("#playlist-count");
    const playlistAverage = document.querySelector("#playlist-average");

    // Calculate count and average
    const count = playlistData.length;
    const average = calculateAveragePopularity();

    // Display count and average 
    playlistCount.textContent = count;
    playlistAverage.textContent = average;
}

// Calculate average popularity of songs in playlist
function calculateAveragePopularity() {
    if (playlistData.length === 0) {
        return 0;
    }

    const totalPopularity = playlistData.reduce((sum, song) => sum + song.details.popularity, 0);
    return (totalPopularity / playlistData.length).toFixed(2); 
}

// Remove a song from playlist
function removeFromPlaylist(songId) {
    // Find index of song in playlistData array
    const index = playlistData.findIndex((song) => song.song_id === songId);

    // Remove song from playlistData array
    if (index !== -1) {
        const removedSong = playlistData.splice(index, 1)[0]; // Remove and get the removed song
        updatePlaylistView();
        console.log(`Song "${removedSong.title}" by ${removedSong.artist.name} has been removed from the playlist.`);
    }
}

// Remove all songs from the playlist
function removeAllFromPlaylist() {
    // Clear playlistData array
    playlistData = [];
    updatePlaylistView();
    console.log("All songs removed from the playlist.");
}