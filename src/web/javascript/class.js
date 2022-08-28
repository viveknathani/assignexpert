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