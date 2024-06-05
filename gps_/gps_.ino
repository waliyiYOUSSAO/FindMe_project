#include <TinyGPS++.h>
#include <SoftwareSerial.h>
#include <TFT_eSPI.h>
#include <WiFi.h>

TinyGPSPlus gps;
TFT_eSPI tft;

SoftwareSerial gps_serial(12, 13); // RX, TX

// configuration du wifi
const char *ssid = "FirstStoneWiFi";
const char *psw = "ZAIoTst0ne47";

String API_GPS = "AIzaSyAzR2ZdhLbZp2mLHk-Nxpom2Eh-5l_5uH8"; // api google maps

WiFiServer server(80); // port

String html; // variable du code html/css

void setup() {
  tft.init();
  tft.setRotation(1);
  tft.fillScreen(TFT_BLACK);
  Serial.begin(9600); 
  gps_serial.begin(9600); 
  delay(3000);
  tft.setTextColor(TFT_WHITE);
  tft.setCursor(0, 0);
  tft.setTextSize(3);
  Serial.print("Connexion au wifi ");
  Serial.println(ssid);
  WiFi.begin(ssid, psw);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  tft.println("connecté");
  Serial.println(WiFi.localIP());
  tft.println(WiFi.localIP());
  server.begin();
}

void loop() {
  tft.setCursor(0, 0);
  tft.setTextSize(3);
  tft.fillScreen(TFT_BLACK);

  while (gps_serial.available() > 0) {
    if (gps.encode(gps_serial.read())) {
      if (gps.location.isValid()) {
        String latitude = String(gps.location.lat(), 6);
        String longitude = String(gps.location.lng(), 6);
        String speed = String(gps.speed.kmph());
        String altitude = String(gps.altitude.meters());
        String time = String(gps.time.value());
        
        //String vitesse = String ();
        tft.print("Lat: ");
        Serial.print("Lat: ");
        Serial.println(latitude);
        tft.println(latitude);
        
        Serial.print("Long: ");
        tft.print("Long: ");
        Serial.println(longitude); 
        tft.println(longitude);

        WiFiClient client = server.available();
        if (client) {
          Serial.println("new client");
          String currentLine = "";
          while (client.connected()) {
      if (client.available()) {
        char c = client.read();
        if (c == '\n') {
          if (currentLine.length() == 0) {
            // Générer le HTML
            html = "<!DOCTYPE html>";
            html += "<html lang='en'>";
            html += "<head>";
            html += "<meta charset='UTF-8'>";
            html += "<meta name='viewport' content='width=device-width, initial-scale=1.0'>";
            html += "<meta http-equiv='X-UA-Compatible' content='ie=edge'>";
            html += "<title>Find Me</title>";
            html += "<style>";
            html += "body { font-family: Arial, sans-serif; margin: 0; padding: 0; background: #f0f0f0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; color: #333; }";
            html += "h1 { font-size: 2.5rem; margin-bottom: 20px; color: #4CAF50; }";
            html += "#map { height: 70vh; width: 90vw; max-width: 800px; border: 2px solid #4CAF50; border-radius: 10px; margin: 0 auto; }";
            html += ".container { text-align: center; padding: 20px; background: #fff; box-shadow: 0 4px 8px rgba(0,0,0,0.1); border-radius: 10px; }";
            html += ".button { margin: 10px; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer; }";

            html += "</style>";
            html += "<script>";
            html += "var map;";
            html += "var marker;";
            html += "var latitude = " + String(latitude) + ";";
            html += "var longitude = " + String(longitude) + ";";
            html += "function initMap() {";
            html += "map = new google.maps.Map(document.getElementById('map'), {";
            html += "center: {lat: latitude, lng: longitude},";
            html += "zoom: 15";
            html += "});";
            html += "marker = new google.maps.Marker({";
            html += "position: {lat: latitude, lng: longitude},";
            html += "map: map";
            html += "});";
            html += "}";
            html += "function updateMarker() {";
            html += "var newLatLng = new google.maps.LatLng(latitude, longitude);";
            html += "marker.setPosition(newLatLng);";
            html += "map.setCenter(newLatLng);";
            html += "}";
            html += "setInterval(updateMarker, 5000);"; // Mise à jour toutes les 5 secondes
            html += "</script>";
            
            html += "</head>";
            html += "<body onload='initMap()'>";
            html += "<div class='container'>";
            html += "<h1>Find Me</h1>";
            html += "<div id='map'></div>";
            html += "<div class='info-container'>";
            html += "<button class='button' onclick='showSpeed()'>Vitesse</button>";
            html += "<button class='button' onclick='showAltitude()'>Altitude</button>";
            html += "<button class='button' onclick='showTime()'>Heure</button>";
            html += "<div id='speed' style='display:none;'>Vitesse: " + speed + " km/h</div>";
            html += "<div id='altitude' style='display:none;'>Altitude: " + altitude + " mètres</div>";
            html += "<div id='time' style='display:none;'>Heure: " + time + "</div>";
            html += "</div>"; // Fermeture de info-container
            html += "</div>"; // Fermeture de container
            html += "<script async defer src='https://maps.googleapis.com/maps/api/js?key=" + String(API_GPS) + "&callback=initMap'></script>";
            html += "<script>";
            html += "function showSpeed() { var speedDiv = document.getElementById('speed'); if (speedDiv.style.display === 'none') { speedDiv.style.display = 'block'; } else { speedDiv.style.display = 'none'; } }";
            html += "function showAltitude() { var altitudeDiv = document.getElementById('altitude'); if (altitudeDiv.style.display === 'none') { altitudeDiv.style.display = 'block'; } else { altitudeDiv.style.display = 'none'; } }";
            html += "function showTime() { var timeDiv = document.getElementById('time'); if (timeDiv.style.display === 'none') { timeDiv.style.display = 'block'; } else { timeDiv.style.display = 'none'; } }";
            html += "</script>";

            html += "</body></html>";


            // Envoyer la réponse HTTP au client
            client.print("HTTP/1.1 200 OK\r\nContent-Type: text/html\r\n\r\n");
            client.print(html);
            break;
          } else {
            currentLine = "";
          }
        } else if (c != '\r') {
          currentLine += c;
        }
      }
    }
          client.stop();
          Serial.println("client disconnected");
        }
      }
    }
  }
}