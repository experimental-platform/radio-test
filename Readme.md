## Project goal

Our objective was to build software on our Experimental Platform that should be able to record and playback signals from a hardware radio module that reads signals from cheap and ubiquitous 434 MHz devices. Those devices communicate with or control things like AC sockets, alarm systems (window switches, PIR-sensors) and many other simple sensor hardware. The user then should be able to control those appliances with any internet enabled device through a browser.
![image](https://40.media.tumblr.com/c31abcbb262d0ad06a740e1c47c1777c/tumblr_inline_nwvz24wE6a1tzfota_540.jpg)

A major task was to decide which soft-/ hardware combination would lead to our goal with the least expensive but still good performing combination of both. Another requirement was the simplicity of the whole project, so that the community could enhance our reference project or can simply adopt it to their needs. Hardware parts should be easy to obtain from local vendors or online shops.

The Experimental Platform software frontend should be easy to work with like recording signals, eliminate identical signals, adding each signal to a database and control them via a button click or even with your voice. We made the frontend with AngularJS (JavaScript with the browser), backend is node.js (JavaScript on server).

The firmware for the hardware module was designed to deliver constant error free receiving and transmitting of signals controlled by the software frontend from the Experimental Platform. 

## Overview

**Hardware**

They are all among us - simple, cheap and quite unsecure radio devices which work on frequencies around 434MHz. Almost every tinkerer has some of those devices lying around either in form of a remote that controls power sockets or an alarm system that is equipped with different sensors that communicate by radio to their home base.

![image](https://40.media.tumblr.com/bbc26d5f12b40b9a9d2380989eaf4adc/tumblr_inline_nwvz56hXOk1tzfota_540.jpg)

What if you could control and communicate with those devices not only locally with the remote but from everywhere with our Experimental Platform? Use your PC, cell phone or tablet at home or en route to do things in your home. You could even link those "dumb" devices to events like if the PIR-sensor gets activated then switches on the light and then send a message to your mobile phone. **In one sentence: Dumb gets smart with the help of Experimental Platform.**

For our project we grabbed a cheap combination of a remote and three AC-power sockets from a local vendor for about 15 Euros ([http://www.pollin.de/shop/dt/NjI2ODQ0OTk-/Haustechnik/Funkschaltsysteme/Funksteckdosen_Set_mit_3_Steckdosen_FLAMINGO_FA500S_3.html)](http://www.pollin.de/shop/dt/NjI2ODQ0OTk-/Haustechnik/Funkschaltsysteme/Funksteckdosen_Set_mit_3_Steckdosen_FLAMINGO_FA500S_3.html) For the hardware module prototyping we used a nice development board sold by [https://lowpowerlab.com/](https://lowpowerlab.com/) called "Moteino-USB" for about $27 ([https://lowpowerlab.com/shop/moteinousb](https://lowpowerlab.com/shop/moteinousb)). It's a ATMega328 (8-bit microcontroller used on the famous "Arduino UNO"-board) and RFM69 (434MHz transceiver) combination which has also a serial-to-USB IC on board. You don't need to use this special development board - you could do any combination of those parts which are broadly available - provided you can connect everything in the right manner by yourself.

![image](https://41.media.tumblr.com/8551fbf7d19debc381acf9402974c559/tumblr_inline_nwvz8d9HvK1tzfota_540.jpg)

**Software - Experimental Platform**

If you don't know how you can program or deploy apps with our Experimental Platform by now (we will show in detail later for our project) just be briefed that you can choose from five different flavors of programming languages. Build or adapt your app with Docker, PHP, Node.js, Python or Rails. Everything is open source and some example apps we developed are already hosted on github, so you get a quick access platform-independent to program and build your desired app.

**Firmware - Microcontroller**

As an ATMega328 microcontroller is on our development board we can use the simple but effective Arduino IDE ([https://www.arduino.cc](https://www.arduino.cc)) to program and flash our firmware. For the RFM69 radio module there was no library ready (at least for On-off keying (OOK) modulation used in a lot of 434MHz devices) but in the community there were some users who did quite some work on it and we used some of that for our software library.
The code for working with the module was almost completely developed on our own and is available on the github repository as are all other files and instructions.

## Step-by-step instructions

We start with the software.

If you haven't done it yet, you first have to generate a SSH public key for the communication with your platform (log in to your Experimental Platform and go to "Configuration"-page "SSH Public Keys", copy your generated public key into the field provided and add it to the existing keys).

Then go to the "My Apps" page.

![image](https://41.media.tumblr.com/d821a4336b1c36c17bea2a141a3108eb/tumblr_inline_nwvwlbyFQv1tzfota_540.png)

Klick on the orange button "New App" on the upper right corner and the page with detailed instructions comes up. Later you don't need to go to the page to deploy an app - this is just for the introduction on how to deploy apps now or for later if you forgot the git-command chain syntax.

![image](https://40.media.tumblr.com/136a2a2ef7e372b6928202bea0cb9a22/tumblr_inline_nwvwqsVOit1tzfota_540.png)

If you click for example "Node.js" on the next page you will see the instructions how to get your apps deployed.

![image](https://41.media.tumblr.com/0fa613bc9214059a66e3e3686bdf11af/tumblr_inline_nwvwrbyNyw1tzfota_540.png)

Now open a terminal or command line on your preferred operating system. You will of cause have an installation with at least a commandline git environment to get all the git-commands executed before doing anything on the console. A search for ""git for Windows" or a packetmanager installation like "apt-get install git" on a Ubuntu will get you there.

Our app for the radio module is like all other available apps hosted on our github page [https://github.com/experimental-platform](https://github.com/experimental-platform) . It's called "radio-test".

![image](https://36.media.tumblr.com/c609759a6e1caeffc43192b17d1c8831/tumblr_inline_nwvwtuA1GC1tzfota_540.png)

Go to your command line and type the following:

```
git clone https://github.com/experimental-platform/radio-test
```
 For all the non-gitters among us - this is the instruction to make an exact copy of the git repository named "radio-test".

Next change to the directory "radio-test".

Now add the remote platform (your Experimental Platform) to the repository by typing:

```
git remote add platform ssh://dokku@yourIP:8022/radio-test
```

This command might need a bit of explaining. The term "platform" is decided by you. You can name it like you want, but you have to use the name later for pushing the repository to your Experimental Platform. "yourIP" of cause is the IP of your Experimental Platform, substitute it with the raw IP or something like "myMachine.local" (Remember you initially named your platform). Last "radio-test" is the path where the app looks for data, so do not change that.

You are almost there - you just have to push the repository to your Experimental Platform with

```
git push platform master
```

![image](https://41.media.tumblr.com/54050f661686a8ba67c559a365d8e073/tumblr_inline_nwvwvtRYZC1tzfota_540.png)

A bit of script working in the background will work and after some time the app should be deployed.

![image](https://40.media.tumblr.com/65180bd7ae4736a4432e2e91890afb92/tumblr_inline_nwvwwzKGTV1tzfota_540.png)

That's all, at least software wise. Your app is deployed and ready to start. But first we have to get our module hardware ready.

Take your Arduino/ RFM69 development board (like Moteino USB or any other DIY combination of both). If you use the Moteino USB the only modification to the board is to solder a wire from pin 4 of the RFM69-module to digital pin 3 of the Arduino.

![image](https://41.media.tumblr.com/7ef99793cc2f7b46af3b3704fcdb88f9/tumblr_inline_nwvzlirvzP1tzfota_540.jpg)

Then you have to locate the Arduino-Sketch and the library files which are also on our github page in the radio-test repository (sketch file "radioEP" and libraries folder "RFM69OOK"). If you haven't done so install an Arduino IDE from [https://www.arduino.cc/en/Main/Software](https://www.arduino.cc/en/Main/Software) .

Copy the library files (folder "RFM69OOK") into your Arduino document-folder under "libraries" (on Windows e.g. C:\Users\yourNameHere\Documents\Arduino\libraries). Then start the Arduino IDE and open the Arduino sketch "radioEP". Under "Tools" choose first the correct board which in our case is "Arduino UNO". Then activate the correct serial port. After that you can upload the sketch to the board.

![image](https://36.media.tumblr.com/a640f31bddcea7d6d21cb4458ef76b1b/tumblr_inline_nwvwy08KTF1tzfota_540.png)

You are almost done! Connect the board with a USB cable to the 
Experimental Platform and start the app by again going to the "My Apps" 
page (which should now display an app like "radio-test"). The app should
 already have been started after deploying, so you can klick on the left
 symbol to open the webpage of the app.
 
![image](https://40.media.tumblr.com/ffd48201eaf735d03d7d101d2affab63/tumblr_inline_nwvwzpefOg1tzfota_540.png)

After
 the webpage opened fetch your remote, click on "+ Add a command" and 
then push the desired button on your remote. If everything went fine the
 command should be recognized and added to the list with the name you 
gave to it.

![image](https://41.media.tumblr.com/18d01095c1fba52907f507d723e3551d/tumblr_inline_nwvx0gdPh51tzfota_540.png)

From now on you can use your Experimental Platform to switch your power sockets via any internet and browser enabled device may it be local or from remote.
And of cause the journey just begins here - you can add any feature to the code you want, fork it, report issues or even do a pull request to add new features into the master branch. Enjoy!

Still questions? Feel free to send any questions or suggestions to [markus.ulsass@protonet.info](markus.ulsass@protonet.info)