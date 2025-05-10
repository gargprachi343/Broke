document.addEventListener('DOMContentLoaded', () => {
    const verifyCollegeForm = document.getElementById('verifyCollegeForm');
    const collegeNameInput = document.getElementById('collegeName');
    const documentTypeInput = document.getElementById('documentType');
    const documentInput = document.getElementById('document');
    const collegeNameError = document.getElementById('collegeNameError');
    const documentTypeError = document.getElementById('documentTypeError');
    const documentError = document.getElementById('documentError');
  
    function validateForm() {
      let isValid = true;
  
      if (!collegeNameInput.value.trim()) {
        collegeNameError.style.display = 'block';
        collegeNameError.textContent = 'College name is required';
        isValid = false;
      } else {
        collegeNameError.style.display = 'none';
      }
  
      if (!documentTypeInput.value) {
        documentTypeError.style.display = 'block';
        documentTypeError.textContent = 'Document type is required';
        isValid = false;
      } else {
        documentTypeError.style.display = 'none';
      }
  
      if (!documentInput.files.length) {
        documentError.style.display = 'block';
        documentError.textContent = 'Document is required';
        isValid = false;
      } else {
        const file = documentInput.files[0];
        const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
        if (!allowedTypes.includes(file.type)) {
          documentError.style.display = 'block';
          documentError.textContent = 'Only PDF, PNG, or JPEG files are allowed';
          isValid = false;
        } else if (file.size > 5 * 1024 * 1024) {
          documentError.style.display = 'block';
          documentError.textContent = 'File size must be less than 5MB';
          isValid = false;
        } else {
          documentError.style.display = 'none';
        }
      }
  
      return isValid;
    }
  
    verifyCollegeForm.addEventListener('submit', async (event) => {
      event.preventDefault();
  
      if (!validateForm()) return;
  
      const formData = new FormData();
      formData.append('collegeName', collegeNameInput.value.trim());
      formData.append('documentType', documentTypeInput.value);
      formData.append('document', documentInput.files[0]);
      const userId = localStorage.getItem('userId');
      formData.append('userId', userId);
  
      console.log('Submitting form with data:', {
        collegeName: collegeNameInput.value.trim(),
        documentType: documentTypeInput.value,
        document: documentInput.files[0].name,
        documentType: documentInput.files[0].type,
        documentSize: documentInput.files[0].size,
        userId,
      });
  
      try {
        const response = await fetch('http://localhost:3000/api/auth/verification', {
          method: 'POST',
          body: formData,
        });
  
        console.log('Response headers:', [...response.headers.entries()]);
  
        const result = await response.json();
  
        if (response.ok) {
          alert('Documents submitted successfully. Check your email for an OTP.');
          window.location.href = '/otp-verification.html'; // Relative path
        } else {
          console.error('Server error:', {
            status: response.status,
            statusText: response.statusText,
            message: result.message,
          });
          alert(result.message || 'Failed to submit documents. Please try again.');
        }
      } catch (error) {
        console.error('Error during document submission:', {
          message: error.message,
          stack: error.stack,
          name: error.name,
        });
        alert('Failed to connect to the server. Check the browser console for CORS or network errors.');
      }
    });
  
    collegeNameInput.addEventListener('input', () => {
      collegeNameError.style.display = 'none';
    });
  
    documentTypeInput.addEventListener('change', () => {
      documentTypeError.style.display = 'none';
    });
  
    documentInput.addEventListener('change', () => {
      documentError.style.display = 'none';
    });
  });