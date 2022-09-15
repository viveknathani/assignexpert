#!/bin/sh
g++ /ae/submission.cpp -o /ae/submission 2> /ae/compile.txt; 
i=1
while [ "$i" -le "$1" ]
do
   timeout $2 /usr/bin/time -f '%M-%e' -o /ae/stats$i.txt /ae/submission < /ae/input$i.txt > /ae/submission$i.txt 2> /ae/runtime$i.txt;
   echo $? > /ae/timeout$i.txt; 
   i=$(( i + 1 ))
done
