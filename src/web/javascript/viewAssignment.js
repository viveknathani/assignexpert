document.addEventListener("DOMContentLoaded", displayAssignment());

let assignmentData;

function displayAssignment() {
   let assignmentId = window.location.pathname.substring('/assignment/'.length);
   assignmentId = assignmentId.substring(0, assignmentId.indexOf('/view'));
   fetch(`/api/assignment/${assignmentId}`, {
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
   document.getElementById("assignmentTitle").innerText = assignmentData.assignment.title;
   if(assignmentData.difficultyLevel == "EASY") {
      document.getElementById("difficulty").style.backgroundColor = "rgb(84, 196, 233)";
   }
   else if(assignmentData.difficultyLevel == "MEDIUM") {
      document.getElementById("difficulty").style.backgroundColor = "rgb(204, 222, 10)";
   }
   else if(assignmentData.difficultyLevel == "DIFFICULT") {
      document.getElementById("difficulty").style.backgroundColor = "red";
   }
   document.getElementById("score").innerText = assignmentData.assignment.points + " points";
   document.getElementById("description").innerText = assignmentData.assignment.description;
   document.getElementById("sampleInput").innerText = assignmentData.assignment.sampleInput;
   document.getElementById("sampleOutput").innerText = assignmentData.assignment.sampleOutput;
   document.getElementById("constraints").innerText = assignmentData.assignment.constraints;
   document.getElementById("timeLimit").innerText = assignmentData.assignment.timeLimitSeconds;
   document.getElementById("memoryLimit").innerText = assignmentData.assignment.memoryLimitMB;
}