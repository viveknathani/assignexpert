const testCasesContainer = document.querySelector("#testCasesContainer");
let numOfTestCases = 1;

let assignmentData = {
   assignment: {},
   testCases: []
}

function addNewCase() {
   if(testCasesContainer!=null){
      testCasesContainer.insertAdjacentHTML("beforeend", 
      "<div class='testCaseContainer'><h4>Input: </h4><textarea class='inputOutput'></textarea><br><br><h4>Output: </h4><textarea class='inputOutput'></textarea><br><h4 style='display: inline-block;'>Points: </h4><input class='smallInput' style='width: 9vw; margin-left: 1vw;' type='text' autocomplete='off' placeholder='Enter Points'></div>");
      numOfTestCases = numOfTestCases + 1;
   }
}

function removeCase() {
   if(numOfTestCases>1){
      testCasesContainer?.lastElementChild?.remove();
      numOfTestCases = numOfTestCases - 1;
   }
}

function showTemplates(yesOrNO) {
   if(yesOrNO){
      document.getElementById("templates").style.display = "block";
   }
   else {
      document.getElementById("templates").style.display = "none";
   }
}

function languageChange(language){
   if(language == 0){
      if(document.getElementById("c").checked){
         document.getElementById("cTemplate").style.display = "inline-block";
      }
      else{
         document.getElementById("cTemplate").style.display = "none";
      }
   }
   else if(language == 1){
      if(document.getElementById("cpp").checked){
         document.getElementById("cppTemplate").style.display = "inline-block";
      }
      else{
         document.getElementById("cppTemplate").style.display = "none";
      }
   }
   else if(language == 2){
      if(document.getElementById("java").checked){
         document.getElementById("javaTemplate").style.display = "inline-block";
      }
      else{
         document.getElementById("javaTemplate").style.display = "none";
      }
   }
   else {
      if(document.getElementById("python").checked){
         document.getElementById("pythonTemplate").style.display = "inline-block";
      }
      else{
         document.getElementById("pythonTemplate").style.display = "none";
      }
   }
}



// Create Assignment related functions ///////////////////////////////////////


function createAssignment() {
   gatherData();
}

function gatherData() {

   assignmentData.assignment.id = "";

   assignmentData.assignment.title = document.getElementById("assignmentName").value;

   assignmentData.assignment.description = document.getElementById("problemStatement").value;

   assignmentData.assignment.sampleInput = document.getElementById("sampleInput").value;

   assignmentData.assignment.sampleOutput = document.getElementById("sampleOutput").value;

   assignmentData.assignment.constraints = document.getElementById("constraints").value;

   assignmentData.assignment.timeLimitSeconds = document.getElementById("timeLimit").value;

   assignmentData.assignment.memoryLimitMB = Number(document.getElementsByName("memoryLimit")[0].value);

   assignmentData.assignment.points = Number(document.getElementById("points").value);

   assignmentData.assignment.deadline = document.getElementById("Deadline").value.toString();

   assignmentData.assignment.difficultyLevel = document.getElementsByName("difficulty")[0].value;

   if(document.getElementsByName("showPoints")[0].checked)
      assignmentData.assignment.holdPoints = false;
   else if(document.getElementsByName("showPoints")[1].checked)
      assignmentData.assignment.holdPoints = true;
   else 
      assignmentData.assignment.holdPoints = null;

   

   if(document.getElementsByName("template")[0].checked)
      assignmentData.assignment.hasTemplate = true;
   else if(document.getElementsByName("template")[1].checked)
      assignmentData.assignment.hasTemplate = false;
   else 
      assignmentData.assignment.hasTemplate = null;

   getLanguages();

   if((checkForNull() && getTemplateData() && getTestCasesData()) != true){
      console.log("exiting");
      return;
   }

   let classId = window.location.pathname.substring('/assignment/'.length);
   classId = classId.substring(0, classId.indexOf('/create'));
   assignmentData.assignment.classId = classId
   console.log(assignmentData);
   fetch("/api/assignment/", {
      method: 'POST',
      headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(assignmentData)
   })
   .then(res => res.json())
   .then(res => {
      console.log(res);
   })
}

