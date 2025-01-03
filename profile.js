import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getFirestore, doc, updateDoc, collection, getDocs, getDoc , arrayUnion } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged , signOut} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";


// Firebase Configuration
const firebaseConfig = {
    apiKey: "AIzaSyAoaag994DMnsosOZ84YG_zJlhhdjXvLdY",
    authDomain: "basics-e3ac0.firebaseapp.com",
    projectId: "basics-e3ac0",
    storageBucket: "basics-e3ac0.firebasestorage.app",
    messagingSenderId: "910815144454",
    appId: "1:910815144454:web:82861f73339afe31a9b187",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

let userId;

// Function to fetch user data
async function fetchUserData() {
    try {
        const userRef = collection(db, "users");
        const snapshot = await getDocs(userRef);

        snapshot.forEach((doc) => {
            if (doc.data().email === auth.currentUser.email) {
                userId = doc.id;
                const data = doc.data();
                document.getElementById("username").innerText = `Username : ${data.username}`;
                document.getElementById("city").innerText = `City : ${data.city}`;
                document.getElementById("email").innerText = `Email : ${data.email}`;
                // Fetch and display profile picture
                showProfilePicture();
                // Fetch and display friends list
                fetchAndDisplayFriends();
            }
        });
    } catch (error) {
        console.error("Error fetching user data:", error.message);
    }
}

// Function to show profile picture
async function showProfilePicture() {
    try {
        const userDocRef = doc(db, "users", userId);
        const docSnapshot = await getDoc(userDocRef);

        if (docSnapshot.exists()) {
            const data = docSnapshot.data();
            const profilePicUrl = data.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg"; // Default image
            document.getElementById("profile-pic").src = profilePicUrl;
        } else {
            document.getElementById("profile-pic").src = "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg"; // Default image
        }
    } catch (error) {
        console.error("Error fetching profile picture:", error.message);
    }
}

// Cloudinary Upload Logic
function uploadProfilePicture() {
    const cloudinaryWidget = cloudinary.createUploadWidget(
        {
            cloudName: "dv2ilpjau",
            uploadPreset: "profile_pics",
        },
        async (error, result) => {
            if (!error && result && result.event === "success") {
                const imageUrl = result.info.secure_url; // Get the uploaded image URL

                // Save image URL to Firestore
                try {
                    const userDocRef = doc(db, "users", userId);
                    await updateDoc(userDocRef, {
                        profilePicture: imageUrl,
                    });

                    // Update the profile picture display
                    document.getElementById("profile-pic").src = imageUrl;
                    alert("Profile picture updated successfully!");
                } catch (err) {
                    console.error("Error updating profile picture:", err.message);
                }
            }
        }
    );

    // Open the widget
    cloudinaryWidget.open();
}

// Update user profile in Firestore
async function updateProfile(newUsername, newCity) {
    if (!userId) {
        console.error("User ID not found. Please ensure the user is authenticated.");
        return;
    }

    const userDocRef = doc(db, "users", userId);

    try {
        await updateDoc(userDocRef, {
            username: newUsername,
            city: newCity,
        });
        alert("Profile updated successfully!");
        fetchUserData(); // Refresh displayed data
        document.getElementById("editprofile").style.display = "none";
    } catch (error) {
        console.error("Error updating profile:", error.message);
    }
}

// Function to fetch and display contest history
async function fetchContestHistory(user) {
    try {
        const contestRef = collection(db, `users/${user.uid}/contestHistory`);
        const contestSnapshot = await getDocs(contestRef);

        let bestWPM = 0, bestAccuracy = 0, contestsPlayed = 0;
        const tableBody = document.getElementById("contesthistorytable").querySelector("tbody");
        tableBody.innerHTML = "";

        contestSnapshot.forEach((doc) => {
            const data = doc.data();
            contestsPlayed++;
            if (data.wpm > bestWPM) bestWPM = data.wpm;
            if (data.accuracy > bestAccuracy) bestAccuracy = data.accuracy;

            const row = document.createElement("tr");
            row.innerHTML = `
            <td>${new Date(data.timestamp.seconds * 1000).toLocaleDateString()}</td>
            <td>${data.difficulty || "N/A"}</td>
            <td>${data.time}</td>
            <td>${data.wpm}</td>
            <td>${data.accuracy}</td>
        `;
            tableBody.appendChild(row);
        });

        document.getElementById("bestwpm").innerText = `Best WPM : ${bestWPM}`;
        document.getElementById("bestaccuracy").innerText = `Best Accuracy : ${bestAccuracy}`;
        document.getElementById("contest-played").innerText = `No. of Contests Played : ${contestsPlayed}`;

        if (contestSnapshot.empty) {
            tableBody.innerHTML = "<tr><td colspan='5'>No contests played yet.</td></tr>";
            document.getElementById("bestwpm").innerText = "Best WPM : N/A";
            document.getElementById("bestaccuracy").innerText = "Best Accuracy : N/A";
            document.getElementById("contest-played").innerText = "No. of Contests Played : 0";
        }
    }catch(error){
        console.error("Error in fetching contest histroy :" , error.message);
    }
}

// Auth state listener to fetch contest history after login
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Set userId when user is authenticated
        fetchUserData();
        // Fetch contest history
        fetchContestHistory(user);
    } else {
        alert("Please log in to view contest history!");
        window.location.href = "login.html";
    }
});

