const testCasesContainer = document.querySelector(".testCasesContainer");

function addNewCase() {
   if(testCasesContainer!=null){
      testCasesContainer.insertAdjacentHTML("beforeend", 
      "<div class='testCaseContainer'><h4>Input: </h4><textarea class='inputOutput'></textarea><br><br><h4>Output: </h4><textarea class='inputOutput'></textarea></div>");
   }
}

function removeCase() {
   testCasesContainer?.lastElementChild?.remove();
}