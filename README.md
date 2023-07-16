# ImagePainting2

## Introduction

![DSCN1062](https://github.com/jbreizh/imagepainting2/assets/2498942/7e9e492f-5bf0-4190-b320-43653a29ce49)

New version of ImagePainting, but i want to keep the first version. So here is the second version.

Basically the same, the main difference is that i give up the smartphone app. Phonegap is dead (so no easy way to compile it for android) and iOS is so closed that i can't make an app without paying....
Now the frontend is directly store and serve by the ESP8266 as a webpage. It work for any device with a decent browser (computer, android and iOS....).

Everything seems to work with the last board/tool/library upgrade (july 2023).

## Description

![LightScythe](https://github.com/jbreizh/imagepainting2/assets/2498942/f1ae6f3f-9429-4f29-a689-9bd6fdb48098)

Existing project on the topic like Adafruit [NeoPixel Painter](https://learn.adafruit.com/neopixel-painter/overview) or [Light Painting with Raspberry Pi](https://learn.adafruit.com/light-painting-with-raspberry-pi/overview) have been a great source of inspiration/information, but i find those too complicated and unpractical on the field. You need too much hardware and you can't be far from your computer to load other image or tweak parameters.

My project is base on hardware and use simplicity. All you need is an USB battery bank, a LED Strip, an ESP8266 board and a webbrowser (computer of course but mainly smartphone).

After a simple hardware assembly and flashing my code, all actions (image upload/delete, start, pause, stop, light) and parameters (delay, brightness, repeat, bounce, invert) are send through your smartphone. So load your smartphone with your picture and you are ready to shoot.

## Documentation

[See Wiki](https://github.com/jbreizh/imagepainting2/wiki)

## Picture pack

I have put you some picture inside a [picture pack](https://github.com/jbreizh/imagePaintingPack).

This picture come from the commercial project [Pixelstick](http://www.thepixelstick.com/index.html) and [Magilight](https://www.fotorgear.com/products/magilight).
