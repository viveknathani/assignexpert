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
   document.getElementById("assignmentTitle").innerHTML = assignmentData.assignment.title + document.getElementById("assignmentTitle").innerHTML;
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
   document.getElementById("timeLimit").innerText = `${assignmentData.assignment.timeLimitSeconds}s`;
   document.getElementById("memoryLimit").innerText = `${assignmentData.assignment.memoryLimitMB} MB`;
}

const editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/c_cpp");
editor.setShowPrintMargin(false);

const languageMenu = document.getElementById("language");
languageMenu.addEventListener('change', (event) => {
   let language = event.target.value;
   language = (language === 'c' || language === 'cpp') ? 'c_cpp' : language;
   editor.session.setMode(`ace/mode/${language}`);
});

const themeMenu = document.getElementById("theme");
themeMenu.addEventListener('change', (event) => {
   editor.setTheme(`ace/theme/${event.target.value}`);
});

const fontSizeMenu = document.getElementById("font-size");
fontSizeMenu.addEventListener('change', (event) => {
   editor.setFontSize(event.target.value);
});

const submitCode = function (e) {
   e.preventDefault();
   console.log(editor.session.getValue());
}

document.addEventListener('DOMContentLoaded', function() {
   document.getElementById('code-submit').addEventListener('click', submitCode);
});
