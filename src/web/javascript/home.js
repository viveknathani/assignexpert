document.addEventListener("DOMContentLoaded", displayClasses());

const userName = JSON.parse(localStorage.getItem("user"));



function displayClasses() {
   const page = document.body.innerHTML;
   document.body.innerHTML = '<img src="../../web/image/logo.png" class="assignExpertLogo"><h4 class="punchLine"><span style="font-weight: 700;">Assignment:</span> Complete me now, or regret later</h4><div class="loadingCode borderBlink" id="loadingCode"></div>';
   document.body.style.textAlign = "center";






   const code = document.getElementById("loadingCode");

   const text = "console.log('loading');";
   let colorGreen = false;

   let time = 600;

   let timeIncrease = 110;

   code.classList.remove("borderBlink");
   for(let i=0; i<text.length-1; i++) {
      if(colorGreen){
         if(text[i] == ")"){
            timeIncrease = 110;
            setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[i]}</span>`, time);
            colorGreen = false;
         }
         else {
            setTimeout(() => code.innerHTML += text[i], time);
         }
      }
      else {
         console.log("in else");
         setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[i]}</span>`, time);
         if(text[i] == '('){
            timeIncrease = 190;
            colorGreen = true;
         }
      }
      time += timeIncrease;
   }
   setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[text.length-1]}</span>`, time);
   code.classList.add("borderBlink");
   time = 150;


   const setIntervalId = setInterval(writeCode, 5200);

   function writeCode() {
      code.classList.remove("borderBlink");
      code.innerHTML = "";
      for(let i=0; i<text.length-1; i++) {
         if(colorGreen){
            if(text[i] == ")"){
               timeIncrease = 110;
               setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[i]}</span>`, time);
               colorGreen = false;
            }
            else {
               setTimeout(() => code.innerHTML += text[i], time);
            }
         }
         else {
            console.log("in else");
            setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[i]}</span>`, time);
            if(text[i] == '('){
               timeIncrease = 190;
               colorGreen = true;
            }
         }
         time += timeIncrease;
      }
      setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[text.length-1]}</span>`, time);
      code.classList.add("borderBlink");
      time = 150;
   }





   setTimeout(()=> {
      fetch("/api/class/all", {
         method: 'GET',
         headers: {
            Accept: 'application/json',
         },
      })
      .then(res => res.json())
      .then(res => {
         if(res!=null){
            clearInterval(setIntervalId);
            document.body.innerHTML = page;
            document.body.style.backgroundColor = "white";
            document.body.style.textAlign = "start";
            const container = document.getElementById("classContainer");
            const addClass = document.getElementById("addClass");
            container.innerHTML = "";
            container.appendChild(addClass);
            let classes;
            for(i=0; i<res.length; i++) { 
               classes = document.createElement("div");
               classes.innerText = res[i].name;
               const id = res[i].id;
               classes.onclick = function () {
                  location.href = `/class/${id}`
               } 
               classes.classList.add("classes");
               container.insertBefore(classes, addClass);
            }
            document.getElementById("userName").innerHTML = "Hi " + userName.firstName + "!";
         }
      })
   }, 5200);
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
      document.body.style.cursor = "wait";
      const inputs = document.getElementsByTagName("INPUT");
      for(let i=0; i<inputs.length; i++) {
         inputs[i].style.cursor = "wait";
      }

      const buttons = document.getElementsByTagName("BUTTON");
      for(let i=0; i<buttons.length; i++) {
         buttons[i].style.cursor = "wait";
      }

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
            document.body.style.cursor = "default";
            for(let i=0; i<inputs.length; i++) {
               inputs[i].style.cursor = "default";
            }
            for(let i=0; i<buttons.length; i++) {
               buttons[i].style.cursor = "default";
            }
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
      document.body.style.cursor = "wait";
      const inputs = document.getElementsByTagName("INPUT");
      for(let i=0; i<inputs.length; i++) {
         inputs[i].style.cursor = "wait";
      }

      const buttons = document.getElementsByTagName("BUTTON");
      for(let i=0; i<buttons.length; i++) {
         buttons[i].style.cursor = "wait";
      }
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
            document.body.style.cursor = "default";
            for(let i=0; i<inputs.length; i++) {
               inputs[i].style.cursor = "default";
            }
            for(let i=0; i<buttons.length; i++) {
               buttons[i].style.cursor = "default";
            }
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