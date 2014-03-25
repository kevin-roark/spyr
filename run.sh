#!/bin/bash

export NODE_ENV=development

node spyr-presence/index.js &

node spyr-sounder/index.js &

node spyr-io/index.js &

node spyr-web/index.js &

wait
