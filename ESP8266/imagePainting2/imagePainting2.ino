//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
//#define STA       // Decomment this to use STA mode instead of AP
#define BUTTON      // Decomment this to use BUTTON
#define FEATURE DotStarBgrFeature // Neopixels : NeoGrbFeature / Dotstars : DotStarBgrFeature
#define METHOD DotStarSpiMethod // Neopixels :Neo800KbpsMethod / Dotstars : DotStarSpiMethod
//Dotstars : DATA_PIN : MOSI / CLOCK_PIN :SCK (Wemos D1 mini DATA_PIN=D7(GREEN) CLOCK_PIN=D5 (Yellow))
//Neopixels : DATA_PIN : RDX0/GPIO3 (Wemos D1 mini DATA_PIN=RX)
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

#include <ArduinoJson.h>
#include <ESP8266WiFi.h>
#include <ESP8266WebServer.h>
#include <NeoPixelBus.h>
#include <NeoPixelAnimator.h>
#include <LittleFS.h>

// LED --------------
const int NUMPIXELS = 119;
NeoPixelBus<FEATURE, METHOD> STRIP(NUMPIXELS);
// end LED -----------

// WEBSERVER --------------
ESP8266WebServer server;
// end WEBSERVER -----------

// WIFI --------------
#ifdef STA // STA Mode
const char* ssid = "Redmi Note 10 Pro"; // your wifi ssid for STA mode
const char* password = "1122334455"; // your wifi password for AP mode
#else // AP Mode
const char* ssid = "imagePainting"; // wifi ssid for AP mode
IPAddress apIP(192, 168, 1, 1); // wifi IP for AP mode
#endif
// end WIFI -----------

// FS --------------
fs::File UPLOADFILE; // hold uploaded file
const char *CONFIGPATH = "config.json";  // config file
// end FS -----------

// ANIMATION --------------
NeoPixelAnimator ANIMATIONS(1); // NeoPixel animation management object
String BMPPATH = "";
bool ISBMPLOAD = false;
NeoBitmapFile<FEATURE, fs::File> NEOBMPFILE;
uint16_t INDEXMIN; //Min index possible
uint16_t INDEXSTART; //Min index chosen
uint16_t INDEX; // Current index
uint16_t INDEXSTOP; //Max index chosen
uint16_t INDEXMAX; //Max index possible
// end ANIMATION --------------

// RUNTIME --------------
long COUNTDOWN = 0; long COUNTDOWNCOUNTER;
bool ISCOUNTDOWN = false;
uint8_t DELAY = 15;
uint8_t BRIGHTNESS = 25;
uint8_t REPEAT = 1; uint8_t REPEATCOUNTER;
bool ISINVERT = false; bool ISINVERTTEMP;
bool ISREPEAT = false;
bool ISBOUNCE = false;
uint8_t VCUT = 1; uint8_t VCUTCOUNTER;
bool ISVCUTCOLOR = false;
bool ISVCUTOFF = false;
uint8_t HCUT = 1; uint8_t HCUTCOUNTER;
bool ISHCUTOFF = false;
bool ISHCUTCOLOR = false;


HtmlColor COLOR = HtmlColor(0xffffff);
bool ISENDOFF = false;
bool ISENDCOLOR = false;
// end RUNTIME --------------

// BUTTON --------------
#ifdef BUTTON
long DEBOUNCETIME = 50; //Debouncing Time in Milliseconds
long HOLDTIME = 500; // Hold Time in Milliseconds
const int BTNA_PIN = D3; //PIN for the button A
const int BTNB_PIN = D4; //PIN for the button B
long BTNATIMER = 0;
long BTNBTIMER = 0;
boolean ISBTNA = false;
boolean ISBTNB = false;
boolean ISBTNAHOLD = false;
boolean ISBTNBHOLD = false;
#endif
// end BUTTON-----------

