// Define the validateForm function
function validateForm() {
  const email = document.getElementById('email').value;
  const confirmEmail = document.getElementById('confirmEmail').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;
  const termsAccepted = document.getElementById('terms').checked;

  // Validate the form
  if (!email || !confirmEmail || !password || !confirmPassword) {
    alert('Please fill in all fields.');
    return false;
  }

  if (email !== confirmEmail) {
    alert('Email addresses do not match.');
    return false;
  }

  if (password !== confirmPassword) {
    alert('Passwords do not match.');
    return false;
  }

  if (!termsAccepted) {
    alert('You must accept the terms and conditions.');
    return false;
  }

  return true; // Allow form submission
}

// Add the event listener for form submission
document.getElementById('registerForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent form submission

  // Call validateForm and proceed only if it returns true
  if (!validateForm()) return;

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    // Make a POST request to the backend signup API
    const response = await fetch('http://localhost:3000/api/auth/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: 'New User', email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message); // Show success message
      // Redirect to the login page
      window.location.href = 'loginpage.html';
    } else {
      alert(data.message); // Show error message
    }
  } catch (error) {
    console.error('Error during signup:', error);
    alert('An error occurred. Please try again.');
  }
});