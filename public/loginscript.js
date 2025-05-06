document.getElementById('loginForm').addEventListener('submit', async (event) => {
  event.preventDefault(); // Prevent form submission

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  // Validate the form
  if (!email || !password) {
    alert('Please fill in all fields.');
    return;
  }

  try {
    // Make a POST request to the backend login API
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(data.message); // Show success message
      // Save the token to localStorage or sessionStorage
      localStorage.setItem('token', data.token);
      // Redirect to the dashboard or another page
      window.location.href = 'dashboard.html';
    } else {
      alert(data.message); // Show error message
    }
  } catch (error) {
    console.error('Error during login:', error);
    alert('An error occurred. Please try again.');
  }
});