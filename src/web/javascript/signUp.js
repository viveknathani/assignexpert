const firstPage = document.querySelector(".firstPage");
const secondPage = document.querySelector(".secondPage");
const thirdPage = document.querySelector(".thirdPage");
const firstPageFields = document.querySelector("#firstPageFields");
const secondPageFields = document.querySelector("#secondPageFields");
const thirdPageFields = document.querySelector("#thirdPageFields");

const indicator1 = document.querySelector('#dot1');
const indicator2 = document.querySelector('#dot2');
const indicator3 = document.querySelector('#dot3');
const rollNumber = document.querySelector("#rollNumber");
const employeeNumber = document.querySelector("#employeeNumber");

var apiData = {
}


let signUpShowPasssword = true;

function signUpTogglePassword(){
   const eyeIcon = document.getElementById("signUpEyeIcon");
   const password = document.getElementById("password");
   if(signUpShowPasssword){
      console.log("showPasswordtrue");
      password.type = "text";
      eyeIcon.classList.remove("fa-eye");
      eyeIcon.classList.add("fa-eye-slash");
      signUpShowPasssword = false;
   }
   else {
      console.log("showPasswordtrue");
      password.type = "password";
      eyeIcon.classList.remove("fa-eye-slash");
      eyeIcon.classList.add("fa-eye");
      signUpShowPasssword = true;
   }
}


function next(order) {
   if (storeValue(order)){
      if(order==0){
         firstPageFields.classList.add("widthZero");
         setTimeout(timeOut(order), 500);
      }
      else if(order==1){
         secondPageFields.classList.remove("widthFull");
         secondPageFields.classList.add("widthZero");
         setTimeout(timeOut(order), 500);
      } 
   }
}

function storeValue(order) {
   if(order==0) {
      apiData.firstName = document.getElementById("firstName").value;
      apiData.lastName = document.getElementById("lastName").value;
      if(apiData.firstName == ""){
         document.getElementById("firstName").focus();
      }
      else if(apiData.lastName == ""){
         document.getElementById("lastName").focus();
      }
      if(apiData.firstName != "" && apiData.lastName != ""){
         return true;
      }
   }
   else if(order==1){
      if(document.getElementsByName("position")[0].checked){
         apiData.isStudent = true;
      }
      else if(document.getElementsByName("position")[1].checked) apiData.isStudent = false;
      if(apiData.isStudent == null){
         document.getElementsByName("position")[0].focus();
      }
      if(apiData.isStudent != null) {
         return true;
      }
   }
}

function timeOut(order){
   if(order==0){
      firstPage.style.display = "none";
      secondPage.style.display = "inline-block";
      firstPageFields.classList.remove("widthZero");
      secondPageFields.classList.add("widthFull");
      indicator1.classList.remove("greenIndicator");
      indicator2.classList.add("greenIndicator");
   }
   else if(order==1){
      secondPage.style.display = "none";
      thirdPage.style.display = "inline-block";
      if(!apiData.isStudent){
         rollNumber.style.display = "none";
         employeeNumber.style.display = "inline-block";
      }
      secondPageFields.classList.remove("widthZero");
      thirdPageFields.classList.add("widthFull");
      indicator2.classList.remove("greenIndicator");
      indicator3.classList.add("greenIndicator");
   }
}

function signUp() {
   apiData.email = document.getElementById("email").value;
   apiData.password = document.getElementById("password").value;
   if(apiData.isStudent){
      apiData.rollNumber = Number(rollNumber.value);
      if(apiData.rollNumber == 0){
         rollNumber.focus();
      }
   }
   else {
      apiData.employeeNumber = Number(employeeNumber.value);
      if(apiData.employeeNumber == 0){
         employeeNumber.focus();
      }
   }

   if(apiData.email == ""){
      document.getElementById("email").focus();
   }
   else if(apiData.password == ""){
      document.getElementById("password").focus();
   }

   document.body.style.cursor = "wait";
   const inputs = document.getElementsByTagName("INPUT");
   for(let i=0; i<inputs.length; i++) {
      inputs[i].style.cursor = "wait";
   }

   const buttons = document.getElementsByTagName("BUTTON");
   for(let i=0; i<buttons.length; i++) {
      buttons[i].style.cursor = "wait";
   }

   fetch("/api/user/signup", {
      method: 'POST',
      headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json'
      },
      body: JSON.stringify(apiData)
   })
   .then(res => res.json())
   .then(res => {
      if(res!=null){
         document.body.style.cursor = "default";
         for(let i=0; i<inputs.length; i++) {
            inputs[i].style.cursor = "default";
         }
         for(let i=0; i<buttons.length; i++) {
            buttons[i].style.cursor = "default";
         }
         if(res.message == "Created."){
            document.getElementById("message").style.color = "#008037";
            document.getElementById("message").style.padding = "0.5vh 0.5vw";
            document.getElementById("message").style.border = "0.2vw solid black";
            document.getElementById("message").innerHTML = "Sign Up successful!";
            setTimeout(() => {document.getElementById("message").innerHTML = "";
                              document.getElementById("message").style.border = "none";
                              window.location.reload();
                      }, 5000);
         }
         else {
            document.getElementById("message").style.color = "red";
            document.getElementById("message").style.padding = "0.5vh 0.5vw";
            document.getElementById("message").style.border = "0.2vw solid #008037";
            document.getElementById("message").innerHTML = res.message;
            setTimeout(() => {document.getElementById("message").innerHTML = "";
                              document.getElementById("message").style.border = "none";
                      }, 12000);
         }
      }
   })
}
