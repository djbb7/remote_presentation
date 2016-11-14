# Remote Slide Presentations - Using WebRTC

The aim of this project is to allow users to present their slide deck remotely on another device using only HTML5 technologies. In this way, the presentation can be done from almost any device, without any extra software.

The initial intention is to make video projectors that work without cables. They are simply peers waiting for the presenter to connect via WebRTC.

This prototype is currently under development. For contributions please get in touch with me: danielbruzual [at] gmail.com.

### Contents ###
This project contains a small signaling server written in node.js, based on socket.io.

There are also the projector and presenter code files, written in vanilla JS using HTML5 technologies. PDF.js is used for rendering the PDF files.

### How it works ###

``Screenshots coming soon``

Presenter drags his PDF slides to the browser window, they get rendered on his screen and transmitted over a WebRTC data channel to the projector side, and rendered there. Every action performed on the presenter side is replicated on the projector.
