#!/bin/bash

# TODO: add proposal param verification
echo "Args passed [ $@ ]"

# check argument passed to docker run command
./repro-check.sh -p $1 