//SHADER --------------
template<typename T_COLOR_OBJECT> class BrightnessShader : public NeoShaderBase
{
  public:
    BrightnessShader():
      NeoShaderBase()
    {}

    T_COLOR_OBJECT Apply(uint16_t index, const T_COLOR_OBJECT src)
    {
      //
      T_COLOR_OBJECT result;
      T_COLOR_OBJECT color;
      
      // Horizontal cut counter initialization
      if (index == 0) HCUTCOUNTER = 2 * HCUT;
      
      // Horizontal cut to do
      if ((ISHCUTOFF || ISHCUTCOLOR) && (HCUTCOUNTER <= HCUT))
      {
        // Horizontal cut counter incrementation
        if (HCUTCOUNTER > 1) HCUTCOUNTER -= 1;
        else HCUTCOUNTER = 2 * HCUT;
        
        //  Blank or color the strip during the horizontal cut
        color= RgbColor(0,0,0);
        if (ISHCUTCOLOR)  color = RgbColor(COLOR);
      }
      
      // No horizontal cut to do
      else
      {
        // Horizontal cut counter incrementation
        if (ISHCUTOFF || ISHCUTCOLOR) HCUTCOUNTER -= 1;
        
        // Fil the strip with the bitmap
        color = src;
      }
      
      // below is a fast way to apply brightness to all elements (only 8bits) of the color
      const uint8_t* pColor = reinterpret_cast<const uint8_t*>(&color);
      uint8_t* pResult = reinterpret_cast<uint8_t*>(&result);
      const uint8_t* pColorEnd = pColor + sizeof(T_COLOR_OBJECT);
      while (pColor != pColorEnd)
      {
        *pResult++ = (*pColor++ * (uint16_t(BRIGHTNESS) + 1)) >> 8;
      }
      
      //
      return result;
    }
};

typedef BrightnessShader<FEATURE::ColorObject> BrightShader;

BrightShader SHADER;
//end SHADER --------------

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void setup()
{
  // FS setup
  LittleFS.begin();

  // Serial setup
  Serial.begin(115200);

  // Wifi setup
#ifdef STA //STA Mode
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    Serial.print(".");
    delay(500);
  }
  Serial.println("");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
#else //AP Mode
  WiFi.mode(WIFI_AP);
  WiFi.softAPConfig(apIP, apIP, IPAddress(255, 255, 255, 0));
  WiFi.softAP(ssid);
#endif

  // Webserver setup
  // list available files
  server.on("/list", HTTP_GET, handleFileList);

  // delete file
  server.on("/delete", HTTP_DELETE, handleFileDelete);

  // handle file upload
  server.on("/upload", HTTP_POST, []() {
    server.send(200, "text/plain", "UPLOAD SUCCESS");
  }, handleFileUpload);

  // handle Play
  server.on("/play", HTTP_GET, handlePlay);

  // handle Stop
  server.on("/stop", HTTP_GET, handleStop);

  // handle light
  server.on("/light", HTTP_GET, handleLight);

  // handle burn
  server.on("/burn", HTTP_GET, handleBurn);

 // handle bitmap Read
  server.on("/bitmapRead", HTTP_GET, handleBitmapRead);

  // handle bitmap Write
  server.on("/bitmapWrite", HTTP_POST, handleBitmapWrite);

  // handle parameter Read
  server.on("/parameterRead", HTTP_GET, handleParameterRead);

  // handle parameter Save
  server.on("/parameterSave", HTTP_GET, handleParameterSave);

  // handle parameter Write
  server.on("/parameterWrite", HTTP_POST, handleParameterWrite);

  // handle parameter Restore
  server.on("/parameterRestore", HTTP_GET, handleParameterRestore);

  // handle system Read
  server.on("/systemRead", HTTP_GET, handleSystemRead);

  // called when the url is not defined
  server.onNotFound([]() {
    handleFileRead(server.uri());
  });

  // Webserver start
  server.begin();

  // LED setup
  STRIP.Begin();
  STRIP.ClearTo(RgbColor(0, 0, 0));
  
  // Button setup
