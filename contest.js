
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import {
    getFirestore,
    addDoc,
    collection
} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAoaag994DMnsosOZ84YG_zJlhhdjXvLdY",
    authDomain: "basics-e3ac0.firebaseapp.com",
    projectId: "basics-e3ac0",
    storageBucket: "basics-e3ac0.firebasefirestorage.app",
    messagingSenderId: "910815144454",
    appId: "1:910815144454:web:82861f73339afe31a9b187"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let timer = 0;
let timeremaining = 0;
let generatedtext = "";
let typedtext = "";

// Predefined texts
const predefinedTexts = {
    easy: {
        30: "The sun rises, casting its golden light across the tranquil morning landscape. A brief moment to breathe and savor the start of a peaceful day.",
        60: "The gentle rustling of leaves and the chirping of birds create a symphony of nature. A minute spent in harmony with the simple joys of the world around you. As the light filters through the trees, you feel a sense of peace wash over you. Every breath is a reminder of the quiet beauty that exists in the world.",
        120: "As the clouds drift lazily across the sky, time slows down. Two minutes of quiet reflection allow the mind to wander, painting vivid images of serenity and calm. The gentle wind carries the scent of blooming flowers, and the sun’s warmth envelops you. In these two minutes, you reconnect with nature, finding a deeper sense of tranquility in the vastness of the world around you. The world seems to pause, allowing you to savor every detail—the soft murmur of the breeze, the rustling of leaves, the warmth of the sun, and the beauty of a moment unhurried by time.",
    },
    moderate: {
        30: "A swift breeze carries the scent of blooming flowers, a fleeting reminder of life's fleeting beauty. Thirty seconds to pause and appreciate the world’s subtle wonders.",
        60: "The bustling city hums with life as footsteps echo on the cobblestone streets. A minute immersed in the rhythm of the world’s ever-turning gears. The streetlights flicker, casting a soft glow on the busy faces that pass by. Amidst the noise, there are moments of connection, fleeting yet meaningful, like the smile of a stranger or the laughter of children in the distance.",
        120: "Under the glow of the streetlights, stories unfold—strangers passing, dreams chasing, moments intertwining. Two minutes to glimpse the interconnected tapestry of countless lives. Each individual carries a piece of the larger puzzle, their paths crossing for a reason. The city pulses with energy, its heartbeat felt in the vibrations of every step, every interaction, every fleeting encounter. The dance of life continues, uninterrupted and ever-changing. In the quiet moments between the rush, you can feel the pulse of humanity—a shared sense of purpose that ties us all together, even when we don’t realize it.",
    },
    hard: {
        30: "The deep forest holds secrets, its dense canopy filtering sunlight into fragmented beams. Thirty seconds of exploring the mysterious whispers of nature's hidden depths.",
        60: "Mountains loom in the distance, their rugged peaks daring adventurers to climb. A minute spent conquering the challenges of imagination and the spirit of exploration. The winds howl through the valleys, and the earth beneath your feet seems to hum with ancient energy. The journey up is arduous, but the promise of discovery keeps you moving forward, each step taking you closer to the summit.",
        120: "Waves crash against the rocky shore as the horizon stretches endlessly. Two minutes immersed in the untamed beauty of the sea, where dreams and reality merge with every tide. The sound of the ocean’s roar fills the air, its power both terrifying and awe-inspiring. As the waves retreat, they leave behind treasures—smooth stones, seashells, and the scent of salt in the air. The vastness of the sea is both humbling and exhilarating, as it mirrors the depths of human emotion and the endless journey toward discovery. Every moment spent by the shore is a reminder of nature’s overwhelming power and the boundless potential within ourselves to explore the unknown, both in the world and within our hearts.",
    }
};

// Function to fetch text based on difficulty and time
function fetchGeneratedText(difficulty, time) {
    return predefinedTexts[difficulty][time] || "Default text for typing test.";
}

document.getElementById("startcontest").addEventListener("click", () => {
    const difficulty = document.getElementById("difficulty").value;
    const time = parseInt(document.getElementById("time").value);

    // Disable the start contest button
    const startButton = document.getElementById("startcontest");
    startButton.disabled = true;

    // Generate text from predefined options
    generatedtext = fetchGeneratedText(difficulty, time);
    const generatedTextElement = document.getElementById("textgenerated");
    if (generatedTextElement) {
        // Update text and add styles to make it unselectable and uncopyable
        generatedTextElement.innerHTML = generatedtext;
        generatedTextElement.style.userSelect = "none"; // Prevent text selection
        generatedTextElement.style.webkitUserSelect = "none";
        generatedTextElement.style.MozUserSelect = "none";
        generatedTextElement.style.pointerEvents = "none"; // Disable copying
    } else {
        console.error("Element with ID 'textgenerated' not found.");
    }

    // Display the remaining time
    timeremaining = time;
    document.querySelector(".timer").innerHTML = timeremaining;
    document.getElementById("typing-area").disabled = false;
    document.getElementById("typing-area").value = "";

    // Countdown starts here
    clearInterval(timer);
    timer = setInterval(() => {
        timeremaining--;
        document.querySelector(".timer").innerHTML = timeremaining;

        if (timeremaining === 0) {
            clearInterval(timer);
            document.getElementById("typing-area").disabled = true;
            calculateResults();
        }
    }, 1000);
});


