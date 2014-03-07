spyr
====

SPYR - special magic yelling room

## Architecture
Inspired by weplay.io

### spyr
equivalent to the main weplay

### spyr-web
equivalent to weplay-web

### spyr-audio
equivalent to weplay's emulator

## Spyr audio ideas
clients press a button and record a sound of fixed length (0.25 - 0.5 seconds probably). That sounds is then sent over socket.io to spyr-audio, which adds all the sounds it gets in a fixed (0.1 - 0.2 second) time, and then broadcasts the combined sound as one buffer to all clients. Clients constantly play sounds like frames of the emulator. profit.