function getLanguages() {
   let languages = [];
   for(i=0; i<4; i++) {
      console.log(document.getElementsByName("languages")[i].checked);
      if(document.getElementsByName("languages")[i].checked)
         languages.push(document.getElementsByName("languages")[i].value);
   }
   assignmentData.assignment.acceptedLanguages = languages;
}

function checkForNull() {
   console.log("in checknull");
   console.log(assignmentData.assignment.points);
   if(assignmentData.assignment.title == ""){
      console.log("titlenull");
      document.getElementById("assignmentName").focus();
      return false;
   }
   else if(assignmentData.assignment.description == ""){
      console.log("descriptionnull");
      document.getElementById("problemStatement").focus();
      return false;
   }
   else if(assignmentData.assignment.sampleInput == ""){
      console.log("3");
      document.getElementById("sampleInput").focus();
      return false;
   }
   else if(assignmentData.assignment.sampleOutput == ""){
      console.log("4");
      document.getElementById("sampleOutput").focus();
      return false;
   }
   else if(assignmentData.assignment.constraints == ""){
      console.log("5");
      document.getElementById("constraints").focus();
      return false;
   }
   else if(assignmentData.assignment.timeLimitSeconds == ""){
      console.log("6");
      document.getElementById("timeLimit").focus();
      return false;
   }
   else if(assignmentData.assignment.memoryLimitMB == null){
      console.log("7");
      document.getElementsByName("memoryLimit")[0].focus();
      return false;
   }
   else if(assignmentData.assignment.points == "" || Number.isNaN(assignmentData.assignment.points)){
      console.log("8");
      document.getElementById("points").focus();
      return false;
   }
   else if(assignmentData.assignment.deadline == ""){
      console.log("9");
      document.getElementById("Deadline").focus();
      return false;
   }
   else if(assignmentData.assignment.difficultyLevel == null){
      console.log("10");
      document.getElementsByName("difficulty")[0].focus();
      return false;
   }
   else if(assignmentData.assignment.holdPoints == null){
      console.log("11");
      document.getElementsByName("showPoints")[0].focus();
      return false;
   }
   else if(assignmentData.assignment.hasTemplate == null){
      console.log("in hastemplate");
      document.getElementsByName("template")[0].focus();
      return false;
   }
   else if(assignmentData.assignment.acceptedLanguages.length == 0){
      console.log("in lang");
      document.getElementsByName("languages")[0].focus();
      return false;
   }
   else return true;
}

