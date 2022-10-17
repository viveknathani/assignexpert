function gotoHomePage() {
   location.href = `/home`;
}

function gotoSettingPage() {
   location.href = `/settings`;
}

function logout() {
   fetch("/api/user/logout", {
      method: 'POST',
      headers: {
         Accept: 'application/json',
         'Content-Type': 'application/json'
      }
   })
   .then(res => res.json())
   .then(res => {
      window.location.reload();
   })
}