import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAoaag994DMnsosOZ84YG_zJlhhdjXvLdY",
    authDomain: "basics-e3ac0.firebaseapp.com",
    projectId: "basics-e3ac0",
    storageBucket: "basics-e3ac0.firebasestorage.app",
    messagingSenderId: "910815144454",
    appId: "1:910815144454:web:82861f73339afe31a9b187"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const leaderboardref = collection(db, "leaderboard");
// gonna create a score on basics of accuracy , WPM and difficulty . For that giving values for the difficulty level . 
const difficultylevelvalues = {
    Easy: 1,
    Moderate: 2,
    Hard: 3,
};

// making formula to calculate the score 
function formulaforscore(wpm, accuracy, difficulty) {
    const difficultyvalues = difficultylevelvalues[difficulty] || 1;
    return wpm * 0.8 + accuracy * 0.4 + difficultyvalues * 10; //formula
}
// adding data in leaderboard table 
async function leaderboardtable(cityfilter = "all") {
    const querysnapshot = await getDocs(leaderboardref);

    const table = document.getElementById("leaderboard-data");
    table.innerHTML = "";
    // taking values and then calcuting score 
    const leaderboarddata = [];
    querysnapshot.forEach((doc) => {
        const data = doc.data();

        if (cityfilter === "all" || data.city === cityfilter) {
            const scoreofcontest = formulaforscore(data.wpm, data.accuracy, data.difficulty || "Easy");
            leaderboarddata.push({
                username: data.username,
                city: data.city,
                difficulty: data.difficulty || "Easy",
                wpm: data.wpm,
                accuracy: data.accuracy,
                // profilePic: data.profilePic || "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg",
                score: scoreofcontest,
            });
        }

    });

    // sorting by score in descending order
    leaderboarddata.sort((a, b) => b.score - a.score);

    // populate table 
    leaderboarddata.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
        <td>${index + 1}</td>
        <td>${entry.username}</td>
        <td>${entry.city}</td>
        <td>${entry.difficulty}</td>
        <td>${entry.wpm}</td>
        <td>${entry.accuracy}</td>
        `;
        table.appendChild(row);
    });
}

// populating city options

async function cityfilter() {
    const querysnapshot = await getDocs(leaderboardref);
    // creating a set 
    const city = new Set();
    querysnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.city) {
            city.add(data.city);
        }
    });
    // convert array to an array & also ordering them alphabetically
    const sortedcities = Array.from(city).sort();

    // adding cities to the city options
    const citiesfilter = document.getElementById("city-filter");
    citiesfilter.innerHTML = `<option value="all">All Cities</option>`;
    sortedcities.forEach((city) => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        citiesfilter.appendChild(option);
    });
}

function filterbycity() {
    const selectedcity = document.getElementById("city-filter").value;
    cityfilter(selectedcity);
}

window.onload = async () => {
    await cityfilter();
    await leaderboardtable();
}
