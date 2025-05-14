// Form validation and submission
const loginForm = document.getElementById('loginForm');
const emailInput = document.getElementById('email');
const passwordInput = document.getElementById('password');
const emailError = document.getElementById('emailError');
const passwordError = document.getElementById('passwordError');

loginForm.addEventListener('submit', async function (event) {
  event.preventDefault();
  let isValid = true;

  // Email validation
  if (!emailInput.value.trim()) {
    emailError.style.display = 'block';
    emailError.textContent = 'Email is required';
    isValid = false;
  } else if (!isValidEmail(emailInput.value.trim())) {
    emailError.style.display = 'block';
    emailError.textContent = 'Please enter a valid email address';
    isValid = false;
  } else {
    emailError.style.display = 'none';
  }

  // Password validation
  if (!passwordInput.value.trim()) {
    passwordError.style.display = 'block';
    passwordError.textContent = 'Password is required';
    isValid = false;
  } else {
    passwordError.style.display = 'none';
  }

  if (isValid) {
    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
     
       
        // Store userId in session storage
        sessionStorage.setItem('userId', data.userId);
        console.log('User ID:', data.userId);
              // Redirect to dashboard
        window.location.href = '/public/dashboard.html';
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('An error occurred. Please try again.');
    }
  }
});

// Email validation helper function
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Input event listeners to clear errors when typing
emailInput.addEventListener('input', function () {
  emailError.style.display = 'none';
});

passwordInput.addEventListener('input', function () {
  passwordError.style.display = 'none';
});