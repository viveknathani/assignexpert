#!/bin/sh
javac /ae/Submission.java 2> /ae/compile.txt;
i=1
while [ "$i" -le "$1" ]
do
   timeout $2 /usr/bin/time -f '%M-%e' -o /ae/stats$i.txt java -cp /ae/ Submission < /ae/input$i.txt > /ae/submission$i.txt 2> /ae/runtime$i.txt;
   echo $? > /ae/timeout$i.txt; 
   i=$(( i + 1 ))
done
