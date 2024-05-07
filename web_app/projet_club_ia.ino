#include <WiFi.h>
const char* ssid = " Nom du wifi ";
const char* password = " Passeword" ;


void setup() 
{
	Serial.begin(115200);
	delay(1000);
	Serial.println("\n");
	
	
	WiFi.begin(ssid,password);
	Serial.print("Tentative de connexion.....");
	
	while (WiFi.status() != WL_CONNECTED)
	{
		Serial.print(" . ");
		delay(100);
	}
	
	Serial.println("\n");
	Serial.println("connexion etablir !") ;
	Serial.print("Adesse IP: ");
	Serial.println(WiFi.localIP());
}

void loop() {

}
