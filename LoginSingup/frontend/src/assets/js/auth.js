// Authentication JavaScript file for login and signup pages

// API base URL - change this if your backend is running on a different port/domain
const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    if (token) {
        // Redirect to dashboard if on login/signup page
        if (window.location.href.includes('login.html') || window.location.href.includes('signup.html')) {
            window.location.href = 'index.html';
        } else {
            // Load user data for other pages
            fetchUserData();
        }
    }

    // Login form handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const notRobot = document.getElementById('notRobot').checked;
        
        if (!notRobot) {
            showAlert('Please confirm you are not a robot', 'error');
            return;
        }
        
        // Show loading state
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Logging in...';
        
        try {
          // Send login request to the backend
          const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            if (data.requiresOTP) {
              // Show OTP verification form
              showOTPVerificationForm(data.userId);
              
              showAlert('OTP sent to your email address', 'info');
            } else {
              // Direct login (no OTP required)
              localStorage.setItem('token', data.token);
              localStorage.setItem('isVerified', data.isVerified);
              
              showAlert('Login successful! Redirecting...', 'success');
              
              // Redirect to home page after successful login
              setTimeout(() => {
                window.location.href = 'index.html';
              }, 1000);
            }
          } else {
            showAlert(data.message || 'Login failed', 'error');
          }
        } catch (error) {
          console.error('Error during login:', error);
          showAlert('An error occurred during login. Please try again.', 'error');
        } finally {
          // Restore button state
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    }
    
    // OTP verification form handling
    const otpForm = document.getElementById('otpVerificationForm');
    if (otpForm) {
      otpForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value;
        const otp = document.getElementById('otp').value;
        
        // Show loading state
        const submitBtn = otpForm.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';
        
        try {
          // Send OTP verification request
          const response = await fetch('http://localhost:5000/api/auth/verify-otp', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ userId, otp })
          });
          
          const data = await response.json();
          
          if (response.ok) {
            // Save token and user verification status
            localStorage.setItem('token', data.token);
            localStorage.setItem('isVerified', data.isVerified);
            
            showAlert('OTP verified successfully! Redirecting...', 'success');
            
            // IMPORTANT: Remove the timeout and redirect immediately
            window.location.href = 'http://127.0.0.1:5500/frontend/src/pages/index.html';
          } else {
            showAlert(data.message || 'OTP verification failed', 'error');
          }
        } catch (error) {
          console.error('Error during OTP verification:', error);
          showAlert('An error occurred during verification. Please try again.', 'error');
        } finally {
          // Restore button state
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      });
    }
    
    // Resend OTP button handling
    const resendOTPButton = document.getElementById('resendOTP');
    if (resendOTPButton) {
        resendOTPButton.addEventListener('click', async function(e) {
            e.preventDefault();
            
            const userId = document.getElementById('userId').value;
            
            // Show loading state
            const originalBtnText = resendOTPButton.textContent;
            resendOTPButton.disabled = true;
            resendOTPButton.textContent = 'Sending...';
            
            try {
                // Send resend OTP request
                const response = await fetch(`${API_BASE_URL}/auth/resend-otp`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ userId })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showAlert('New OTP sent to your email', 'info');
                } else {
                    showAlert(data.message || 'Failed to resend OTP', 'error');
                }
            } catch (error) {
                console.error('Error resending OTP:', error);
                showAlert('An error occurred. Please try again.', 'error');
            } finally {
                // Restore button state
                resendOTPButton.disabled = false;
                resendOTPButton.textContent = originalBtnText;
                
                // Start resend cooldown
                startResendCooldown();
            }
        });
    }
    
    // Educational email validation
    const emailInput = document.getElementById('email');
    const documentVerification = document.getElementById('documentVerification');
    
    if (emailInput && documentVerification) {
        // Check email domain when user finishes typing or clicks outside the field
        emailInput.addEventListener('blur', checkEmailDomain);
        
        // Also check in real-time as the user types (optional)
        emailInput.addEventListener('input', checkEmailDomain);
        
        function checkEmailDomain() {
            const email = emailInput.value.trim();
            
            if (email && email.includes('@')) {
                // Check if the email ends with .edu.in
                const isEducationalEmail = email.toLowerCase().endsWith('.edu.in');
                
                // Show or hide document verification based on email domain
                if (isEducationalEmail) {
                    documentVerification.style.display = 'none';
                    
                    // If using edu.in email, remove required attribute from file inputs
                    if (document.getElementById('collegeId')) {
                        document.getElementById('collegeId').removeAttribute('required');
                    }
                    if (document.getElementById('feeReceipt')) {
                        document.getElementById('feeReceipt').removeAttribute('required');
                    }
                } else {
                    documentVerification.style.display = 'block';
                    
                    // Make document uploads required if not using edu.in email
                    if (document.getElementById('collegeId')) {
                        document.getElementById('collegeId').setAttribute('required', 'required');
                    }
                    if (document.getElementById('feeReceipt')) {
                        document.getElementById('feeReceipt').setAttribute('required', 'required');
                    }
                }
            }
        }
    }
    
    // Signup form handling
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const confirmEmail = document.getElementById('confirmEmail')?.value;
            const username = document.getElementById('username').value;
            const collegeName = document.getElementById('collegeName').value;
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword')?.value;
            const termsAccepted = document.getElementById('termsAccept')?.checked;
            
            // Validate inputs
            if (confirmEmail && email !== confirmEmail) {
                showAlert('Email addresses do not match', 'error');
                return;
            }
            
            if (confirmPassword && password !== confirmPassword) {
                showAlert('Passwords do not match', 'error');
                return;
            }
            
            if (termsAccepted !== undefined && !termsAccepted) {
                showAlert('You must accept the terms to create an account', 'error');
                return;
            }
            
            // Check if document verification is needed
            const isEducationalEmail = email.toLowerCase().endsWith('.edu.in');
            const documentVerification = document.getElementById('documentVerification');
            let collegeIdFile = null;
            let feeReceiptFile = null;
            
            // If document verification is visible and necessary
            if (!isEducationalEmail && documentVerification && documentVerification.style.display !== 'none') {
                collegeIdFile = document.getElementById('collegeId')?.files[0];
                feeReceiptFile = document.getElementById('feeReceipt')?.files[0];
                
                if (!collegeIdFile || !feeReceiptFile) {
                    showAlert('Please upload both your college ID and fee receipt', 'error');
                    return;
                }
            }
            
            // Show loading state
            const submitBtn = signupForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.disabled = true;
            submitBtn.textContent = 'Creating account...';
            
            try {
                // Create FormData object to handle file uploads if needed
                const formData = new FormData();
                formData.append('email', email);
                formData.append('username', username);
                formData.append('collegeName', collegeName);
                formData.append('password', password);
                
                if (collegeIdFile) formData.append('collegeId', collegeIdFile);
                if (feeReceiptFile) formData.append('feeReceipt', feeReceiptFile);
                
                // Send signup request to the backend
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    body: formData // No Content-Type header needed for FormData
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    if (data.isVerified) {
                        showAlert('Account created successfully! You can now log in.', 'success');
                        
                        // Save token if auto-login is desired
                        localStorage.setItem('token', data.token);
                        localStorage.setItem('isVerified', data.isVerified);
                        
                        // Redirect to login page or dashboard
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1500);
                    } else {
                        showAlert('Account created! Please wait for verification of your documents.', 'success');
                        
                        // Redirect to login page
                        setTimeout(() => {
                            window.location.href = 'login.html';
                        }, 2000);
                    }
                } else {
                    showAlert(data.message || 'Signup failed', 'error');
                }
            } catch (error) {
                console.error('Error during signup:', error);
                showAlert('An error occurred during signup. Please try again.', 'error');
            } finally {
                // Restore button state
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
            }
        });
    }
    
    // Logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
    
    // Add navbar user info if logged in
    updateNavbarUserInfo();
});

