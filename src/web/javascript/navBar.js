function gotoHomePage() {
   location.href = `/home`;
}

function gotoSettingPage() {
   location.href = `/settings`;
}

function logout() {
   document.body.style.cursor = "wait";
   const buttons = document.getElementsByTagName("BUTTON");
   for(let i=0; i<buttons.length; i++) {
      buttons[i].style.cursor = "wait";
   }
   const div = document.getElementsByTagName("div");
   for(let i=0; i<div.length; i++) {
      div[i].style.cursor = "wait";
   }
   fetch("/api/user/logout", {
      method: 'POST',
      headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json'
      }
   })
   .then(res => res.json())
   .then(res => {
      document.body.style.cursor = "default";
      const buttons = document.getElementsByTagName("BUTTON");
      for(let i=0; i<buttons.length; i++) {
         buttons[i].style.cursor = "default";
      }
      const div = document.getElementsByTagName("div");
      for(let i=0; i<div.length; i++) {
         div[i].style.cursor = "default";
      }
      window.location.reload();
   })
}