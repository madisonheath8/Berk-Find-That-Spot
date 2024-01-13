let videoUrls = [
    'BlackwellGuesser.mov',
    'srlGuesser.mov',
    'bearmarketGuesser.mov',
    'vlsb.mov',
    'unit3night.mov',
    'yalis.mov',
    'statuesbynorthgate.mov',
    'theball.mov',
    'miningcirclebusstop.mov',
    'memorialpool.mov',
    'unit1bamboo.mov',
    'cedinnercourtyard.mov',
    'psr.mov',
    // Add more video URLs as needed
];

let correctLocations = [
    {lat: 37.868030, lng: -122.261205}, // blackwell
    {lat: 37.873856, lng: -122.261154 }, // srl
    {lat: 37.867189, lng: -122.260096 }, // bear market
    {lat: 37.871750, lng: -122.261886 }, // vlsb
    {lat: 37.867025, lng: -122.259708 }, // unit3night
    {lat: 37.874779, lng: -122.258636 }, // yalis
    {lat: 37.874304, lng: -122.260296 }, // statues by north gate 
    {lat: 37.872456, lng: -122.257962 }, // the ball
    {lat: 37.873384, lng: -122.257404 }, // mining circle bus stop
    {lat: 37.873055, lng: -122.260183 }, // memorial pool
    {lat: 37.867712, lng: -122.255283 }, // unit 1 bamboo
    {lat: 37.870487, lng: -122.254528 }, // ced inner courtyard
    {lat: 37.876678, lng: -122.263675 }, // psr

];


let currentRound = 1;
let selectedRounds = 5;
let singleplayerscore = 0;
let singleplayertime = 45;
let indexlst = []
let userLatitude = 0;
let userLongitude = 0;
let confirmguesscalled = 0;

function startSinglePlayer() {
    document.getElementById('welcome-page').style.display = 'none';
    document.getElementById('single-player-menu').style.display = 'block';
}

function startSinglePlayerGame() {
    selectedRounds = parseInt(document.getElementById('rounds').value, 10);
    document.getElementById('current-round').innerText = currentRound;
    document.getElementById('total-rounds').innerText = selectedRounds;

    // Hide the menu and display the game container
    document.getElementById('single-player-menu').style.display = 'none';
    document.getElementById('game-container').style.display = 'block';

    startGame();

    // Start the 45-second countdown
    startCountdown(45);
}

// Function to start the countdown timer
function startCountdown(seconds) {
    let timeRemaining = seconds;

    // Display the initial time
    updateTimerDisplay(timeRemaining);

    // Update the timer every second
    const countdownInterval = setInterval(function() {
        if (confirmguesscalled === 1) {
            clearInterval(countdownInterval);
            return; } // if the confirmGuess function is called, stop timer
        timeRemaining--;
        singleplayertime = timeRemaining
        // Display the updated time
        updateTimerDisplay(timeRemaining);

        // Check if the countdown has reached zero
        if (timeRemaining <= 0) {
            // Stop the countdown
            clearInterval(countdownInterval);
            singleplayertime = 0
            // Activate the confirmGuess function
            confirmGuess();        }
    }, 1000); // Update every 1000ms (1 second)
}

// Function to update the timer display
function updateTimerDisplay(timeRemaining) {
    document.getElementById('timer').innerHTML = `Time Remaining:<br>${timeRemaining} seconds`;
}

let map;
let marker;

function openMap() {
    // Display the map container
    document.getElementById('map-container').style.display = 'block';

    // Remove the existing map and create a new one
    if (map) {
        map.remove();
    }

    // Initialize the map with a new center for each round
    map = L.map('map').setView([37.8713, -122.2591], 15); // Set the initial map view to UC Berkeley

    // Add a tile layer (you can use different tile providers)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Enable click event on the map
    map.on('click', function(e) {
        // Remove the existing marker if it exists
        if (marker) {
            map.removeLayer(marker);
        }

        // Enable the confirm button
        document.getElementById('confirm-guess').style.display = 'block';

        // Add a marker to the clicked location
        marker = L.marker(e.latlng).addTo(map);

        const markerLocation = marker.getLatLng();
        userLatitude = markerLocation.lat;
        userLongitude = markerLocation.lng;
    });
}


function startGame() {

    document.getElementById('singleplayertotalscore').innerText = `Score: ${singleplayerscore}`;

    let randomIndex;
    let selectedVideo;

    // Keep generating a new random index until an unused one is found
    do {
        randomIndex = Math.floor(Math.random() * videoUrls.length);
    } while (indexlst.includes(randomIndex));

    // Add the new index to the list
    indexlst.push(randomIndex);

    // Set the selected video source and play it
    selectedVideo = videoUrls[randomIndex];
    const gameVideo = document.getElementById('game-video');
    gameVideo.src = selectedVideo;

    // Ensure the map is fully initialized before starting the video
    openMap();

    // Play the video after a short delay (adjust as needed)
    setTimeout(function() {
        gameVideo.play();
    }, 500); // Play the video after a 500ms delay

}


