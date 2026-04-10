// services/firebase.js - Configuración de Firebase
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCcLgSOku3o9-mNByIRGqqonMwZARLerhU",
  authDomain: "registro-app-wmt.firebaseapp.com",
  projectId: "registro-app-wmt",
  storageBucket: "registro-app-wmt.firebasestorage.app",
  messagingSenderId: "164643785846",
  appId: "1:164643785846:web:7ed9a862c584922a59e357",
  measurementId: "G-SW4JRNEBFF"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
