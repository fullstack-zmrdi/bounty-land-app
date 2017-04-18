#!/bin/bash

# Usage
# add file you want to encrypt into <platform>/signing
# then ./scripts/encrypt.sh <platform> <password> <filename>
# original file will be removed
openssl aes-256-cbc -k "$2" -in "$1/signing/$3" -out "$1/signing/$3.enc" -a
rm "$1/signing/$3"
