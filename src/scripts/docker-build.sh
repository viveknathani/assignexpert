#!/bin/bash
mkdir execution-area
cp src/scripts/c.sh ./execution-area/
cp src/scripts/cpp.sh ./execution-area/
cp src/scripts/python.sh ./execution-area/
cp src/scripts/java.sh ./execution-area/
docker build -t assignexpert-c -f src/dockerfiles/c ./execution-area
docker build -t assignexpert-cpp -f src/dockerfiles/cpp ./execution-area
docker build -t assignexpert-python -f src/dockerfiles/python ./execution-area
docker build -t assignexpert-java -f src/dockerfiles/java ./execution-area