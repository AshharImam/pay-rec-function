const firebase = require("firebase");

var firebaseConfig = {
  apiKey: "AIzaSyBQ3ycRCyv8ziXNheHV6rcTilXKO53TV0I",
  authDomain: "pay-rec.firebaseapp.com",
  databaseURL: "https://pay-rec.firebaseio.com",
  projectId: "pay-rec",
  storageBucket: "pay-rec.appspot.com",
  messagingSenderId: "682851723875",
  appId: "1:682851723875:web:566e2296653710f33f2656",
  measurementId: "G-D6Y8681HMN",
};
// Initialize Firebase

const firebaseApp = firebase.initializeApp(firebaseConfig);

const db = firebaseApp.firestore();
module.exports = db;
