import { initializeApp } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";

// Configuration de Firebase
const firebaseConfig = { apiKey: "AIzaSyDi_XGqnc62_ar2GIa-RsA8gf05WkftXnA",
authDomain: "find-me-database.firebaseapp.com",
databaseURL: "https://find-me-database-default-rtdb.firebaseio.com",
projectId: "find-me-database",
storageBucket: "find-me-database.appspot.com",
messagingSenderId: "157452220190",
appId: "1:157452220190:web:71781063eae174a1bbbb0f"};

// Initialisation de l'app Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);
const dataRef = ref(db, 'location');

// Attendre le chargement du DOM
document.addEventListener("DOMContentLoaded", () => {
  // Observer les changements de données
  onValue(dataRef, (snapshot) => {
    const data = snapshot.val();
    document.getElementById('data').innerText = JSON.stringify(data, null, 2);
    const center = { lat: 6.439943167, lng: 2.324272667 }; // Coordonnées pour San Francisco

    // Créer une carte Google Maps
    const map = new google.maps.Map(document.getElementById('map'), {
      center: center,
      zoom: 12
    });

    // Créer un marqueur Google Maps
    const marker = new google.maps.Marker({
      position: center,
      map: map,
      title: 'Hello World!'
    });

  }, (error) => {
    console.log("Error: " + error.code);
  });
});