function confirmGuess() {
    confirmguesscalled = 1;
    const videoElement = document.getElementById('game-video');
    videoElement.pause();
    document.getElementById('time-taken').innerText = `Time Elapsed: ${45 - singleplayertime} seconds`;
    document.getElementById('roundscore').innerText = `Round Score: ${calculateScore()}`;
    document.getElementById('dist-in-m').innerText = `Distance from Correct Location: ${calculateDist()} meters`;
    document.getElementById('current-round-score').innerText = `Total Score: ${singleplayerscore}`;
    document.getElementById('game-container').style.display = 'none';
    document.getElementById('results-page').style.display = 'block';
    initResultMap()

}

function calculateScore() {
    if (userLatitude === 0 ) {
        return 0;  // Score is zero if the marker location is not set
    }

    const userLocation = {
        lat: userLatitude,
        lng: userLongitude
    };

    const distance = calculateDistanceMath(userLocation, correctLocations[indexlst[indexlst.length - 1]]);
    if (distance > 2000) {
        const score = 0;  // Score is zero if the distance is too large
        return score;
    }
    
    if (distance > 1000) {
        const score =  singleplayertime; 
        singleplayerscore += score
        return score; 
    }

    if (distance > 500) {
        const score = ((1000 - distance) + (singleplayertime) * 2) + 50;
        singleplayerscore += score
        singleplayerscore = singleplayerscore.toFixed(2)
        singleplayerscore = parseFloat(singleplayerscore)
        return score.toFixed(2);
    }

    if (distance < 25) {
        const score =  (100 + (1000 - distance) + (singleplayertime) * 7);
        singleplayerscore += score
        singleplayerscore = singleplayerscore.toFixed(2)
        singleplayerscore = parseFloat(singleplayerscore)
        return score.toFixed(2);
    }
    const score = ((1000 - distance) + (singleplayertime) * 5) + 50;
    singleplayerscore += score
    singleplayerscore = singleplayerscore.toFixed(2)
    singleplayerscore = parseFloat(singleplayerscore)
    return score.toFixed(2);
}

function calculateDist() {
    if (userLatitude === 0 ) {
        return 'N/A';  // Distance is N/A if the marker location is not set
    }

    const userLocation = {
        lat: userLatitude,
        lng: userLongitude
    };

    const distance = calculateDistanceMath(userLocation, correctLocations[indexlst[indexlst.length - 1]]);
    return distance.toFixed(2);
}

function calculateDistanceMath(userLocation, correctLongLat) {
    const lat1 = userLocation.lat;
    const lon1 = userLocation.lng;
    const lat2 = correctLongLat.lat;
    const lon2 = correctLongLat.lng;

    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);  // deg2rad below
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km

    return distance * 1000; // Convert distance to meters
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}


let resultMap;
let correctMarker;
let guessedMarker;

function initResultMap() {
    if (resultMap) {
        resultMap.setView(correctLocations[indexlst[indexlst.length - 1]], 15);
    }

    if (!resultMap) {
        // Display the map container
        document.getElementById('result-map-container').style.display = 'block';
        resultMap = L.map('result-map-container').setView(correctLocations[indexlst[indexlst.length - 1]], 15);

        // Add a title layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors'
        }).addTo(resultMap);
    }

    correctMarker = L.marker(correctLocations[indexlst[indexlst.length - 1]], {
        icon: L.icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        })
    }).addTo(resultMap);

    guessedMarker = L.marker([userLatitude, userLongitude]).addTo(resultMap);
}


function continueToNextRound() {
    if (marker) {
        map.removeLayer(marker);
        marker = null; // Set marker to null after removal
    }
    
    singleplayertime = 45;
    userLatitude = 0;
    userLongitude = 0;
    confirmguesscalled = 0;
    currentRound++;
    document.getElementById('confirm-guess').style.display = 'none';
    resultMap.removeLayer(guessedMarker);
    resultMap.removeLayer(correctMarker);

    if (currentRound > selectedRounds) {
        displayEndingPage()
        return;
    }
    document.getElementById('results-page').style.display = 'none';
    document.getElementById('single-player-menu').style.display = 'block';
    startSinglePlayerGame()
}


function displayEndingPage() {
    // Stop the game-related activities
    const videoElement = document.getElementById('game-video');
    videoElement.pause();
    document.getElementById('results-page').style.display = 'none';
    document.getElementById('ending-page').style.display = 'block';
    document.getElementById('finalscore').innerText = `Final Score: ${singleplayerscore}`;

}



function resetGame() {
    currentRound = 1;
    singleplayerscore = 0;
    singleplayertime = 45;
    indexlst = []
    userLatitude = 0;
    userLongitude = 0;
    confirmguesscalled = 0;
}


function goToHomePage() {
    resetGame()
    document.getElementById('ending-page').style.display = 'none';
    document.getElementById('welcome-page').style.display = 'block';
}
