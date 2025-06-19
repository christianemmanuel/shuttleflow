// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBy2V67fpmwKLQ5561xOkTTcbjTKQRyl-k",
  authDomain: "shuttleflow-42edc.firebaseapp.com",
  projectId: "shuttleflow-42edc",
  storageBucket: "shuttleflow-42edc.firebasestorage.app",
  messagingSenderId: "159194652439",
  appId: "1:159194652439:web:2ae8b399d284ea0f2f2152",
  measurementId: "G-B9TNQ3SV51"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);


export { app, database };