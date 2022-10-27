const code = document.getElementById("code");

const text = "console.log('loading');";
let colorGreen = false;

let time = 200;

code.classList.remove("borderBlink");
for(let i=0; i<text.length-1; i++) {
   if(colorGreen){
      if(text[i] == ")"){
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
         colorGreen = true;
      }
   }
   time += 170;
}
setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[text.length-1]}</span>`, time);
code.classList.add("borderBlink");
time = 200;


setInterval(writeCode, 5500);

function writeCode() {
   code.classList.remove("borderBlink");
   code.innerHTML = "";
   for(let i=0; i<text.length-1; i++) {
      if(colorGreen){
         if(text[i] == ")"){
            setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[i]}</span>`, time);
            colorGreen = false;
         }
         else {
            setTimeout(() => code.innerHTML += text[i], time);
         }
      }
      else {
         setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[i]}</span>`, time);
         if(text[i] == '('){
            colorGreen = true;
         }
      }
      time += 170;
   }
   setTimeout(() => code.innerHTML += `<span style='color: black;'>${text[text.length-1]}</span>`, time);
   code.classList.add("borderBlink");
   time = 200;
}