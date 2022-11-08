var show = false;
var showComp = false;
const assignedContainer = document.querySelector(".assignedContainer");
const completedContainer = document.querySelector("#completedContainer");
const arrow = document.querySelector("#arrow");
const arrowC = document.querySelector("#arrowC");
const classId = window.location.pathname.substring('/class/'.length);
let showQuicksOrNot = true;
let showFormOrNot = true;
let showCodeOrNot = true;
let displayMembers = true;



function showAssigned() {
   show = !show;
   if(show && assignedContainer!=null && arrow != null) {
      assignedContainer.classList.add("show");
      arrow.classList.remove("turn90Degreesacw");
      arrow.classList.add("turn90Degreescw");
   }
   else if(show == false && assignedContainer!=null && arrow != null) {
      assignedContainer.classList.remove("show");
      arrow.classList.remove("turn90Degreescw");
      arrow.classList.add("turn90Degreesacw");
   }
}

function showCompleted() {
   showComp = !showComp;
   if(showComp && completedContainer!=null && arrowC != null) {
      completedContainer.classList.add("show");
      arrowC.classList.remove("turn90Degreesacw");
      arrowC.classList.add("turn90Degreescw");
   }
   else if(showComp == false && completedContainer!=null && arrowC != null) {
      completedContainer.classList.remove("show");
      arrowC.classList.remove("turn90Degreescw");
      arrowC.classList.add("turn90Degreesacw");
   }
}

function updateName() {
   const newName = document.getElementById("className").value;
   if(newName != ""){
      console.log("fetching");
      document.body.style.cursor = "wait";
      const inputs = document.getElementsByTagName("INPUT");
      for(let i=0; i<inputs.length; i++) {
         inputs[i].style.cursor = "wait";
      }

      const buttons = document.getElementsByTagName("BUTTON");
      for(let i=0; i<buttons.length; i++) {
         buttons[i].style.cursor = "wait";
      }
      fetch('/api/class/name', {
         method: 'PUT',
         headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({
            classId,
            newName
         })
      })
      .then((res) => {
         document.body.style.cursor = "default";
         for(let i=0; i<inputs.length; i++) {
            inputs[i].style.cursor = "default";
         }
         for(let i=0; i<buttons.length; i++) {
            buttons[i].style.cursor = "default";
         }
         window.location.reload();
      })
      .catch((err) => {
         document.body.style.cursor = "default";
         for(let i=0; i<inputs.length; i++) {
            inputs[i].style.cursor = "default";
         }
         for(let i=0; i<buttons.length; i++) {
            buttons[i].style.cursor = "default";
         }
         console.log(err)
      })
   }
   else {
      console.log("decreasing");
      document.getElementById("editClassName").innerHTML = "Edit Class Name";
      document.getElementById("editClassName").classList.remove("convertToEditForm");
      document.getElementById("editClassName").classList.add("convertToEditButton");
      setTimeout(() => showFormOrNot = true, 200);
   }
}

function gotoAssignmentPage() {
   location.href = `/assignment/${classId}/create`;
}

function showQuicks() {
   userData = JSON.parse(localStorage.getItem("user"));
   if(showQuicksOrNot) {
      if(!userData.isStudent){
         document.getElementById("createAssignment").classList.remove("revertCreateAssButton");
         document.getElementById("editClassName").classList.remove("revertEditNameButton");
         document.getElementById("createAssignment").style.display = "inline-block";
         document.getElementById("createAssignment").classList.add("moveCreateAssButton");
         document.getElementById("editClassName").style.display = "inline-block";
         document.getElementById("editClassName").classList.add("moveEditNameButton");
      }
      document.getElementById("quicks").classList.remove("turn90Degreesacw");
      document.getElementById("getCode").classList.remove("revertClassCodeButton");

      document.getElementById("quicks").classList.add("turn90Degreescw");
      document.getElementById("getCode").style.display = "inline-block";
      document.getElementById("getCode").classList.add("moveClassCodeButton");
      showQuicksOrNot = false;
   }
   else {
      if(!showCodeOrNot){
         showCodeButton();
         showCodeOrNot = true;
      }
      if(!userData.isStudent){
         if(!showFormOrNot) updateName();
         document.getElementById("createAssignment").classList.remove("moveCreateAssButton");
         document.getElementById("editClassName").classList.remove("moveEditNameButton");
         document.getElementById("createAssignment").classList.add("revertCreateAssButton");
         document.getElementById("editClassName").classList.add("revertEditNameButton");
      }
      document.getElementById("quicks").classList.remove("turn90Degreescw");
      document.getElementById("getCode").classList.remove("moveClassCodeButton");


      document.getElementById("quicks").classList.add("turn90Degreesacw");
      document.getElementById("getCode").classList.add("revertClassCodeButton");

      setTimeout(displayNone, 200);
      showQuicksOrNot = true;
   }
}

function displayNone() {
   console.log("in display none");
   document.getElementById("createAssignment").style.display = "none";
   document.getElementById("editClassName").style.display = "none";
   document.getElementById("getCode").style.display = "none";
}

function showForm() {
   if(showFormOrNot){
      document.getElementById("editClassName").innerHTML = '<input type="text" id="className" name="className" class="input" autocomplete="off" placeholder="class name" required><button class="editButton" onclick="updateName()">Update | &nbsp;Close &nbsp;</button>';
      document.getElementById("editClassName").classList.remove("moveEditNameButton");
      document.getElementById("editClassName").classList.remove("convertToEditButton");
      document.getElementById("editClassName").classList.add("convertToEditForm");
      showFormOrNot = false;
   }
}

function showCode() {
   if(showCodeOrNot){
      console.log("in showcode true");
      document.body.style.cursor = "wait";
      const inputs = document.getElementsByTagName("INPUT");
      for(let i=0; i<inputs.length; i++) {
         inputs[i].style.cursor = "wait";
      }

      const buttons = document.getElementsByTagName("BUTTON");
      for(let i=0; i<buttons.length; i++) {
         buttons[i].style.cursor = "wait";
      }
      fetch(`/api/class/${classId}/code`, {
         method: 'GET',
         headers: {
            Accept: 'application/json',
         },
      })
      .then(res => res.json())
      .then(res => {
         document.body.style.cursor = "default";
         for(let i=0; i<inputs.length; i++) {
            inputs[i].style.cursor = "default";
         }
         for(let i=0; i<buttons.length; i++) {
            buttons[i].style.cursor = "default";
         }
         document.getElementById("getCode").innerHTML = res.code;
         document.getElementById("getCode").classList.remove("moveClassCodeButton");
         document.getElementById("getCode").classList.remove("convertToCodeButton");
         document.getElementById("getCode").classList.add("convertToClassCode");
      })
      showCodeOrNot = false;
   }
}

function showCodeButton(){
   document.getElementById("getCode").innerHTML = "Class Code";
   document.getElementById("getCode").classList.remove("convertToClassCode");
   document.getElementById("getCode").classList.add("convertToCodeButton");
}

function members(){
   if(displayMembers){
      document.getElementById("members").classList.remove("hideMembers");
      document.getElementById("members").style.display = "inline-block";
      document.getElementById("members").classList.add("displayMembers");
      displayMembers = false;
   }
   else {
      document.getElementById("members").classList.remove("displayMembers");
      document.getElementById("members").classList.add("hideMembers");
      setTimeout(()=>{document.getElementById("members").style.display = "none";}, 250);
      displayMembers = true;
   }
}