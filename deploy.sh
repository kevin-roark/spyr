#!/bin/bash

export SPYR_IO_URL=http://specialmagicyellingroom:3001

git pull

cd spyr-web; make; cd ..;

forever spyr-presence/index.js &

forever spyr-sounder/index.js &

forever spyr-io/index.js &

forever spyr-web/index.js &

sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
