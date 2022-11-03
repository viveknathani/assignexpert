const userData = JSON.parse(localStorage.getItem("user"));
if (userData.isStudent) {
    const downloadForm = document.getElementsByClassName("downloadForm")[0];
    downloadForm.style.display = 'none';
}
