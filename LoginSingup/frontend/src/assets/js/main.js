// Main JavaScript file for BrokeBro website

document.addEventListener('DOMContentLoaded', async function() {
    console.log('BrokeBro website loaded successfully');
    
    // Load navbar component
    const navbarContainer = document.getElementById('navbar-container');
    if (navbarContainer) {
        fetch('../components/navbar.html')
            .then(response => response.text())
            .then(data => {
                navbarContainer.innerHTML = data;
                
                // Highlight the current page in the nav
                const currentPage = window.location.pathname.split('/').pop();
                const navLinks = document.querySelectorAll('.nav-links a');
                navLinks.forEach(link => {
                    if (link.getAttribute('href').includes(currentPage)) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            });
    }
    
    // Load footer component
    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        fetch('../components/footer.html')
            .then(response => response.text())
            .then(data => {
                footerContainer.innerHTML = data;
            });
    }
    
    // Set up hero action based on authentication status
    const token = localStorage.getItem('token');
    const isVerified = localStorage.getItem('isVerified') === 'true';
    
    const heroActionDiv = document.getElementById('heroAction');
    if (heroActionDiv) {
        if (token) {
            if (isVerified) {
                heroActionDiv.innerHTML = `
                    <p class="welcome-message">Welcome back! Browse all available discounts below.</p>
                `;
                // Load discounts when verified
                loadDiscounts();
            } else {
                heroActionDiv.innerHTML = `
                    <div class="verification-pending">
                        <p>Your account is pending verification. We'll notify you once your documents are approved.</p>
                    </div>
                `;
            }
        } else {
            heroActionDiv.innerHTML = `
                <a href="signup.html" class="btn btn-primary btn-large">Join for free</a>
                <p class="join-text">Already a member? <a href="login.html">Log in</a></p>
            `;
        }
    }
    
    // Check if user is authenticated
    const userInfo = document.getElementById('userInfo');
    if (token) {
        // User is authenticated
        // Update UI for authenticated user
        if (userInfo) {
            userInfo.innerHTML = `
                <div class="dropdown">
                    <button class="dropdown-toggle">My Account</button>
                    <div class="dropdown-menu">
                        <a href="profile.html">Profile</a>
                        <a href="#" id="logoutBtn">Logout</a>
                    </div>
                </div>
            `;
        }
        
        // Load discounts data
        fetchDiscounts();
    }
});

// Load discounts from API
async function loadDiscounts() {
    const token = localStorage.getItem('token');
    const discountsContainer = document.getElementById('discountsList');
    
    if (!token || !discountsContainer) return;
    
    try {
        const response = await fetch('http://localhost:5000/api/college', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            
            if (data.success) {
                // Clear placeholder
                discountsContainer.innerHTML = '';
                
                // Populate with sample discounts for demonstration
                const discounts = [
                    { brand: 'Amazon', discount: '10% off for students', logo: 'amazon.png' },
                    { brand: 'Nike', discount: '15% off on all products', logo: 'nike.png' },
                    { brand: 'Apple', discount: 'Education pricing on Mac and iPad', logo: 'apple.png' },
                    { brand: 'Spotify', discount: '50% off Premium subscription', logo: 'spotify.png' },
                    { brand: 'Adobe', discount: '60% off Creative Cloud', logo: 'adobe.png' },
                    { brand: 'Microsoft', discount: 'Free Office 365', logo: 'microsoft.png' }
                ];
                
                // Create discount cards
                discounts.forEach(discount => {
                    const discountCard = document.createElement('div');
                    discountCard.className = 'discount-card';
                    discountCard.innerHTML = `
                        <div class="brand-logo">
                            <span>${discount.brand.charAt(0)}</span>
                        </div>
                        <div class="discount-info">
                            <h3>${discount.brand}</h3>
                            <p>${discount.discount}</p>
                            <a href="#" class="btn btn-outline btn-sm">Get discount</a>
                        </div>
                    `;
                    discountsContainer.appendChild(discountCard);
                });
            }
        } else if (response.status === 401) {
            // Handle unauthorized - token expired
            localStorage.removeItem('token');
            localStorage.removeItem('isVerified');
            window.location.reload();
        }
    } catch (error) {
        console.error('Error loading discounts:', error);
        discountsContainer.innerHTML = `
            <div class="error-message">
                <p>Failed to load discounts. Please try again later.</p>
            </div>
        `;
    }
}

// Fetch discounts for authenticated users
function fetchDiscounts() {
    const token = localStorage.getItem('token');
    const discountsList = document.getElementById('discountsList');
    
    if (!token || !discountsList) return;
    
    // For now, just show sample discounts
    const sampleDiscounts = [
        { brand: 'Amazon', discount: '10% off for students', logo: 'amazon.png' },
        { brand: 'Nike', discount: '15% off on all products', logo: 'nike.png' },
        { brand: 'Apple', discount: 'Education pricing on Mac and iPad', logo: 'apple.png' },
        { brand: 'Spotify', discount: '50% off Premium subscription', logo: 'spotify.png' },
        { brand: 'Adobe', discount: '60% off Creative Cloud', logo: 'adobe.png' },
        { brand: 'Microsoft', discount: 'Free Office 365', logo: 'microsoft.png' }
    ];
    
    // Clear existing content
    discountsList.innerHTML = '';
    
    // Add sample discounts to the list
    sampleDiscounts.forEach(discount => {
        const discountItem = document.createElement('div');
        discountItem.className = 'discount-item';
        discountItem.innerHTML = `
            <div class="discount-logo">
                <img src="../assets/logos/${discount.logo}" alt="${discount.brand} logo">
            </div>
            <div class="discount-details">
                <h4>${discount.brand}</h4>
                <p>${discount.discount}</p>
            </div>
        `;
        discountsList.appendChild(discountItem);
    });
}