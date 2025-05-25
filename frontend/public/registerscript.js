document.addEventListener("DOMContentLoaded", () => {
  // Sidebar toggle functionality
  const menuButton = document.getElementById("menuButton");
  const sidebar = document.getElementById("sidebar");
  const closeButton = document.getElementById("closeButton");

  if (menuButton && sidebar && closeButton) {
    menuButton.addEventListener("click", () =>
      sidebar.classList.toggle("open")
    );
    closeButton.addEventListener("click", () =>
      sidebar.classList.remove("open")
    );
  }

  // Form and inputs
  const registerForm = document.getElementById("registerForm");
  const inputs = {
    email: document.getElementById("email"),
    confirmEmail: document.getElementById("confirmEmail"),
    username: document.getElementById("username"),
    password: document.getElementById("password"),
    confirmPassword: document.getElementById("confirmPassword"),
    terms: document.getElementById("terms"),
    collegeName: document.getElementById("collegeName"), // Optional
  };

  const errors = {
    email: document.getElementById("emailError"),
    confirmEmail: document.getElementById("confirmEmailError"),
    username: document.getElementById("usernameError"),
    password: document.getElementById("passwordError"),
    confirmPassword: document.getElementById("confirmPasswordError"),
  };

  // Utility: show error message
  const showError = (field, message) => {
    if (errors[field]) {
      errors[field].textContent = message;
      errors[field].style.display = "block";
    }
  };

  // Utility: hide error message
  const hideError = (field) => {
    if (errors[field]) {
      errors[field].style.display = "none";
    }
  };

  // Utility: validate email format
  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Form validation
  const validateForm = () => {
    let isValid = true;

    const { email, confirmEmail, username, password, confirmPassword, terms } =
      inputs;

    if (!email.value.trim()) {
      showError("email", "Email is required");
      isValid = false;
    } else if (!isValidEmail(email.value.trim())) {
      showError("email", "Please enter a valid email address");
      isValid = false;
    } else {
      hideError("email");
    }

    if (!confirmEmail.value.trim()) {
      showError("confirmEmail", "Please confirm your email");
      isValid = false;
    } else if (email.value.trim() !== confirmEmail.value.trim()) {
      showError("confirmEmail", "Emails do not match");
      isValid = false;
    } else {
      hideError("confirmEmail");
    }

    if (!username.value.trim()) {
      showError("username", "Username is required");
      isValid = false;
    } else if (username.value.length < 3) {
      showError("username", "Username must be at least 3 characters");
      isValid = false;
    } else {
      hideError("username");
    }

    if (!password.value.trim()) {
      showError("password", "Password is required");
      isValid = false;
    } else if (password.value.length < 8) {
      showError("password", "Password must be at least 8 characters");
      isValid = false;
    } else {
      hideError("password");
    }

    if (!confirmPassword.value.trim()) {
      showError("confirmPassword", "Please confirm your password");
      isValid = false;
    } else if (password.value.trim() !== confirmPassword.value.trim()) {
      showError("confirmPassword", "Passwords do not match");
      isValid = false;
    } else {
      hideError("confirmPassword");
    }

    if (!terms.checked) {
      alert("You must accept the Terms of Service to continue");
      isValid = false;
    }

    return isValid;
  };

  // Handle input clearing of errors
  Object.keys(errors).forEach((key) => {
    const input = inputs[key];
    if (input) {
      input.addEventListener("input", () => hideError(key));
    }
  });

  // Form submission handler
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const formData = {
      email: inputs.email.value.trim(),
      confirmEmail: inputs.confirmEmail.value.trim(),
      username: inputs.username.value.trim(),
      password: inputs.password.value.trim(),
      confirmPassword: inputs.confirmPassword.value.trim(),
      collegeName: inputs.collegeName?.value.trim() || "",
    };

    try {
      const res = await fetch(
        "https://broke-k41u.onrender.com/api/auth/signup",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("userId", data.userId);
        alert("Registration successful!");
        registerForm.reset();
      } else {
        alert(data.message || "Registration failed. Please try again.");
      }
    } catch (err) {
      console.error("Signup error:", err);
      alert("An error occurred. Please try again later.");
    }
  });
});