//calculation of results and creation of pie chart
async function calculateResults() {
    typedtext = document.getElementById("typing-area").value.trim();
    const generatedwords = generatedtext.split(" ");
    const typedwords = typedtext.split(" ");

    const charactersTyped = typedtext.length;
    const timeInMinutes = parseInt(document.getElementById("time").value) / 60;
    const difficulty = document.getElementById("difficulty").value;

    const wpm = Math.round((charactersTyped / 5) / timeInMinutes);

    let correcttypedwords = 0;
    const missedwords = [];
    const incorrectwords = [];

    generatedwords.forEach((word, index) => {
        if (typedwords[index] === word) {
            correcttypedwords++;
        } else {
            missedwords.push(word);
            if (typedwords[index]) {
                incorrectwords.push(typedwords[index]);
            }
        }
    });

    const accuracy = Math.round((correcttypedwords / generatedwords.length) * 100);
    const difficultylevelvalues = {
                easy: 1,
                moderate: 2,
                hard: 3,
            };
    function formulaforscore(wpm, accuracy, difficulty) {
        const difficultyvalues = difficultylevelvalues[difficulty] || 1;
        return wpm * 0.8 + accuracy * 0.4 + difficultyvalues * 10;
    }
    const score = formulaforscore(wpm, accuracy, difficulty || "easy");

    document.getElementById("wpm").innerHTML = wpm;
    document.getElementById("accuracy").innerHTML = accuracy;
    document.getElementById("difficulty-display").innerHTML = `${difficulty}`;
    document.getElementById("duration-display").innerHTML = `${timeInMinutes * 60}`;
    document.getElementById("score").innerHTML = `${score}`;

    const missedwordslist = document.getElementById("missedwordslist");
    missedwordslist.innerHTML = "";
    missedwords.forEach((word) => {
        const list = document.createElement("li");
        list.innerHTML = word;
        missedwordslist.appendChild(list);
    });

    const incorrectwordslist = document.getElementById("incorrectwordslist");
    incorrectwordslist.innerHTML = "";
    incorrectwords.forEach((word) => {
        const list = document.createElement("li");
        list.innerHTML = word;
        incorrectwordslist.appendChild(list);
    });

    document.getElementById("resultscontainer").style.display = "block";

    // Create the pie chart
    const ctx = document.getElementById("resultsChart").getContext("2d");
    new Chart(ctx, {
        type: "pie",
        data: {
            labels: ["Correct Words", "Incorrect Words", "Missed Words"],
            datasets: [{
                label: "Typing Results",
                data: [correcttypedwords, incorrectwords.length, missedwords.length],
                backgroundColor: ["#4caf50", "#f44336", "#ff9800"],
            }],
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: "top",
                },
                title: {
                    display: true,
                    text: "Typing Results Breakdown",
                },
            },
        },
    });

    await saveresults(wpm, accuracy, timeInMinutes * 60, document.getElementById("difficulty").value);
}

// Function for saving results to Firestore
async function saveresults(wpm, accuracy, time, difficulty) {
    try {
        const user = auth.currentUser;
        if (!user) {
            console.error("User not logged in.");
            return;
        }

        const contestRef = collection(db, `users/${user.uid}/contestHistory`);
        await addDoc(contestRef, {
            timestamp: new Date(),
            wpm: wpm,
            accuracy: accuracy,
            time: time,
            difficulty: difficulty || "N/A",
        });
        console.log("Contest result saved successfully.");
    } catch (error) {
        console.error("Error saving contest result:", error.message);
    }
}

document.querySelector(".closeresults").addEventListener("click", () => {
    document.getElementById("resultscontainer").style.display = "none";
});
// Close results pop-up and re-enable the start button
document.querySelector(".closeresults").addEventListener("click", () => {
    document.getElementById("resultscontainer").style.display = "none";
    document.getElementById("startcontest").disabled = false;
    window.location.href = "contest.html"
});