#ifdef BUTTON
  pinMode(BTNA_PIN, INPUT_PULLUP);
  pinMode(BTNB_PIN, INPUT_PULLUP);
#endif
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void loop()
{
  // To handle the webserver
  server.handleClient();

  // To handle the LED animation
  ANIMATIONS.UpdateAnimations();
  STRIP.Show();

  // To handle the buttons
#ifdef BUTTON
  // To handle the button A
  if (digitalRead(BTNA_PIN) == LOW)
  {
    if (!ISBTNA)
    {
      ISBTNA = true;
      BTNATIMER = millis();
    }
    if ((millis() - BTNATIMER > HOLDTIME) && (!ISBTNAHOLD))
    {
      ISBTNAHOLD = true;
      burn();
    }
  }
  else if (ISBTNA)
  {
    if ((millis() - BTNATIMER > DEBOUNCETIME) && (!ISBTNAHOLD))
    {
      play();
    }
    ISBTNA = false;
    ISBTNAHOLD = false;
  }

  // To handle the button B
  if (digitalRead(BTNB_PIN) == LOW)
  {
    if (!ISBTNB)
    {
      ISBTNB = true;
      BTNBTIMER = millis();
    }
    if ((millis() - BTNBTIMER > HOLDTIME) && (!ISBTNBHOLD))
    {
      ISBTNBHOLD = true;
      light();
    }
  }
  else if (ISBTNB)
  {
    if ((millis() - BTNBTIMER > DEBOUNCETIME) && (!ISBTNBHOLD))
    {
      stopB();
    }
    ISBTNB = false;
    ISBTNBHOLD = false;
  }
#endif
}
//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void clearToSHADER()
{
  for (uint16_t index=0; index<NUMPIXELS; index++)
   {
     // Apply color through SHADER to each pixel of the strip
     STRIP.SetPixelColor(index,SHADER.Apply(index, COLOR));
   }
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
String getContentType(String filename)
{
  if (filename.endsWith(".html")) return "text/html";
  else if (filename.endsWith(".bmp")) return "image/bmp";
  else if (filename.endsWith(".png")) return "image/png";
  else if (filename.endsWith(".js")) return "application/javascript";
  else if (filename.endsWith(".css")) return "text/css";
  return "text/plain";
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
String systemRead()
{
  // New json document
  StaticJsonDocument<500> jsonDoc;

  // Store system parameter in json document
  FSInfo fs_info;
  LittleFS.info(fs_info);
  jsonDoc["usedBytes"] = fs_info.usedBytes;
  jsonDoc["totalBytes"] = fs_info.totalBytes;
  jsonDoc["freeBytes"] = fs_info.totalBytes-fs_info.usedBytes;
  jsonDoc["numPixels"] = NUMPIXELS;

  // Convert json document to String and return it
  String systemParameter = "";
  serializeJson(jsonDoc, systemParameter);
  return systemParameter;
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleSystemRead()
{
  // Read system parameter
  String systemParameter = systemRead();

  // System parameter are read
  server.send(200, "application/json", systemParameter);
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
String bitmapRead()
{
  // New json document
  StaticJsonDocument<500> jsonDoc;
  
  // Store bitmap parameter in json document
  jsonDoc["indexMin"] = INDEXMIN;
  jsonDoc["indexStart"] = INDEXSTART;
  jsonDoc["indexStop"] = INDEXSTOP;
  jsonDoc["indexMax"] = INDEXMAX;
  jsonDoc["bmpPath"] = BMPPATH;
  jsonDoc["isbmpload"] = ISBMPLOAD;
  
  // convert json document to String and return it
  String bitmapParameter = "";
  serializeJson(jsonDoc, bitmapParameter);
  return bitmapParameter;
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleBitmapRead()
{
  // read the bitmap parameter
  String bitmapParameter = bitmapRead();

  // Bitmap parameter are read
  server.send(200, "application/json", bitmapParameter);
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void bitmapWrite(String stringParameter)
{
  // New json document
  StaticJsonDocument<500> jsonDoc;

  // Convert json String to json object
  DeserializationError error = deserializeJson(jsonDoc, stringParameter);

  // Json not right ?
  if (error)
  {
    // Error wrong json
    return server.send(500, "text/html", "BITMAP WRITE ERROR : WRONG JSON");
  }

  // Running or paused animation ?
  if (ANIMATIONS.IsAnimationActive(0) || ANIMATIONS.IsPaused())
  {
    // Error not available
    return server.send(403, "text/html", "BITMAP WRITE ERROR : NOT AVAILABLE");
  }

  // Write parameter in the ESP8266
  if (!jsonDoc["indexStart"].isNull())INDEXSTART = jsonDoc["indexStart"];
  if (!jsonDoc["indexStop"].isNull())INDEXSTOP = jsonDoc["indexStop"];
  if (!jsonDoc["bmpPath"].isNull() && jsonDoc["bmpPath"].as<String>() != BMPPATH)
  {
    // Update BMPPATH
    BMPPATH = jsonDoc["bmpPath"].as<String>();
    
    // Check and initialize NEOBMPFILE from the BMPFILE
    ISBMPLOAD = NEOBMPFILE.Begin(LittleFS.open(BMPPATH, "r"));
  
    // Update the index possible
    INDEXMIN = 0;
    INDEXMAX = NEOBMPFILE.Height() - 1;
  
    // Update the index chosen
    INDEXSTART = INDEXMIN;
    INDEXSTOP = INDEXMAX;
  }

  // Parameter are write
  server.send(200, "text/html",  "BITMAP WRITE SUCCESS");
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleBitmapWrite()
{
  // Write parameter
  bitmapWrite(server.arg("plain"));
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
String parameterRead()
{
  // New json document
  StaticJsonDocument<600> jsonDoc;

  // Store parameter in json document
  jsonDoc["delay"] = DELAY;
  jsonDoc["brightness"] = BRIGHTNESS;
  //
  jsonDoc["countdown"] = COUNTDOWN;
  jsonDoc["iscountdown"] = ISCOUNTDOWN;
  //
  jsonDoc["repeat"] = REPEAT;
  jsonDoc["isinvert"] = ISINVERT;
  jsonDoc["isrepeat"] = ISREPEAT;
  jsonDoc["isbounce"] = ISBOUNCE;
  //
  jsonDoc["vcut"] = VCUT;
  jsonDoc["isvcutoff"] = ISVCUTOFF;
  jsonDoc["isvcutcolor"] = ISVCUTCOLOR;
  //
  jsonDoc["hcut"] = HCUT;
  jsonDoc["ishcutoff"] = ISHCUTOFF;
  jsonDoc["ishcutcolor"] = ISHCUTCOLOR;
  //
  char color[9];
  COLOR.ToNumericalString(color, 9);
  jsonDoc["color"] = color;
  jsonDoc["isendoff"] = ISENDOFF;
  jsonDoc["isendcolor"] = ISENDCOLOR;

  // convert json document to String and return it
  String parameter = "";
  serializeJson(jsonDoc, parameter);
  return parameter;
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleParameterRead()
{
  // read the parameter
  String parameter = parameterRead();

  // Parameter are read
  server.send(200, "application/json", parameter);
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleParameterSave()
{
  // read the parameter
  String parameter = parameterRead();

  // Create or open CONFIGPATH
  File configFile = LittleFS.open(CONFIGPATH, "w");

  // Save parameter in configFile
  configFile.print(parameter);

  // Close configFile
  configFile.close();

  // Parameter are save
  server.send(200, "text/html",  "PARAMETER SAVE SUCCESS");
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void parameterWrite(String stringParameter)
{
  // New json document
  StaticJsonDocument<600> jsonDoc;

  // Convert json String to json object
  DeserializationError error = deserializeJson(jsonDoc, stringParameter);

  // Json not right ?
  if (error)
  {
    // Error wrong json
    return server.send(500, "text/html", "PARAMETER WRITE ERROR : WRONG JSON");
  }

  // Running or paused animation ?
  if (ANIMATIONS.IsAnimationActive(0) || ANIMATIONS.IsPaused())
  {
    // Error not available
    return server.send(403, "text/html", "PARAMETER WRITE ERROR : NOT AVAILABLE");
  }

  // Write parameter in the ESP8266
  if (!jsonDoc["delay"].isNull()) DELAY = jsonDoc["delay"];
  if (!jsonDoc["brightness"].isNull()) BRIGHTNESS = jsonDoc["brightness"];
  //
  if (!jsonDoc["countdown"].isNull()) COUNTDOWN = jsonDoc["countdown"];
  if (!jsonDoc["iscountdown"].isNull()) ISCOUNTDOWN = jsonDoc["iscountdown"];
  //
  if (!jsonDoc["repeat"].isNull()) REPEAT = jsonDoc["repeat"];
  if (!jsonDoc["isinvert"].isNull()) ISINVERT = jsonDoc["isinvert"];
  if (!jsonDoc["isrepeat"].isNull()) ISREPEAT = jsonDoc["isrepeat"];
  if (!jsonDoc["isbounce"].isNull()) ISBOUNCE = jsonDoc["isbounce"];
  //
  if (!jsonDoc["vcut"].isNull()) VCUT = jsonDoc["vcut"];
  if (!jsonDoc["isvcutoff"].isNull()) ISVCUTOFF = jsonDoc["isvcutoff"];
  if (!jsonDoc["isvcutcolor"].isNull()) ISVCUTCOLOR = jsonDoc["isvcutcolor"];
  //
  if (!jsonDoc["hcut"].isNull()) HCUT = jsonDoc["hcut"];
  if (!jsonDoc["ishcutoff"].isNull()) ISHCUTOFF = jsonDoc["ishcutoff"];
  if (!jsonDoc["ishcutcolor"].isNull()) ISHCUTCOLOR = jsonDoc["ishcutcolor"];
  //
  if (!jsonDoc["color"].isNull()) COLOR.Parse<HtmlShortColorNames>(jsonDoc["color"].as<String>());
  if (!jsonDoc["isendoff"].isNull()) ISENDOFF = jsonDoc["isendoff"];
  if (!jsonDoc["isendcolor"].isNull()) ISENDCOLOR = jsonDoc["isendcolor"];

  // Parameter are write
  server.send(200, "text/html",  "PARAMETER WRITE SUCCESS");
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleParameterWrite()
{
  // Write parameter
  parameterWrite(server.arg("plain"));
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleParameterRestore()
{
  // Open CONFIGPATH
  File configFile = LittleFS.open(CONFIGPATH, "r");

  // read configFile
  String configString;
  while (configFile.available())
  {
    configString += char(configFile.read());
  }

  // Close configFile
  configFile.close();

  // Write parameter
  parameterWrite(configString);
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleFileDelete()
{
  // parse file from request
  String path = server.arg("plain");

  // protect system files
  if ( path == "" || path == "/" || path == "config.json" || path == "index.html" || path == "css" || path == "js" || path == "title.png") return server.send(500, "text/plain", "DELETE ERROR : SYSTEM FILE");

  // check if the file exists
  if (!LittleFS.exists(path)) return server.send(404, "text/plain", "DELETE ERROR : FILE NOT FOUND");

  // if delete current bitmap onload it
  if ( path == BMPPATH)
  {
    String BMPPATH = "";
    ISBMPLOAD = false;
  }

  // Delete the file
  LittleFS.remove(path);

  // File is delete
  server.send(200, "text/plain", "DELETE SUCCESS");
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleFileRead(String path)
{
  // Serve index file when top root path is accessed
  if (path.endsWith("/")) path += "index.html";

  // Check if the file exists
  if (!LittleFS.exists(path)) return server.send(404, "text/plain", "READ ERROR : FILE NOT FOUND");

  // Open the file
  fs::File file = LittleFS.open(path, "r");

  // Display the file on the client's browser
  server.streamFile(file, getContentType(path));

  // Close the file
  file.close();
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleFileUpload()
{
  //
  HTTPUpload& upload = server.upload();

  // Upload start
  if (upload.status == UPLOAD_FILE_START)
  {
    String filename = upload.filename;
    if (!filename.startsWith("/")) filename = "/" + filename;

    //check if the file already exist
    //if (LittleFS.exists(filename))
    //{
    //  return server.send(500, "text/plain", "UPLOAD ERROR : FILE ALREADY EXIST");
    //}

    // Open the file for writing in LittleFS (create if it doesn't exist)
    UPLOADFILE = LittleFS.open(filename, "w");
  }

  // Upload in progress
  else if (upload.status == UPLOAD_FILE_WRITE)
  {
    //Write the received bytes to the file
    if (UPLOADFILE) UPLOADFILE.write(upload.buf, upload.currentSize);
  }

  // Upload end
  else if (upload.status == UPLOAD_FILE_END)
  {
    //Close the file
    if (UPLOADFILE) UPLOADFILE.close();
  }
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleFileList()
{
  // Assuming there are no subdirectories
  fs::Dir dir = LittleFS.openDir("/");

  // New json document
  StaticJsonDocument<1000> jsonDoc;

  // Store parameter in json document
  JsonArray fileList = jsonDoc.createNestedArray("fileList");

  // Scan the files
  while (dir.next())
  {
    // Open the entry
    fs::File entry = dir.openFile("r");

    // Get the name
    String name = String(entry.name());

    // Write the entry in the list (Hide system file)
    if (!(name == "config.json" || name == "index.html" || name == "css" || name == "js" || name == "title.png")) fileList.add(name);

    // Close the entry
    entry.close();
  }

  // convert json document to String
  String msg = "";
  serializeJson(jsonDoc, msg);

  // Parameter are read
  server.send(200, "application/json", msg);
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handlePlay()
{
  String htmlMsg = play();
  server.send(200, "text/plain", htmlMsg);
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
String play()
{
  // Html msg
  String htmlMsg = "";

  // Animation is paused : resume it
  if (ANIMATIONS.IsPaused())
  {
    // Resume animation
    ANIMATIONS.Resume();

    // Animation is resume
    htmlMsg = "RESUME";
  }
  
  // Animation is active : pause it
  else if (ANIMATIONS.IsAnimationActive(0))
  {
    // Pause animation
    ANIMATIONS.Pause();

    // Blank the strip if needed
    if (ISENDOFF) STRIP.ClearTo(RgbColor(0, 0, 0));
    if (ISENDCOLOR) clearToSHADER();

    // Animation is paused
    htmlMsg = "PAUSE";
  }
  
  // No animation : start a new one
  else
  {
    // Invert initialization
    ISINVERTTEMP = ISINVERT;

    // Repeat counter initialization
    REPEATCOUNTER = REPEAT;

    // Cut counter initialization
    VCUTCOUNTER = 2 * VCUT;

    // Index initialization
    if (ISINVERTTEMP) INDEX = INDEXSTOP;
    else INDEX = INDEXSTART;

    // Launch a new animation
    ANIMATIONS.StartAnimation(0, DELAY, updateAnimation);

    // New animation is launch
    htmlMsg = "PLAY";
  }
  
  //
  return htmlMsg;
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleStop()
{
  stopB();
  server.send(200, "text/plain", "STOP");
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void stopB()
{
  // Stop animation
  ANIMATIONS.StopAnimation(0);
  ANIMATIONS.Resume(); // remove the pause flag to stop paused animation

  // Turn off the strip
  STRIP.ClearTo(RgbColor(0, 0, 0));
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleLight()
{
  light();
  server.send(200, "text/plain", "LIGHT");
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void light()
{
  // Stop animation
  ANIMATIONS.StopAnimation(0);
  ANIMATIONS.Resume(); // remove the pause flag to stop paused animation

  //turn on the strip
  clearToSHADER();
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void handleBurn()
{
  burn();
  server.send(200, "text/plain", "BURN");
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void burn()
{
  // Stop animation
  ANIMATIONS.StopAnimation(0);
  ANIMATIONS.Resume(); // remove the pause flag to stop paused animation

  //turn on the strip
  NEOBMPFILE.Render<BrightShader>(STRIP, SHADER, 0, 0, INDEXSTART, NEOBMPFILE.Width());
}

//XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
void updateAnimation(const AnimationParam & param)
{
  // Wait for this animation to complete,
  if (param.state == AnimationState_Completed)
  {
    // INDEX is in the limit
    if ((INDEXSTART <= INDEX) && (INDEX <= INDEXSTOP))
    { 
      // Restart the animation
      ANIMATIONS.RestartAnimation(param.index);

      // Countdown counter initialization
      COUNTDOWNCOUNTER = millis();

      // Vertical cut to do
      if ((ISVCUTCOLOR || ISVCUTOFF) && (VCUTCOUNTER <= VCUT))
      {
        // Vertical cut counter incrementation
        if (VCUTCOUNTER > 1) VCUTCOUNTER -= 1;
        else VCUTCOUNTER = 2 * VCUT;

        // Blank or color the strip during the vertical cut
        if (ISVCUTOFF) STRIP.ClearTo(RgbColor(0, 0, 0));
        if (ISVCUTCOLOR) clearToSHADER();

        // Index incrementation
        if (ISINVERTTEMP) INDEX -= 1;
        else INDEX += 1;
      }
      
      // No vertical cut to do
      else
      {
        // Vertical cut counter incrementation
        if (ISVCUTCOLOR || ISVCUTOFF) VCUTCOUNTER -= 1;
        
        // Fil the strip with the bitmap (too large bitmap are crop)
        NEOBMPFILE.Render<BrightShader>(STRIP, SHADER, 0, 0, INDEX, NEOBMPFILE.Width());

        // Index incrementation
        if (ISINVERTTEMP) INDEX -= 1;
        else INDEX += 1;
      }
    }
    
    // INDEX is out of the limit
    else
    {
      // Repeat or bounce to do
      if ((ISREPEAT || ISBOUNCE) && (REPEATCOUNTER > 0))
      {
        // Restart the animation
        ANIMATIONS.RestartAnimation(param.index);

        // Countdown to do
        if (ISCOUNTDOWN && (millis() - COUNTDOWNCOUNTER <= COUNTDOWN))
        {
          // Blank or color the strip during the countdown
          if (ISENDOFF) STRIP.ClearTo(RgbColor(0, 0, 0));
          if (ISENDCOLOR) clearToSHADER();
        }
        // No countdown to do? so let's repeat
        else
        {
          // Repeat counter incrementation
          REPEATCOUNTER -= 1;
          
          //invert invertTemp to bounce
          if (ISBOUNCE) ISINVERTTEMP = !ISINVERTTEMP;
  
          // Index initialization
          if (ISINVERTTEMP) INDEX = INDEXSTOP;
          else INDEX = INDEXSTART;
        }
      }
      
      // Nothing more to do
      else
      {
        // Stop the animation
        ANIMATIONS.StopAnimation(param.index);

        // Blank or color the strip if needed
        if (ISENDOFF) STRIP.ClearTo(RgbColor(0, 0, 0));
        if (ISENDCOLOR) clearToSHADER();
      }
    }
  }
}
