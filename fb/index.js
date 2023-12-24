const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");
const firebaseConfig = {
    credential: admin.credential.cert(serviceAccount),
    apiKey: "AIzaSyBX0yvBtlfU9u6pqUQhOMyXBUOwzxnOIlk",
    authDomain: "hug-a-mug-958fa.firebaseapp.com",
    databaseURL: "https://hug-a-mug-958fa-default-rtdb.firebaseio.com",
    projectId: "hug-a-mug-958fa",
    storageBucket: "hug-a-mug-958fa.appspot.com",
    messagingSenderId: "858051497777",
    appId: "1:858051497777:web:6203c9b58481fc59fc2a10",
    measurementId: "G-FLXKV3J2QG"
};

// admin.initializeApp(firebaseConfig);
const firebase = admin.initializeApp(firebaseConfig)
const firebaseAuth = admin.auth();
const firebaseDb = admin.firestore();
module.exports = firebase;
console.log("Firebase Initialized");