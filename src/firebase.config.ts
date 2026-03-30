// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBxnOnPCNRj5FUXDhCAmU4FY_TsWau5t0M",
  authDomain: "vehiclejs-3f299.firebaseapp.com",
  projectId: "vehiclejs-3f299",
  storageBucket: "vehiclejs-3f299.firebasestorage.app",
  messagingSenderId: "155882608470",
  appId: "1:155882608470:web:2e418d2ad90b06dadc28f7",
  measurementId: "G-C2FRF3QXPC"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const functions = getFunctions(app, 'asia-southeast1');
// const analytics = getAnalytics(app);
export { auth, db, functions };
