// Importation des modules Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// Configuration de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDi_XGqnc62_ar2GIa-RsA8gf05WkftXnA",
  authDomain: "find-me-database.firebaseapp.com",
  databaseURL: "https://find-me-database-default-rtdb.firebaseio.com",
  projectId: "find-me-database",
  storageBucket: "find-me-database.appspot.com",
  messagingSenderId: "157452220190",
  appId: "1:157452220190:web:71781063eae174a1bbbb0f"
};

// Initialisation de l'app Firebase
const app = initializeApp(firebaseConfig);

// Obtention d'une référence à la base de données
const db = getDatabase(app);

// Référence à un nœud spécifique dans la base de données
const dataRef = ref(db, 'location/data/');

// Initialisation de la carte
var center = { lat: 0.0, lng: 0.0 }; 

// Création de l'objet carte et spécification de l'élément DOM pour l'affichage
var map = new google.maps.Map(document.getElementById('map'), {
  center: center,
  zoom: 12
});

var directionsService = new google.maps.DirectionsService();
var directionsRenderer = new google.maps.DirectionsRenderer();
directionsRenderer.setMap(map);

var userLocation = null;

if (navigator.geolocation) {
  navigator.geolocation.watchPosition(showPosition, showError, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
} else {
  document.getElementById("location").innerHTML = "Geolocation is not supported by this browser";
}

function showPosition(position) {
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var accuracy = position.coords.accuracy;
  document.getElementById("location").innerHTML = 
      "Latitude: " + latitude + "<br>" +
      "Longitude: " + longitude + "<br>" +
      "Précision: " + accuracy + " mètres";

  // Centrer la carte sur la position de l'utilisateur
  userLocation = { lat: latitude, lng: longitude };
  

  // Ajouter un marqueur pour la position de l'utilisateur
  new google.maps.Marker({
    position: userLocation,
    map: map,
    title: `Vous êtes ici (Précision: ${accuracy} mètres)`
  });

  // Zoomer pour voir la position de l'utilisateur de manière plus précise
  map.setZoom(15);
}

function showError(error) {
  switch(error.code) {
    case error.PERMISSION_DENIED:
      document.getElementById("location").innerHTML = "L'utilisateur a refusé la demande de géolocalisation.";
      break;
    case error.POSITION_UNAVAILABLE:
      document.getElementById("location").innerHTML = "Les informations de localisation ne sont pas disponibles.";
      break;
    case error.UNKNOWN_ERROR:
      document.getElementById("location").innerHTML = "Une erreur inconnue s'est produite.";
      break;
  }
}
var tracker_location = null

// Mise en place d'un écouteur pour les changements de valeur
let previousMarker = null;
onValue(dataRef, (snapshot) => {
  const data = snapshot.val();
  let longi = parseFloat(data.longitude);
  let lati = parseFloat(data.latitude);

  tracker_location = {lat:lati, lng: longi}
  map.setCenter(tracker_location);
  document.getElementById('data').innerText = JSON.stringify(data, null, 2);
  
  if (data) {
    const markerIcon = {
      url: "image/marque-demplacement.png", // URL de l'icône
      scaledSize: new google.maps.Size(32, 32), // Taille réduite de l'icône
    };
    const marker = new google.maps.Marker({
      position: { lat: lati, lng: longi },
      icon: markerIcon,
      map: map,
      title: "tracker"
    });
    if (previousMarker !== null) {
      previousMarker.setMap(null);
    }
    marker.setMap(map);
    previousMarker = marker;

    // Afficher l'itinéraire si userLocation est défini
    if (userLocation) {
      var request = {
        origin: userLocation,
        destination: { lat: lati, lng: longi },
        travelMode: 'DRIVING'
      };
      directionsService.route(request, function(result, status) {
        if (status == 'OK') {
          directionsRenderer.setDirections(result);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      });
    }
  }
}, (error) => {
  console.log("Error: " + error.code);
});