// Show OTP verification form
function showOTPVerificationForm(userId) {
    const loginForm = document.getElementById('loginForm');
    const container = loginForm.parentElement;
    
    // Hide login form
    loginForm.style.display = 'none';
    
    // Create OTP form
    const otpForm = document.createElement('form');
    otpForm.id = 'otpVerificationForm';
    otpForm.className = 'form';
    otpForm.innerHTML = `
        <h2>Verify Your Account</h2>
        <p>We've sent a verification code to your email</p>
        
        <input type="hidden" id="userId" value="${userId}">
        
        <div class="form-group">
          <label for="otp">Verification Code</label>
          <input type="text" id="otp" placeholder="Enter 6-digit code" maxlength="6" required>
        </div>
        
        <button type="submit" class="btn btn-primary">Verify</button>
        
        <div class="resend-container">
          <p>Didn't receive the code?</p>
          <button id="resendOTP" type="button" class="btn-link">Resend code</button>
        </div>
    `;
    
    container.appendChild(otpForm);
}

// Mask email for privacy
function maskEmail(email) {
    const parts = email.split('@');
    if (parts.length !== 2) return email;
    
    const name = parts[0];
    const domain = parts[1];
    
    if (name.length <= 2) return email;
    
    const visibleChars = Math.min(3, name.length);
    const maskedName = name.substring(0, visibleChars) + '•'.repeat(name.length - visibleChars);
    
    return `${maskedName}@${domain}`;
}

