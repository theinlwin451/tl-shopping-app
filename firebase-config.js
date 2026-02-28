// scripts/firebase-config.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDu2A07tep3m36pacKzSYHLA5QYBy_P9A4",
    authDomain: "tl-shopping.web.app",
    databaseURL: "https://tl-shopping-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "tl-shopping",
    storageBucket: "tl-shopping.firebasestorage.app",
    messagingSenderId: "180941176146",
    appId: "1:180941176146:web:c4833345ff191f51d74e8b"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export { auth, db, googleProvider };
