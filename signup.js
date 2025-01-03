
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword , GoogleAuthProvider , signInWithPopup } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, setDoc, doc , getDoc} from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoaag994DMnsosOZ84YG_zJlhhdjXvLdY",
  authDomain: "basics-e3ac0.firebaseapp.com",
  projectId: "basics-e3ac0",
  storageBucket: "basics-e3ac0.firebasestorage.app",
  messagingSenderId: "910815144454",
  appId: "1:910815144454:web:82861f73339afe31a9b187"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export {db , auth , app };

const provider = new GoogleAuthProvider();
auth.languageCode = 'en'

// const googlelogin=document.getElementById("login-google")
// googlelogin.addEventListener("click" , function(){
//   signInWithPopup(auth, provider)
//   .then((result) => {
//     const credential = GoogleAuthProvider.credentialFromResult(result);
//     const user = result.user;
//     console.log(user);
//     window.location.href = "index.html";
//   }).catch((error) => {
//     const errorCode = error.code;
//     const errorMessage = error.message;
//   });
// })
const googlelogin = document.getElementById("login-google");
googlelogin.addEventListener("click", async function () {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user; // Get the authenticated user

        // Save user data to Firestore if it doesn't exist
        const userRef = doc(db, "users", user.uid);
        const userSnapshot = await getDoc(userRef);

        if (!userSnapshot.exists()) {
            // If the user doesn't exist in Firestore, create their document
            await setDoc(userRef, {
                email: user.email,
                friends: [], // Initialize with an empty friends array
            });
        }

        // Redirect to profile page and show an alert
        alert("Do add your username and city by clicking on the Edit Profile button.");
        window.location.href = "profile.html"; // Redirect to profile page
    } catch (error) {
        console.error("Google login error:", error);
        alert("Error during Google login: " + error.message);
    }
});

const signUp = document.getElementById('signup-btn');
signUp.addEventListener('click', async (e) => {
    e.preventDefault(); // Prevent form submission
    const username = document.getElementById("username").value;
    const city = document.getElementById("city").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordpattern = /^(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{5,}$/;
    const emailpattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    // Validate email format
    if (!emailpattern.test(email)) {
        alert("Please enter a valid email address. (Ex: abc@gmail.com)");
        return;
    }

    // Validate password format
    if (!passwordpattern.test(password)) {
        alert("Password must contain at least 5 characters, 1 number, and 1 symbol.");
        return;
    }

    try {
        const usercredentials = await createUserWithEmailAndPassword(auth, email, password);
        const user = usercredentials.user;

        // Save user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            username: username,
            email: email,
            city: city,
            friends : [],
        });

        alert("Sign-up successful! Let the typing showdown begin, " + username + "!");
        window.location.href = "index.html";
    } catch (error) {
        alert("Error: " + error.message);
    }
});

