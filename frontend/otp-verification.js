document.addEventListener('DOMContentLoaded', () => {
    const otpForm = document.getElementById('otpForm');
    const otpInput = document.getElementById('otp');
    const otpError = document.getElementById('otpError');
  
    function validateForm() {
      let isValid = true;
  
      // OTP validation
      if (!otpInput.value.trim()) {
        otpError.style.display = 'block';
        otpError.textContent = 'OTP is required';
        isValid = false;
      } else if (!/^\d{6}$/.test(otpInput.value.trim())) {
        otpError.style.display = 'block';
        otpError.textContent = 'OTP must be a 6-digit number';
        isValid = false;
      } else {
        otpError.style.display = 'none';
      }
  
      return isValid;
    }
  
    otpForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      if (!validateForm()) return;
  
      const formData = {
        userId: localStorage.getItem('userId'),
        otp: otpInput.value.trim(),
      };
  
      try {
        const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });
  
        const result = await response.json();
  
        if (response.ok) {
          alert('OTP verified successfully! You are now verified.');
          window.location.href = '/dashboard.html';
        } else {
          alert(result.message || 'Invalid or expired OTP. Please try again.');
        }
      } catch (error) {
        console.error('Error during OTP verification:', error);
        alert('An error occurred. Please try again later.');
      }
    });
  
    otpInput.addEventListener('input', () => {
      otpError.style.display = 'none';
    });
  });