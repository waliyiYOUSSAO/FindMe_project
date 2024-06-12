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
var userMarker = null;


if (navigator.geolocation) {
  navigator.geolocation.watchPosition(showPosition, showError, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 0
  });
} else {
  document.getElementById("location").innerHTML = "La géolocalisation n'est pas supporté par ce navigateur";
}

function showPosition(position) { // fonction pour afficher la position de l'utilisateur
  var latitude = position.coords.latitude;
  var longitude = position.coords.longitude;
  var accuracy = position.coords.accuracy;
  

  // Centrer la carte sur la position de l'utilisateur
  userLocation = { lat: latitude, lng: longitude };
  
  if (userMarker){
    userMarker.map.setPosition(userLocation);

  }
  else{
    // Ajouter un marqueur pour la position de l'utilisateur
  userMarker = new google.maps.Marker({
    position: userLocation, // localisation de l'utilisateur
    map: map,
    title: `Vous êtes ici (Précision: ${accuracy} mètres)`
  });
  const get_zoom = map.getZoom();

  // Zoomer pour voir la position de l'utilisateur de manière plus précise
  map.setZoom(get_zoom);
  }
  
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
var tracker_location = null // localisation du tracker

// Mise en place d'un écouteur pour les changements de valeur
let previousMarker = null; // prévisualisation du tracker pour éviter les doublons

onValue(dataRef, (snapshot) => { // écoute des données pour les mettre ajour
  const data = snapshot.val();
  let longi = parseFloat(data.longitude); // conversion des données 
  let lati = parseFloat(data.latitude); 

  tracker_location = {lat:lati, lng: longi} 
  map.setCenter(tracker_location); // centralisation de la carte sur les information du tracker 

  //document.getElementById('data').innerText = JSON.stringify(data, null, 2);
  
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
document.addEventListener('DOMContentLoaded', (event) => {
  console.log("Document is ready");

  // Fonction pour ouvrir une modale
  function openModal(modalId) {
      console.log("Opening modal:", modalId);
      document.getElementById(modalId).style.display = "block";
      if (modalId === 'trackerModal') {
          fetchTrackerInfo();
      } else if (modalId === 'meModal') {
          fetchMeInfo();
      }
  }

  // Fonction pour fermer une modale
  function closeModal(modalId) {
      console.log("Closing modal:", modalId);
      document.getElementById(modalId).style.display = "none";
  }

  // Fonction pour récupérer des informations sur le tracker
  function fetchTrackerInfo() {
      console.log("Fetching tracker info");
      // Récupérer les informations du tracker depuis la base de données Firebase
      onValue(dataRef, (snapshot) => {
          const data = snapshot.val();
          const info_track = {
              longitude: data.longitude,
              latitude: data.latitude,
              time: data.hour,
              minute: data.minute,
              altitude: data.altitude,
              speed: data.speed
          };
          const infoHtml = `
              <ul>
                  <li>Longitude: ${info_track.longitude}</li>
                  <li>Latitude: ${info_track.latitude}</li>
                  <li>Heure: ${info_track.time}:${info_track.minute}</li>
                  <li>Altitude: ${info_track.altitude}</li>
                  <li>Vitesse: ${info_track.speed}</li>
              </ul>
          `;
          document.getElementById('trackerInfo').innerHTML = infoHtml;
      });
  }

  // Fonction pour récupérer des informations sur moi
  function fetchMeInfo() {
      console.log("Fetching my info");
      // Utiliser les informations de géolocalisation de l'utilisateur
      navigator.geolocation.getCurrentPosition((position) => {
          const info_me = {
              longitude: position.coords.longitude,
              latitude: position.coords.latitude,
              accuracy: position.coords.accuracy
          };
          const infoHtml = `
              <ul>
                  <li>Longitude: ${info_me.longitude}</li>
                  <li>Latitude: ${info_me.latitude}</li>
                  <li>Précision: ${info_me.accuracy} mètres</li>
              </ul>
          `;
          document.getElementById('meInfo').innerHTML = infoHtml;
      });
  }

  // Ajouter des événements de clic sur les boutons
  document.querySelector('.btn').addEventListener('click', () => {
      console.log("Tracker button clicked");
      openModal('trackerModal');
  });
  document.querySelector('.btn2').addEventListener('click', () => {
      console.log("Me button clicked");
      openModal('meModal');
  });

  // Ajouter des événements de clic pour fermer les modales
  document.querySelectorAll('.close').forEach(closeButton => {
      closeButton.addEventListener('click', function() {
          const modal = closeButton.closest('.modal');
          console.log("Close button clicked in modal:", modal.id);
          modal.style.display = 'none';
      });
  });
});
