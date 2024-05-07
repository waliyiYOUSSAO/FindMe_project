#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_ST7735.h> // Bibliothèque pour l'écran T-Display
#include <TinyGPS++> // Bibliothèque pour le module GPS
#include <SoftwareSerial> // Bibliothèque pour la communication série avec le GPS

// Définir les broches de connexion
const int gpsRxPin = 10;
const int gpsTxPin = 9;

// Créer un objet SoftwareSerial pour la communication avec le GPS
SoftwareSerial gpsSerial(gpsRxPin, gpsTxPin);

// Créer un objet TinyGPS++
TinyGPS++ gps;

void setup() {
  // Initialiser la communication série pour le débogage (facultatif)
  Serial.begin(115200);

  // Initialiser la communication série avec le module GPS
  gpsSerial.begin(9600);

  // Demander au GPS de fournir des données de GGA (position, altitude, fix)
  gps.setPGN(TinyGPS::PGN_GGA);

  // Initialiser l'écran T-Display
  tft.initR(INITR_BLACKTAB);
  tft.fillScreen(BLACK);
  tft.setTextSize(1);
}

void loop() {
  // Lire les données du GPS
  while (gps.available()) {
    int c = gps.read();
    gps.encode(c);
  }

  // Vérifier si une position valide est disponible
  if (gps.location.isValid()) {
    // Formater les données de position en chaîne de caractères
    String positionData = String(gps.location.lat(), 6) + "," + String(gps.location.lng(), 6);

    // Afficher la latitude et la longitude sur l'écran T-Display
    tft.setCursor(0, 0);
    tft.print("Latitude: ");
    tft.print(gps.location.lat(), 6);
    tft.print("°");
    tft.print(" Longitude: ");
    tft.print(gps.location.lng(), 6);
    tft.print("°");

    // Afficher l'altitude sur l'écran T-Display
    tft.setCursor(0, 16);
    tft.print("Altitude: ");
    tft.print(gps.location.alt, 0);
    tft.print("m");
  }

  // Attendre 1 seconde avant de lire les données suivantes
  delay(1000);
}
