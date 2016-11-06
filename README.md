# autoponics

Monitors and controls an automated aquaponics system using an Intel Edison and Express servers

## Intel Edison 

### Hardware Setup

1. Set voltage to 5V
2. Connect the Grove-LCD RGB Backlight and Temperature&Humidity Sensor (High-Accuracy & Mini) to any I2C port
3. Connect the servo to port D5

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
