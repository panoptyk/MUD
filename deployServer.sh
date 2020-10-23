#!/bin/bash
# usage deployServer.sh <path_to_server_dir>

if [ -z "$1" ]; then
    echo "No argument supplied"
    echo "-usage: deployServer.sh <path_to_server_dir>"
else
    mkdir -p $1

    cp -ar client/dist $1
    cp -a server/config/* $1

    ln -s "$(readlink -f server/lib/server.js)" $1/server.js
fi


