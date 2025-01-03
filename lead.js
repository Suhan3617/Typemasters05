// import { 
//     initializeApp 
// } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
// import { 
//     getFirestore, 
//     collection, 
//     getDocs, 
//     doc, 
//     getDoc, 
//     query, 
//     where, 
//     setDoc 
// } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// const firebaseConfig = {
//     apiKey: "AIzaSyAoaag994DMnsosOZ84YG_zJlhhdjXvLdY",
//     authDomain: "basics-e3ac0.firebaseapp.com",
//     projectId: "basics-e3ac0",
//     storageBucket: "basics-e3ac0.appspot.com",
//     messagingSenderId: "910815144454",
//     appId: "1:910815144454:web:82861f73339afe31a9b187"
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// const leaderboardRef = collection(db, "leaderboard");
// const usersRef = collection(db, "users");

// const difficultyValues = {
//     Easy: 1,
//     Moderate: 2,
//     Hard: 3,
// };

// // Function to calculate score
// function calculateScore(wpm, accuracy, difficulty) {
//     const difficultyMultiplier = difficultyValues[difficulty] || 1;
//     return wpm * 0.8 + accuracy * 0.4 + difficultyMultiplier * 5;
// }

// // Fetch contest data from `contestHistory` subcollection
// async function fetchContestData() {
//     const usersSnapshot = await getDocs(usersRef);
//     const leaderboardData = [];

//     for (const userDoc of usersSnapshot.docs) {
//         const userId = userDoc.id;
//         const userData = userDoc.data();
//         const username = userData.username || "Unknown User"; // Get the username field
//         const city = userData.city || "Unknown City";

//         const contestHistoryRef = collection(usersRef, userId, "contestHistory");
//         const contestSnapshot = await getDocs(contestHistoryRef);

//         contestSnapshot.forEach((contestDoc) => {
//             const contestData = contestDoc.data();
//             const { wpm, accuracy, difficulty } = contestData;

//             const score = calculateScore(wpm, accuracy, difficulty || "Easy");
//             leaderboardData.push({
//                 username,
//                 city,
//                 difficulty: difficulty || "Easy",
//                 wpm,
//                 accuracy,
//                 score,
//             });

//             // Save data to `leaderboard` collection
//             const leaderboardDocRef = doc(leaderboardRef, `${userId}-${contestDoc.id}`);
//             setDoc(leaderboardDocRef, {
//                 username,
//                 city,
//                 difficulty: difficulty || "Easy",
//                 wpm,
//                 accuracy,
//                 score,
//             }, { merge: true });
//         });
//     }

//     return leaderboardData;
// }

// // Populate leaderboard table
// async function populateLeaderboard(cityFilter = "all") {
//     const table = document.getElementById("leaderboard-data");
//     table.innerHTML = "";

//     const leaderboardData = await fetchContestData();

//     const filteredData = leaderboardData.filter((entry) => {
//         return cityFilter === "all" || entry.city === cityFilter;
//     });

//     filteredData.sort((a, b) => b.score - a.score);

//     filteredData.forEach((entry, index) => {
//         const row = document.createElement("tr");
//         row.innerHTML = `
//             <td>${index + 1}</td>
//             <td>${entry.username}</td>
//             <td>${entry.city}</td>
//             <td>${entry.difficulty}</td>
//             <td>${entry.wpm}</td>
//             <td>${entry.accuracy}</td>
//             <td>${entry.score.toFixed(2)}</td>
//         `;
//         table.appendChild(row);
//     });
// }

// // Function to update city dropdown
// function updateCityFilter(cities) {
//     const cityFilter = document.getElementById("city-filter");
//     cityFilter.innerHTML = `<option value="all">All Cities</option>`;
//     cities.forEach((city) => {
//         const option = document.createElement("option");
//         option.value = city;
//         option.textContent = city;
//         cityFilter.appendChild(option);
//     });
// }

// // Fetch and update cities from users collection
// async function fetchAndUpdateCities() {
//     const usersSnapshot = await getDocs(usersRef);
//     const citiesSet = new Set();

//     usersSnapshot.forEach((doc) => {
//         const userData = doc.data();
//         if (userData.city) {
//             citiesSet.add(userData.city);
//         }
//     });

//     const sortedCities = Array.from(citiesSet).sort();
//     updateCityFilter(sortedCities);
// }

// // Filter leaderboard by city
// function filterByCity() {
//     const selectedCity = document.getElementById("city-filter").value;
//     populateLeaderboard(selectedCity);
// }

// // Initialize everything on page load
// window.onload = () => {
//     fetchAndUpdateCities(); // Fetch cities for dropdown
//     populateLeaderboard();  // Populate the leaderboard
//     document.getElementById("city-filter").addEventListener("change", filterByCity);
// };
import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    getDoc, 
    query, 
    where, 
    setDoc 
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAoaag994DMnsosOZ84YG_zJlhhdjXvLdY",
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

// Function to calculate score
function calculateScore(wpm, accuracy, difficulty) {
    const difficultyMultiplier = difficultyValues[difficulty] || 1;
    return wpm * 0.8 + accuracy * 0.4 + difficultyMultiplier * 5;
}

// Fetch contest data from `contestHistory` subcollection
async function fetchContestData() {
    const usersSnapshot = await getDocs(usersRef);
    const leaderboardData = [];

    for (const userDoc of usersSnapshot.docs) {
        const userId = userDoc.id;
        const userData = userDoc.data();
        const username = userData.username || "Unknown User"; // Get the username field
        const city = userData.city || "Unknown City";

        const contestHistoryRef = collection(usersRef, userId, "contestHistory");
        const contestSnapshot = await getDocs(contestHistoryRef);

        contestSnapshot.forEach((contestDoc) => {
            const contestData = contestDoc.data();
            const { wpm, accuracy, difficulty } = contestData;

            const score = calculateScore(wpm, accuracy, difficulty || "Easy");
            leaderboardData.push({
                username,
                city,
                difficulty: difficulty || "Easy",
                wpm,
                accuracy,
                score,
            });

            // Save data to `Leaderboard` collection
            const leaderboardDocRef = doc(leaderboardRef, `${userId}-${contestDoc.id}`);
            setDoc(leaderboardDocRef, {
                username,
                city,
                difficulty: difficulty || "Easy",
                wpm,
                accuracy,
                score,
            }, { merge: true });
        });
    }

    return leaderboardData;
}

// Populate leaderboard table
async function populateLeaderboard(cityFilter = "all") {
    const table = document.getElementById("leaderboard-data");
    table.innerHTML = "";

    const leaderboardData = await fetchContestData();

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

// Function to update city dropdown
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

// Fetch and update cities from users collection
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

// Filter leaderboard by city
function filterByCity() {
    const selectedCity = document.getElementById("city-filter").value;
    populateLeaderboard(selectedCity);
}

// Initialize everything on page load
window.onload = () => {
    fetchAndUpdateCities(); // Fetch cities for dropdown
    populateLeaderboard();  // Populate the leaderboard
    document.getElementById("city-filter").addEventListener("change", filterByCity);
};
