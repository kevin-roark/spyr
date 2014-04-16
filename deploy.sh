#!/bin/bash

export SPYR_IO_URL=http://specialmagicyellingroom.com:3001

git pull

cd spyr-web; make; cd ..;

forever start spyr-presence/index.js

forever start spyr-sounder/index.js

forever start spyr-io/index.js

forever start spyr-web/index.js

sudo iptables -t nat -I PREROUTING -p tcp --dport 80 -j REDIRECT --to-port 3000
