function validateForm() {
  const email = document.getElementById("email");
  const emailError = document.getElementById("emailError");

  if (email.value.trim() === "") {
    email.classList.add("error");
    emailError.style.display = "block";
    return false;
  } else {
    email.classList.remove("error");
    emailError.style.display = "none";
    return true;
  }
}
