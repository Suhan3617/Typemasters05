
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword , GoogleAuthProvider , signInWithPopup } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-auth.js";
import { getFirestore, setDoc , doc } from "https://www.gstatic.com/firebasejs/11.1.0/firebase-firestore.js";

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

const provider = new GoogleAuthProvider();
auth.languageCode = 'en'

const googlelogin=document.getElementById("google-btn")
googlelogin.addEventListener("click" , function(){
  signInWithPopup(auth, provider)
  .then((result) => {
    const credential = GoogleAuthProvider.credentialFromResult(result);
    const user = result.user;
    console.log(user);
    window.location.href = "index.html";
  }).catch((error) => {
    const errorCode = error.code;
    const errorMessage = error.message;
  });
})

function showmessage(message, divId) {
    const messageDiv = document.getElementById(divId);
    messageDiv.style.display = "block";
    messageDiv.innerHTML = message;
    messageDiv.style.opacity = 1;

    setTimeout(() => {
        messageDiv.style.opacity = 0;
        messageDiv.style.display = "none";
    }, 5000);
}

const signIn = document.getElementById('login-btn');
signIn.addEventListener('click', (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const auth = getAuth();

    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            alert("logged in !");
            // showmessage('login is successful', 'signInMessage');
            const user = userCredential.user;
            localStorage.setItem('loggedInUserId', user.uid);
            window.location.href = 'index.html';
        })
        .catch((error) => {
            const errorCode = error.code;
            if (errorCode === 'auth/invalid-credential') {
                showmessage('Incorrect Email or Password', 'signInMessage');
            }
            else {
                showmessage('Account does not Exist', 'signInMessage');
            }
        })
})
