
document.addEventListener("DOMContentLoaded", displayClasses());

function displayClasses() {
   fetch("/api/class/all", {
      method: 'GET',
      headers: {
         Accept: 'application/json',
      },
   })
   .then(res => res.json())
   .then(res => {
      if(res!=null){
         const container = document.getElementById("classContainer");
         const addClass = document.getElementById("addClass");
         container.innerHTML = "";
         container.appendChild(addClass);
         let classes;
         for(i=0; i<res.length; i++) { 
            classes = document.createElement("div");
            classes.innerText = res[i].name;
            classes.classList.add("classes");
            container.insertBefore(classes, addClass);
         }
      }
   })
}


function displayPopUp(){
   document.getElementById("plus").style.display = "none";
   userData = JSON.parse(localStorage.getItem("user"));
   console.log(userData)
   if(userData.isStudent){
      document.getElementById("addClass").classList.add("increaseSize");
      document.getElementById("student").style.display = "inline-block";
      document.getElementById("student").classList.add("zeroToFull");
   }
   else {
      document.getElementById("addClass").classList.add("increaseSize");
      document.getElementById("faculty").style.display = "inline-block";
      document.getElementById("faculty").classList.add("zeroToFull");
   }
}

function joinClass(){
   let classCode = {};
   classCode.code = document.getElementById("classCode").value;
   if(classCode.code == ""){
      document.getElementById("classCode").focus();
   }
   else {
      fetch("/api/class/join", {
         method: 'POST',
         headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(classCode)
      })
      .then(res => res.json())
      .then(res => {
         if(res!=null){
            if(res.message == "Created."){
               document.getElementById("student").style.display = "none";
               document.getElementById("plus").style.display = "inline-block";
               document.getElementById("plus").classList.add("plusZeroToFull");
               document.getElementById("addClass").classList.remove("increaseSize");
               document.getElementById("addClass").classList.add("decreaseSize");
               setTimeout(() => {window.location.reload();}, 600);
            }
         }
      })
   }
}

function createClass() {
   let className = {};
   className.name = document.getElementById("className").value;
   if(className.name == ""){
      document.getElementById("className").focus();
   }
   else {
      fetch("/api/class/", {
         method: 'POST',
         headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
         },
         body: JSON.stringify(className)
      })
      .then(res => res.json())
      .then(res => {
         if(res!=null){
            if(res.code != null){
               document.getElementById("faculty").style.display = "none";
               document.getElementById("displayCode").style.display = "inline-block";
               document.getElementById("code").innerHTML = res.code;
               document.getElementById("displayCode").classList.add("zeroToFull");
            }
         }
      })
   }  
}

function closePopUp() {
   document.getElementById("displayCode").style.display = "none";
   document.getElementById("plus").style.display = "inline-block";
   document.getElementById("plus").classList.add("plusZeroToFull");
   document.getElementById("addClass").classList.remove("increaseSize");
   document.getElementById("addClass").classList.add("decreaseSize");
   setTimeout(() => {window.location.reload();}, 600);
}