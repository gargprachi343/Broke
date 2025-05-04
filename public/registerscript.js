function validateForm() {
  const email = document.getElementById('email').value.trim();
  const confirmEmail = document.getElementById('confirmEmail').value.trim();
  const password = document.getElementById('password').value.trim();
  const confirmPassword = document.getElementById('confirmPassword').value.trim();
  const terms = document.getElementById('terms').checked;

  if (email !== confirmEmail) {
    alert("Email addresses do not match.");
    return false;
  }

  if (password !== confirmPassword) {
    alert("Passwords do not match.");
    return false;
  }

  if (!terms) {
    alert("You must agree to the terms and policies.");
    return false;
  }

  alert("Registration successful!");
  return true;
}