function getTemplateData() {
   console.log("in templatedata");
   if(assignmentData.assignment.hasTemplate){
      assignmentData.templates = [];
      for(i=0; i<4; i++) {
         if(document.getElementsByName("languages")[i].checked && i==0){
            cTemplate = {}
            cTemplate.id = "";
            cTemplate.assignmentId = "";
            cTemplate.lang = "c";
            
            cTemplate.preSnippet = document.getElementById("cPreSnippet").value;

            if(cTemplate.preSnippet == ""){
               document.getElementById("cPreSnippet").focus();
               return false;
            }

            cTemplate.snippet = document.getElementById("cSnippet").value;

            if(cTemplate.snippet == ""){
               document.getElementById("cSnippet").focus();
               return false;
            }

            cTemplate.postSnippet = document.getElementById("cPostSnippet").value;

            if(cTemplate.postSnippet == ""){
               document.getElementById("cPostSnippet").focus();
               return false;
            }

            assignmentData.templates.push(cTemplate);
         }
         else if(document.getElementsByName("languages")[i].checked && i==1){
            cppTemplate = {}
            cppTemplate.id = "";
            cppTemplate.assignmentId = "";
            cppTemplate.lang = "cpp";
            
            cppTemplate.preSnippet = document.getElementById("cppPreSnippet").value;

            if(cppTemplate.preSnippet == ""){
               document.getElementById("cppPreSnippet").focus();
               return false;
            }

            cppTemplate.snippet = document.getElementById("cppSnippet").value;

            if(cppTemplate.snippet == ""){
               document.getElementById("cppSnippet").focus();
               return false;
            }

            cppTemplate.postSnippet = document.getElementById("cppPostSnippet").value;

            if(cppTemplate.postSnippet == ""){
               document.getElementById("cppPostSnippet").focus();
               return false;
            }

            assignmentData.templates.push(cppTemplate);
         }
         else if(document.getElementsByName("languages")[i].checked && i==2){
            javaTemplate = {}
            javaTemplate.id = "";
            javaTemplate.assignmentId = "";
            javaTemplate.lang = "java";
            
            javaTemplate.preSnippet = document.getElementById("javaPreSnippet").value;

            if(javaTemplate.preSnippet == ""){
               document.getElementById("javaPreSnippet").focus();
               return false;
            }

            javaTemplate.snippet = document.getElementById("javaSnippet").value;

            if(javaTemplate.snippet == ""){
               document.getElementById("javaSnippet").focus();
               return false;
            }

            javaTemplate.postSnippet = document.getElementById("javaPostSnippet").value;

            
            if(javaTemplate.postSnippet == ""){
               document.getElementById("javaPostSnippet").focus();
               return false;
            }

            assignmentData.templates.push(javaTemplate);
         }
         else if(document.getElementsByName("languages")[i].checked && i==3){
            pythonTemplate = {}
            pythonTemplate.id = "";
            pythonTemplate.assignmentId = "";
            pythonTemplate.lang = "python";
            
            pythonTemplate.preSnippet = document.getElementById("pythonPreSnippet").value;

            if(pythonTemplate.preSnippet == ""){
               document.getElementById("pythonPreSnippet").focus();
               return false;
            }

            pythonTemplate.snippet = document.getElementById("pythonSnippet").value;

            if(pythonTemplate.snippet == ""){
               document.getElementById("pythonSnippet").focus();
               return false;
            }

            pythonTemplate.postSnippet = document.getElementById("pythonPostSnippet").value;

            if(pythonTemplate.postSnippet == ""){
               document.getElementById("pythonPostSnippet").focus();
               return false;
            }

            assignmentData.templates.push(pythonTemplate);
         }
            
      }
   }
   else return true;
}

function getTestCasesData() {
   console.log("in testcase");
   let currentTestCase = document.getElementById("firstContainer");
   while(currentTestCase != null){
      let testCaseData = {};
      testCaseData.id = "";
      testCaseData.assignmentId = "";

      childTestCase = currentTestCase.firstElementChild;
      childTestCase = childTestCase.nextElementSibling;
      testCaseData.input = childTestCase.value;

      if(testCaseData.input == ""){
         childTestCase.focus();
         return false;
      }

      childTestCase = childTestCase.nextElementSibling;
      childTestCase = childTestCase.nextElementSibling;
      childTestCase = childTestCase.nextElementSibling;
      childTestCase = childTestCase.nextElementSibling;
      testCaseData.output = childTestCase.value;

      if(testCaseData.output == ""){
         childTestCase.focus();
         return false;
      }

      childTestCase = childTestCase.nextElementSibling;
      childTestCase = childTestCase.nextElementSibling;
      childTestCase = childTestCase.nextElementSibling;
      testCaseData.points = Number(childTestCase.value);

      if(testCaseData.points == "" || Number.isNaN(testCaseData.points)){
         childTestCase.focus();
         return false;
      }

      assignmentData.testCases.push(testCaseData);
      currentTestCase = currentTestCase.nextElementSibling;
   }
   return true;
}