// Start cooldown timer for resend button
function startResendCooldown() {
    const cooldownContainer = document.getElementById('resendCooldown');
    const cooldownTimer = document.getElementById('cooldownTimer');
    const resendButton = document.getElementById('resendOTP');
    
    if (cooldownContainer && cooldownTimer && resendButton) {
        resendButton.style.display = 'none';
        cooldownContainer.style.display = 'block';
        
        let timeLeft = 60;
        cooldownTimer.textContent = timeLeft;
        
        const countdownInterval = setInterval(() => {
            timeLeft--;
            cooldownTimer.textContent = timeLeft;
            
            if (timeLeft <= 0) {
                clearInterval(countdownInterval);
                cooldownContainer.style.display = 'none';
                resendButton.style.display = 'block';
            }
        }, 1000);
    }
}

// Fetch user data from backend
async function fetchUserData() {
    const token = localStorage.getItem('token');
    if (!token) return null;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.data;
        } else {
            // If token is invalid, clear storage and redirect to login
            if (response.status === 401) {
                logout();
            }
            return null;
        }
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
}

// Update navbar with user info
async function updateNavbarUserInfo() {
    const userInfoContainer = document.getElementById('userInfo');
    if (!userInfoContainer) return;
    
    const token = localStorage.getItem('token');
    
    if (token) {
        const userData = await fetchUserData();
        if (userData) {
            userInfoContainer.innerHTML = `
                <span class="user-greeting">Hello, ${userData.username}</span>
                <button id="logoutBtn" class="btn btn-outline">Logout</button>
            `;
            
            // Add logout event listener
            document.getElementById('logoutBtn').addEventListener('click', logout);
        }
    } else {
        userInfoContainer.innerHTML = `
            <a href="login.html" class="btn btn-outline">Log in</a>
            <a href="signup.html" class="btn btn-primary">Join now</a>
        `;
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('isVerified');
    window.location.href = 'login.html';
}

// Show alert message to user
function showAlert(message, type) {
    // Check if alert container exists, if not create it
    let alertContainer = document.getElementById('alertContainer');
    if (!alertContainer) {
        alertContainer = document.createElement('div');
        alertContainer.id = 'alertContainer';
        alertContainer.style.position = 'fixed';
        alertContainer.style.top = '20px';
        alertContainer.style.left = '50%';
        alertContainer.style.transform = 'translateX(-50%)';
        alertContainer.style.zIndex = '1000';
        document.body.appendChild(alertContainer);
    }
    
    // Create alert element
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    
    // Style the alert
    alert.style.padding = '10px 20px';
    alert.style.borderRadius = '5px';
    alert.style.marginBottom = '10px';
    alert.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
    
    if (type === 'error') {
        alert.style.backgroundColor = '#f8d7da';
        alert.style.color = '#721c24';
        alert.style.border = '1px solid #f5c6cb';
    } else if (type === 'success') {
        alert.style.backgroundColor = '#d4edda';
        alert.style.color = '#155724';
        alert.style.border = '1px solid #c3e6cb';
    } else {
        alert.style.backgroundColor = '#cce5ff';
        alert.style.color = '#004085';
        alert.style.border = '1px solid #b8daff';
    }
    
    // Add to container
    alertContainer.appendChild(alert);
    
    // Remove after 3 seconds
    setTimeout(() => {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.5s ease';
        
        setTimeout(() => {
            alertContainer.removeChild(alert);
        }, 500);
    }, 3000);
}