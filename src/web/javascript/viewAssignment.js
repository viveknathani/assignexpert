document.addEventListener("DOMContentLoaded", displayAssignment());

let assignmentData;

function displayAssignment() {
   let assignmentId;
   fetch("/api/assignment?assignmentId=" + assignmentId, {
      method: 'GET',
      headers: {
         Accept: 'application/json',
      }
   })
   .then(res => res.json())
   .then(res => {
      if(res!=null){
         assignmentData = res;
         showAssignment();
      }
   })
}

function showAssignment() {
   document.getElementById("assignmentTitle").innerText = assignmentData.title;
   document.getElementById("difficulty").innerText = assignmentData.difficultyLevel;
   if(assignmentData.difficultyLevel == "EASY") {
      document.getElementById("difficulty").style.backgroundColor = "rgb(84, 196, 233)";
   }
   else if(assignmentData.difficultyLevel == "MEDIUM") {
      document.getElementById("difficulty").style.backgroundColor = "rgb(204, 222, 10)";
   }
   else if(assignmentData.difficultyLevel == "DIFFICULT") {
      document.getElementById("difficulty").style.backgroundColor = "red";
   }
   document.getElementById("score").innerText = assignmentData.points + " points";
   document.getElementById("description").innerText = assignmentData.description;
   document.getElementById("sampleInput").innerText = assignmentData.sampleInput;
   document.getElementById("sampleOutput").innerText = assignmentData.sampleOutput;
   document.getElementById("constraints").innerText = assignmentData.constraints;
   document.getElementById("timeLimit").innerText = assignmentData.timeLimitSeconds;
   document.getElementById("memoryLimit").innerText = assignmentData.memoryLimitMB;
}