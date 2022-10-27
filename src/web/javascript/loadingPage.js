const code = document.getElementById("code");

const innerHTMLs = ["<span style='color: black;'>c</span>", "<span style='color: black;'>o</span>", "<span style='color: black;'>n</span>", "<span style='color: black;'>s</span>", "<span style='color: black;'>o</span>", "<span style='color: black;'>l</span>", "<span style='color: black;'>e</span>", "<span style='color: black;'>.</span>", "<span style='color: black;'>l</span>","<span style='color: black;'>o</span>", "<span style='color: black;'>g</span>", "<span style='color: black;'>(</span>", "'", "l", "o", "a", "d", "i", "n", "g", "'", "<span style='color: black;'>)</span>", "<span style='color: black;'>;</span>"];

let time = 200;

code.classList.remove("borderBlink");
for(let i=0; i<innerHTMLs.length-1; i++) {
   setTimeout(() => code.innerHTML += innerHTMLs[i], time);
   time += 170;
}
setTimeout(() => code.innerHTML += innerHTMLs[innerHTMLs.length-1], time);
code.classList.add("borderBlink");
time = 200;


setInterval(writeCode, 5500);

function writeCode() {
   code.classList.remove("borderBlink");
   code.innerHTML = "";
   for(let i=0; i<innerHTMLs.length-1; i++) {
      setTimeout(() => code.innerHTML += innerHTMLs[i], time);
      time += 170;
   }
   setTimeout(() => code.innerHTML += innerHTMLs[innerHTMLs.length-1], time);
   code.classList.add("borderBlink");
   time = 200;
}