document.addEventListener("DOMContentLoaded", getAssignment());

let assignmentData;

function getAssignment() {
   let assignmentId = window.location.pathname.substring('/assignment/'.length);
   assignmentId = assignmentId.substring(0, assignmentId.indexOf('/edit'));

   fetch(`/api/assignment/${assignmentId}`, {
      method: 'GET',
      headers: {
         Accept: 'application/json',
      },
   })
   .then(res => res.json())
   .then(res => {
      if(res!=null){
         assignmentData = res;
         setFields();
      }
   })
}

function setFields() {
   document.getElementById("assignmentName").value = assignmentData.assignment.title;
   document.getElementById("problemStatement").value = assignmentData.assignment.description;
   document.getElementById("sampleInput").value = assignmentData.assignment.sampleInput;
   document.getElementById("sampleOutput").value = assignmentData.assignment.sampleOutput;
   document.getElementById("constraints").value = assignmentData.assignment.constraints;
   document.getElementById("timeLimit").value = assignmentData.assignment.timeLimitSeconds;
   document.getElementById("points").value = assignmentData.assignment.points;
   let deadline = assignmentData.assignment.deadline;
   deadline = deadline.substring(0, "yyyy-mm-dd".length);
   document.getElementById("Deadline").value = deadline;
   let acceptedLanguages = assignmentData.assignment.acceptedLanguages;
   acceptedLanguages = acceptedLanguages.substring(1);
   acceptedLanguages = acceptedLanguages.substring(0, acceptedLanguages.indexOf("}"));
   acceptedLanguages = acceptedLanguages.split(",")
   for(i=0; i<acceptedLanguages.length; i++){
      if(acceptedLanguages[i]=="c"){
         document.getElementsByName("languages")[0].checked = true;
      }
     else if(acceptedLanguages[i]=="cpp"){
         document.getElementsByName("languages")[1].checked = true;
      }
      else if(acceptedLanguages[i]=="java"){
         document.getElementsByName("languages")[2].checked = true;
      }
      else if(acceptedLanguages[i]=="python"){
         document.getElementsByName("languages")[3].checked = true;
      }
   }
   setTemplates();
}

function setTemplates() {
   if(assignmentData.assignment.hasTemplate){
      document.getElementById("templates").style.display = "block";
      for(i=0; i<assignmentData.templates.length; i++){
         if(assignmentData.templates[i].lang == "c"){
            document.getElementById("cTemplate").style.display = "inline-block";
            document.getElementById("cPreSnippet").value = assignmentData.templates[i].preSnippet;
            document.getElementById("cSnippet").value = 
            assignmentData.templates[i].snippet;
            document.getElementById("cPostSnippet").value = 
            assignmentData.templates[i].postSnippet;
         }
         else if(assignmentData.templates[i].lang == "cpp"){
            document.getElementById("cppTemplate").style.display = "inline-block";
            document.getElementById("cppPreSnippet").value = assignmentData.templates[i].preSnippet;
            document.getElementById("cppSnippet").value = 
            assignmentData.templates[i].snippet;
            document.getElementById("cppPostSnippet").value = 
            assignmentData.templates[i].postSnippet;
         }
         else if(assignmentData.templates[i].lang == "java"){
            document.getElementById("javaTemplate").style.display = "inline-block";
            document.getElementById("javaPreSnippet").value = assignmentData.templates[i].preSnippet;
            document.getElementById("javaSnippet").value = 
            assignmentData.templates[i].snippet;
            document.getElementById("javaPostSnippet").value = 
            assignmentData.templates[i].postSnippet;
         }
         else if(assignmentData.templates[i].lang == "python"){
            document.getElementById("pythonTemplate").style.display = "inline-block";
            document.getElementById("pythonPreSnippet").value = assignmentData.templates[i].preSnippet;
            document.getElementById("pythonSnippet").value = 
            assignmentData.templates[i].snippet;
            document.getElementById("pythonPostSnippet").value = 
            assignmentData.templates[i].postSnippet;
         }
      }
   }
}

function updateAssignment() {
   gatherData();
}

function gatherData() {

   let assignmentId = window.location.pathname.substring('/assignment/'.length);
   assignmentId = assignmentId.substring(0, assignmentId.indexOf('/edit'));

   assignmentData.assignment.id = assignmentId;

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

   getLanguages();

   getTemplateData();

   console.log(assignmentData);

   fetch("/api/assignment", {
      method: 'PUT',
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