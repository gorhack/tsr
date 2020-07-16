#!/bin/bash

set -e

git pull -r
./test.sh
git push