// Upload Image Event
document.getElementById("Upload-Image").addEventListener("click", () => {
    onAuthStateChanged(auth, (user) => {
        if (user) {
            uploadProfilePicture(); // Call the function to open the widget
        } else {
            alert("Please log in to upload a profile picture!");
        }
    });
});

// Edit profile button functionality
document.getElementById("editprofilebtn").addEventListener("click", () => {
    document.getElementById("editprofile").style.display = "block";
});

// Close edit profile modal
document.getElementById("close-edit-container").addEventListener("click", () => {
    document.getElementById("editprofile").style.display = "none";
});

// Save edited profile
document.getElementById("edit-profile").addEventListener("submit", (e) => {
    e.preventDefault();

    const newUsername = document.getElementById("new-username").value.trim();
    const newCity = document.getElementById("new-city").value.trim();

    if (!newUsername || !newCity) {
        alert("Please fill in all the fields!");
        return;
    }

    updateProfile(newUsername, newCity);
});

// Function to search for a friend by username
async function searchFriend() {
    const usernameToSearch = document.getElementById("search").value.trim();
    if (!usernameToSearch) {
        alert("Please enter a username to search.");
        return;
    }

    try {
        const userRef = collection(db, "users");
        const snapshot = await getDocs(userRef);
        let friendFound = false;

        snapshot.forEach((doc) => {
            if (doc.data().username === usernameToSearch) {
                friendFound = true;
                const data = doc.data();
                document.getElementById("result-username").innerText = `Username: ${data.username}`;
                document.getElementById("result-city").innerText = `City: ${data.city}`;
                document.getElementById("search-result").classList.remove("hidden");

                // Display profile picture
                document.getElementById("profile-image").src = data.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg";
                document.getElementById("profile-image").style.display = "block";

                // Set event listener for adding the friend
                document.getElementById("add-friend-btn").onclick = () => addFriend(data.username);
                document.getElementById("view-profile-btn").onclick = () => viewFriendProfile(data.username);
            }
        });

        if (!friendFound) {
            document.getElementById("search-result").classList.add("hidden");
            alert("No user found with that username.");
        }
    } catch (error) {
        console.error("Error searching for friend:", error.message);
    }
}

