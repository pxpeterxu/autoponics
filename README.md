# autoponics

Monitors and controls an automated aquaponics system using an Intel Edison and Express servers

## API description
The API on the Edison is purposefully minimal, since we want the majority of logic to be on a separate, more powerful web server.

The following API endpoints are built/planned:

* **Thermometer**: 
  * `GET /tempMonitor`: gets the latest temperature from the temperature sensor, in Fahrenheit.
    * Sample response: `{ temperature: 80.14 }`
* **Heater**:
  * `POST /tempControl/set/78` (`/tempControl/set/:temperature`): sets the heater to a target temperature (Fahrenheit)
    * Sample response:
    ```javascript
    {
      temperature: 78,  // (whatever you set)
      angle: 48,  // (for debugging: angle the servo ended up)
    }
    ```
  * `GET /tempControl`: gets the current heater temperature setting (output exact same as POST request)
* **Lights**:
  * `POST /lights/on and /lights/off`: turns the lights on or off using the relay
  * `GET /lights`: gets the current state of lights
    * Sample response: `{ on: true }`
* **Ventilation**:
  * `POST /ventilation/on and /ventilation/off`: turns the ventilation on or off using the relay
  * `GET /ventilation`: gets the current state of the ventilation
    * Sample response: `{ on: true }`
* **Pump**:
  * `POST /pump/on and /pump/off`: turns the pump on or off using the relay
  * `GET /pump`: gets the pump state of lights
    * Sample response: `{ on: true }`    
* **Feeder**: 
  * `POST /feederControl/feed`: dispenses food

* **NOTE**: while in development, all POST endpoints are also accessible with GET requests.

## Intel Edison

### Hardware Setup

1. Set voltage to 5V
2. Connect the Grove-LCD RGB Backlight and Temperature&Humidity Sensor (High-Accuracy & Mini) to any I2C port
3. Connect the ventilation relay to port D4
4. Connect the temperature servo to port D5
5. Connect the feeder servo to port D6
6. Connect the light relay to port D7
7. Connect the pump relay to port D8

### Software Setup

#### Prerequisites

Install gulp if you haven't already

```
npm install -g gulp
```

#### Installation

```
git clone git@github.com:pxpeterxu/autoponics.git
npm install
gulp build-server
```

#### Running the server

```
node start
```
