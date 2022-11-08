document.addEventListener("DOMContentLoaded", displayAssignment());

let assignmentData;
let holdPoints;

const slider = document.getElementById("releasePoints").firstElementChild.nextElementSibling;
console.log(slider);

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
   
   console.log(assignmentData.assignment.holdPoints);
   if(!assignmentData.assignment.holdPoints){
      slider.innerText = "Release Points";
      slider.style.right = "0%";
      holdPoints = false;
   }
   else {
      slider.innerText = "Hold Points";
      slider.style.right = "100%";
      holdPoints = true;
   }
   setupEditor();
}

function setupEditor() {
   const userData = JSON.parse(localStorage.getItem("user"));
   const editor = ace.edit("editor");
   editor.setTheme(`ace/theme/${userData.editorTheme}`);
   editor.setShowPrintMargin(false);
   const languageMenu = document.getElementById("language");
   let acceptedLanguages = assignmentData.assignment.acceptedLanguages;
   acceptedLanguages = acceptedLanguages.substring(1);
   acceptedLanguages = acceptedLanguages.substring(0, acceptedLanguages.indexOf("}"));
   acceptedLanguages = acceptedLanguages.split(",")
   const firstLanguage = acceptedLanguages[0];
   const editorLanguage = (firstLanguage === 'c' || firstLanguage === 'cpp') ? 'c_cpp' : firstLanguage;
   editor.session.setMode(`ace/mode/${editorLanguage}`);
   for (const language of acceptedLanguages) {
      const optionElement = document.createElement('option');
      optionElement.value = language;
      optionElement.innerText = language;
      languageMenu.appendChild(optionElement);
   }
   languageMenu.addEventListener('change', (event) => {
      let language = event.target.value;
      language = (language === 'c' || language === 'cpp') ? 'c_cpp' : language;
      editor.session.setMode(`ace/mode/${language}`);
   });

   const fontSizeMenu = document.getElementById("font-size");
   fontSizeMenu.addEventListener('change', (event) => {
      editor.setFontSize(event.target.value);
   });
}

const submitCode = function (e) {
   const editor = ace.edit("editor");
   e.preventDefault();
   let assignmentId = window.location.pathname.substring('/assignment/'.length);
   assignmentId = assignmentId.substring(0, assignmentId.indexOf('/view'));
   fetch('/api/submission', {
      method: 'POST',
      headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         assignmentId: assignmentId,
         code: editor.session.getValue(),
         lang: languageMenu.options[languageMenu.selectedIndex].value
      })
   }).then((response) => response.json())
   .then((data) => {
      pollServerAndUpdateDOM(data.submissionId);
   })
   .catch(err => {
      console.log(err);
   })
}

function pollServerAndUpdateDOM(submissionId) {
   const interval = setInterval(() => {
      fetch(`/api/submission/${submissionId}`, {
         method: 'GET',
         headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
         },
      }).then((response) => response.json())
      .then((data) => {
         console.log(data);
         if (data.resultStatus) {
            const resultArea = document.getElementById("result");
            while (resultArea.firstChild) {
               resultArea.removeChild(resultArea.firstChild);
            }
            resultArea.innerHTML = `Status: ${data.resultStatus}. Click <a href="/submission/${submissionId}">here</a> for details.`
            resultArea.style.display = 'block';
            clearInterval(interval);
            return;
         }
      })
      .catch(err => {
         console.log(err);
      })
   }, 3000)
}

document.addEventListener('DOMContentLoaded', function() {
   document.getElementById('code-submit').addEventListener('click', submitCode);
});


const data = JSON.parse(localStorage.getItem("user"));
if (data.isStudent) {
   console.log("Student");
   const solutionArea = document.getElementById("solution");
   solutionArea.style.display = 'block';
   toggleContainer.style.display = 'none';
}

function viewSubmissions() {
   let assignmentId = window.location.pathname.substring('/assignment/'.length);
   assignmentId = assignmentId.substring(0, assignmentId.indexOf('/view'));
   window.location.href = `/submissions/${assignmentId}`;
}

function holdReleasePoints() {
   if(holdPoints){
      document.getElementById("releaseText").innerHTML = "";
      document.getElementById("holdPoints").innerHTML = "Hold Points";
      slider.innerText = "Release Points";
      slider.classList.remove("rightToLeft");
      slider.classList.add("leftToRight");
      holdPoints = false;
   }
   else {
      document.getElementById("holdPoints").innerHTML = "";
      document.getElementById("releaseText").innerHTML = "Release Points";
      slider.innerText = "Hold Points";
      slider.classList.remove("leftToRight");
      slider.classList.add("rightToLeft");
      holdPoints = true;
   }
   let assignmentId = window.location.pathname.substring('/assignment/'.length);
   assignmentId = assignmentId.substring(0, assignmentId.indexOf('/view'));

   fetch(`/api/assignment`, {
      method: 'PUT',
      headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json'
      },
      body: JSON.stringify({
         assignment: {
            id: assignmentId,
            holdPoints: !assignmentData.assignment.holdPoints
         }
      })
   }).then((res) => {
      if (res.status === 204) {
         return;
      }
      return res.json();
   }).then((data) => {
      console.log(data);
   }).catch((err) => {
      console.log(err);
   });
}