//function for displaying the friends profile page.
async function showFriendProfile(friendUsername) {
    try {
        const userRef = collection(db, "users");
        const snapshot = await getDocs(userRef);
        let friendDocId = null;
        let friendData = null;

        // Find the friend by username
        snapshot.forEach((doc) => {
            if (doc.data().username === friendUsername) {
                friendDocId = doc.id; // Save the document ID
                friendData = doc.data(); // Save the friend's data
            }
        });

        if (friendData && friendDocId) {
            // Display friend's profile
            document.getElementById("friend-profile-pic").src = friendData.profilePicture || "https://static.vecteezy.com/system/resources/thumbnails/005/544/718/small/profile-icon-design-free-vector.jpg";
            document.getElementById("friend-username").innerText = `Username: ${friendData.username}`;
            document.getElementById("friend-city").innerText = `City: ${friendData.city}`;
            document.getElementById("friend-email").innerText = `Email: ${friendData.email}`;

            // Fetch and display contest history
            const contestRef = collection(db, `users/${friendDocId}/contestHistory`);
            const contestSnapshot = await getDocs(contestRef);
            const contestTableBody = document.getElementById("friend-contest-history").querySelector("tbody");
            contestTableBody.innerHTML = "";

            contestSnapshot.forEach((contest) => {
                const data = contest.data();
                const row = document.createElement("tr");
                row.innerHTML = `
                    <td>${new Date(data.timestamp.seconds * 1000).toLocaleDateString()}</td>
                    <td>${data.difficulty || "N/A"}</td>
                    <td>${data.time}</td>
                    <td>${data.wpm}</td>
                    <td>${data.accuracy}</td>
                `;
                contestTableBody.appendChild(row);
            });

            // Show the modal
            document.getElementById("friend-profile-modal").style.display = "flex";
        } else {
            console.error("Friend not found in the users collection.");
            alert("Invalid Username , No such User exists !")
        }
    } catch (error) {
        console.error("Error fetching friend's profile:", error.message);
    }
}

// Function to fetch and display the friends list
async function fetchAndDisplayFriends() {
    if (!userId) {
        console.error("User ID is not available. Unable to fetch friends list.");
        return;
    }

    try {
        const userRef = doc(db, "users", userId); // Get the reference to the current user's document
        const userSnapshot = await getDoc(userRef); // Fetch the document

        if (userSnapshot.exists()) {
            const data = userSnapshot.data();
            const friendsList = data.friends || []; // Get the list of friends, or an empty array if none

            const friendListElement = document.getElementById("friendslist");
            friendListElement.innerHTML = ""; // Clear the current list before adding new items

            // Add each friend to the UI
            friendsList.forEach((friend) => {
                const friendItem = document.createElement("li");
                friendItem.textContent = friend;
                friendItem.classList.add("friend-item"); // Add a class for styling (optional)
                friendItem.style.cursor = "pointer"; // Make it look clickable
                friendListElement.appendChild(friendItem);

                // Add click event listener to display the friend's profile
                friendItem.addEventListener("click", () => {
                    showFriendProfile(friend); // Call the function to display the friend's profile
                });
            });
        }
    } catch (error) {
        console.error("Error fetching friends list:", error.message);
    }
}

// Add friend to current user's friend list
async function addFriend(friendUsername) {
    try {
        const userRef = doc(db, "users", userId); // Reference to the current user's document
        const userSnapshot = await getDoc(userRef); // Fetch the user's document

        if (userSnapshot.exists()) {
            const userData = userSnapshot.data();
            const friendsList = userData.friends || []; // Get the current friends list or an empty array

            // Check if the friend is already in the list
            if (friendsList.includes(friendUsername)) {
                alert(`${friendUsername} is already in your friend list.`);
                return;
            }

            // Add the friend to the list if not already present
            await updateDoc(userRef, {
                friends: arrayUnion(friendUsername), // Add friend to the array
            });
            alert(`${friendUsername} has been added to your friend list.`);

            // Refresh the friend list UI
            fetchAndDisplayFriends(); // Refresh the friends list
        } else {
            console.error("User document does not exist.");
        }
    } catch (error) {
        console.error("Error adding friend:", error.message);
    }
}

// Search for a friend by username
document.getElementById("searchbtn").addEventListener("click", () => {
    const friendUsername = document.getElementById("search").value.trim();
    if (friendUsername) {
        showFriendProfile(friendUsername);  // Show the friend's profile
    } else {
        alert("Please enter a username to search.");
    }
});


// Add event listener for "Add Friend" button
document.getElementById("add-friend-btn").addEventListener("click", () => {
    const friendUsername = document.getElementById("friend-username").innerText.split(":")[1].trim();
    addFriend(friendUsername);  // Call the function to add the friend
});

// Close the modal
document.getElementById("close-friend-profile-btn").addEventListener("click", () => {
    document.getElementById("friend-profile-modal").style.display = "none";
});


// Add event listener for the logout button
document.getElementById("logout-btn").addEventListener("click", () => {
    signOut(auth)
        .then(() => {
            alert("You have been logged out.");
            window.location.href = "login.html"; // Redirect to the login page
        })
        .catch((error) => {
            console.error("Error logging out:", error.message);
        });
});
