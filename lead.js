import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAoaag994DMnsosOZ84YG_zJlhhdJXvLdY",
    authDomain: "basics-e3ac0.firebaseapp.com",
    projectId: "basics-e3ac0",
    storageBucket: "basics-e3ac0.appspot.com",
    messagingSenderId: "910815144454",
    appId: "1:910815144454:web:82861f73339afe31a9b187"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const leaderboardRef = collection(db, "Leaderboard");
const usersRef = collection(db, "users");

const difficultyValues = {
    Easy: 1,
    Moderate: 2,
    Hard: 3,
};

//calculating score
function calculateScore(wpm, accuracy, difficulty) {
    const difficultyMultiplier = difficultyValues[difficulty] || 1;
    return wpm * 0.8 + accuracy * 0.4 + difficultyMultiplier * 5;
}

async function fetchTopScores() {
    const usersSnapshot = await getDocs(usersRef);
    const topScores = new Map();

    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const username = userData.username || "Unknown User";
        const city = userData.city || "Unknown City";

        const contestHistoryRef = collection(usersRef, userId, "contestHistory");
        const contestSnapshot = await getDocs(contestHistoryRef);

        contestSnapshot.forEach((contestDoc) => {
            const contestData = contestDoc.data();
            const { wpm, accuracy, difficulty } = contestData;
            const score = calculateScore(wpm, accuracy, difficulty || "Easy");

            // Check if this score is higher than the current top score for this user
            if (!topScores.has(userId) || topScores.get(userId).score < score) {
                topScores.set(userId, {
                    username,
                    city,
                    difficulty: difficulty || "Easy",
                    wpm,
                    accuracy,
                    score,
                });

                // Save top score to `Leaderboard` collection
                const leaderboardDocRef = doc(leaderboardRef, userId);
                setDoc(leaderboardDocRef, {
                    username,
                    city,
                    difficulty: difficulty || "Easy",
                    wpm,
                    accuracy,
                    score,
                }, { merge: true });
            }
        });
    }

    return Array.from(topScores.values());
}

// Populate leaderboard table
async function populateLeaderboard(cityFilter = "all") {
    const table = document.getElementById("leaderboard-data");
    table.innerHTML = "";

    const leaderboardData = await fetchTopScores();

    const filteredData = leaderboardData.filter((entry) => {
        return cityFilter === "all" || entry.city === cityFilter;
    });

    filteredData.sort((a, b) => b.score - a.score);

    filteredData.forEach((entry, index) => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${entry.username}</td>
            <td>${entry.city}</td>
            <td>${entry.difficulty}</td>
            <td>${entry.wpm}</td>
            <td>${entry.accuracy}</td>
            <td>${entry.score.toFixed(2)}</td>
        `;
        table.appendChild(row);
    });
}

function updateCityFilter(cities) {
    const cityFilter = document.getElementById("city-filter");
    cityFilter.innerHTML = `<option value="all">All Cities</option>`;
    cities.forEach((city) => {
        const option = document.createElement("option");
        option.value = city;
        option.textContent = city;
        cityFilter.appendChild(option);
    });
}

async function fetchAndUpdateCities() {
    const usersSnapshot = await getDocs(usersRef);
    const citiesSet = new Set();

    usersSnapshot.forEach((doc) => {
        const userData = doc.data();
        if (userData.city) {
            citiesSet.add(userData.city);
        }
    });

    const sortedCities = Array.from(citiesSet).sort();
    updateCityFilter(sortedCities);
}
function filterByCity() {
    const selectedCity = document.getElementById("city-filter").value;
    populateLeaderboard(selectedCity);
}


window.onload = () => {
    fetchAndUpdateCities(); 
    populateLeaderboard(); 
    document.getElementById("city-filter").addEventListener("change", filterByCity);
};
