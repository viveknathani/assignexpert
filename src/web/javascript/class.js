var show = false;
var showComp = false;
const assignedContainer = document.querySelector(".assignedContainer");
const completedContainer = document.querySelector("#completedContainer");
const arrow = document.querySelector("#arrow");
const arrowC = document.querySelector("#arrowC");

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

const data = JSON.parse(localStorage.getItem("user"));
if (!data.isStudent) {
   const updateSection = document.getElementById("updateSection");
   updateSection.style.display = 'grid';
}

function updateName() {
   const newName = document.getElementById("updateInput").value;
   const classId = window.location.pathname.substring('/class/'.length);
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
      window.location.reload();
   })
   .catch((err) => console.log(err))
}