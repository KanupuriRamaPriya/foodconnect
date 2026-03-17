const API_BASE_URL = 'http://localhost:5000/api';

document.addEventListener('DOMContentLoaded', () => {
    // Handle navbar scroll effect
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Handle initial route based on hash or default to landing
    const hash = window.location.hash.replace('#', '');
    if (hash && document.getElementById(hash)) {
        navigateTo(hash);
    }

    // Check if user is already logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.token) {
        updateNavForLoggedInUser(user);
        // If on a dashboard page, load data
        if (hash === 'ngo-dashboard' || hash === 'donor-dashboard') {
            loadDashboardData();
        }
    }
});

// Navigation function
function navigateTo(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(sec => sec.classList.remove('active'));

    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        window.scrollTo(0, 0); // Scroll to top
        window.location.hash = sectionId; // Update URL hash
    }

    // Update active state on nav links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.classList.remove('active');
        // Simple logic for active state
        if (link.getAttribute('onclick') && link.getAttribute('onclick').includes(sectionId)) {
            link.classList.add('active');
        }
    });

    // Load data based on page
    if (sectionId === 'ngo-dashboard' || sectionId === 'donor-dashboard') {
        loadDashboardData();
    }

    // Close mobile menu if open
    const navContainer = document.querySelector('.nav-container');
    if (navContainer && navContainer.classList.contains('mobile-active')) {
        toggleMobileMenu();
    }
}

// Mobile Menu Toggle
function toggleMobileMenu() {
    const navContainer = document.querySelector('.nav-container');
    navContainer.classList.toggle('mobile-active');
    
    // Toggle icon
    const icon = document.querySelector('.hamburger i');
    if (navContainer.classList.contains('mobile-active')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-xmark');
    } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-bars');
    }
}

// Role Selection Logic
let selectedRole = '';

function selectRole(role) {
    selectedRole = role;
    console.log('Selected role:', role);
    navigateTo('login-page');
    setTimeout(() => {
        const roleDropdown = document.getElementById('register-role');
        if(roleDropdown) {
            roleDropdown.value = role;
        }
    }, 100);
}

// Auth Tab Switching logic
function switchAuthTab(tab) {
    const tabs = document.querySelectorAll('.tab-btn');
    const nameGroup = document.getElementById('name-group');
    const roleGroup = document.getElementById('role-group');
    const submitBtn = document.getElementById('auth-submit-btn');

    tabs.forEach(t => t.classList.remove('active'));
    tabs.forEach(t => {
        t.style.borderBottom = 'none';
        t.style.color = 'var(--color-text-muted)';
    });

    if (tab === 'login') {
        tabs[0].classList.add('active');
        tabs[0].style.borderBottom = '2px solid var(--color-primary)';
        tabs[0].style.color = 'var(--color-primary)';
        nameGroup.style.display = 'none';
        roleGroup.style.display = 'none';
        submitBtn.textContent = 'Log In';
    } else {
        tabs[1].classList.add('active');
        tabs[1].style.borderBottom = '2px solid var(--color-primary)';
        tabs[1].style.color = 'var(--color-primary)';
        nameGroup.style.display = 'block';
        roleGroup.style.display = 'block';
        submitBtn.textContent = 'Create Account';
    }
}

// Real Login/Signup Submission
async function simulateLogin() {
    const submitBtn = document.getElementById('auth-submit-btn');
    const originalText = submitBtn.textContent;
    const isSignup = originalText === 'Create Account';
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const role = document.getElementById('register-role').value;

    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Processing...';
    submitBtn.disabled = true;

    try {
        const endpoint = isSignup ? '/auth/register' : '/auth/login';
        const body = isSignup ? { name, email, password, role } : { email, password };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            updateNavForLoggedInUser(data);
            
            const targetDashboard = data.role === 'donor' ? 'donor-dashboard' : 'ngo-dashboard';
            navigateTo(targetDashboard);
        } else {
            alert(data.message || 'Authentication failed');
        }
    } catch (error) {
        console.error('Auth Error:', error);
        alert('Connection error. Is the server running?');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

function updateNavForLoggedInUser(user) {
    const navButtons = document.getElementById('nav-buttons');
    if (navButtons) {
        navButtons.innerHTML = `
            <span style="margin-right: 15px; font-weight: 600;">Hi, ${user.name.split(' ')[0]}</span>
            <button class="btn btn-outline" onclick="logout()">Log Out</button>
        `;
    }
    
    // Also update dashboard names if they exist
    const donorNameEl = document.getElementById('user-display-name');
    const ngoNameEl = document.getElementById('ngo-display-name');
    if (donorNameEl) donorNameEl.textContent = user.name;
    if (ngoNameEl) ngoNameEl.textContent = user.name;
}

function logout() {
    localStorage.removeItem('user');
    window.location.reload();
}

// Real Post Donation
async function simulatePostDonation() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user.token) return navigateTo('login-page');

    const btn = document.querySelector('#post-donation-page button[type="submit"]');
    const originalText = btn.innerHTML;
    
    const foodType = document.getElementById('food-type').value;
    const quantity = document.getElementById('quantity').value;
    const category = document.querySelector('input[name="diet"]:checked').value;
    const expiryTime = document.getElementById('expiry').value;
    const pickupLocation = document.getElementById('pickup-loc').value;

    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Submitting...';
    btn.disabled = true;

    try {
        const response = await fetch(`${API_BASE_URL}/donations`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ foodType, quantity, category, expiryTime, pickupLocation })
        });

        if (response.ok) {
            btn.innerHTML = '<i class="fa-solid fa-check"></i> Success!';
            btn.style.backgroundColor = 'var(--color-primary)';
            btn.style.color = 'white';

            setTimeout(() => {
                btn.innerHTML = originalText;
                btn.disabled = false;
                document.querySelector('#post-donation-page form').reset();
                navigateTo('donor-dashboard');
            }, 1500);
        } else {
            alert('Failed to post donation');
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    } catch (error) {
        console.error('Post error:', error);
        alert('Connection error');
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Load Dashboard Data
async function loadDashboardData() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    if (user.role === 'donor') {
        fetchMyDonations(user.token);
    } else {
        fetchAvailableDonations();
    }
}

async function fetchMyDonations(token) {
    const container = document.querySelector('.dashboard-main');
    if (!container) return;

    try {
        const response = await fetch(`${API_BASE_URL}/donations/my-donations`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const donations = await response.json();

        let html = '<h3 style="margin-bottom: 1.5rem;">My Recent Donations</h3>';
        
        if (donations.length === 0) {
            html += '<p>You haven\'t posted any donations yet.</p>';
        }

        donations.reverse().forEach(donation => {
            const isVeg = donation.category === 'veg';
            html += `
                <div class="donation-card" style="display: flex; background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); margin-bottom: 1rem; align-items: center; padding-right: 1.5rem;">
                    <div style="width: 120px; height: 120px; background: linear-gradient(135deg, ${isVeg ? '#f0fdf4, #bbf7d0' : '#ffedd5, #fed7aa'}); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; color: ${isVeg ? 'var(--color-primary)' : 'var(--color-secondary)'};">
                        <i class="fa-solid ${isVeg ? 'fa-bowl-food' : 'fa-drumstick-bite'}"></i>
                    </div>
                    <div style="padding: 1.5rem; flex: 1;">
                        <h4 style="font-size: 1.25rem; margin-bottom: 0.25rem;">${donation.foodType}</h4>
                        <p style="margin-bottom: 0; font-size: 0.9rem;">
                            <i class="fa-solid fa-layer-group"></i> ${donation.quantity} &nbsp;•&nbsp; <i class="fa-solid ${isVeg ? 'fa-leaf text-green' : 'fa-drumstick-bite text-orange'}"></i> ${donation.category}
                        </p>
                    </div>
                    <div style="text-align: right;">
                        <span style="display: inline-block; padding: 0.3rem 0.8rem; background: ${getStatusBg(donation.status)}; color: ${getStatusColor(donation.status)}; border-radius: 2rem; font-size: 0.8rem; font-weight: 600;">${donation.status}</span>
                        <p style="margin-top: 0.5rem; font-size: 0.8rem; margin-bottom: 0;">${new Date(donation.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
        
        // Update stats
        document.querySelector('.stat-card div').textContent = donations.length;
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function fetchAvailableDonations() {
    const grid = document.querySelector('#ngo-dashboard .container [style*="display: grid"]');
    if (!grid) return;

    try {
        const response = await fetch(`${API_BASE_URL}/donations`);
        const donations = await response.json();

        const pendingDonations = donations.filter(d => d.status === 'pending');
        
        if (pendingDonations.length === 0) {
            grid.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">No donations available at the moment.</p>';
            return;
        }

        grid.innerHTML = pendingDonations.map(donation => {
            const isVeg = donation.category === 'veg';
            return `
                <div class="ngo-donation-card" style="background: white; border-radius: var(--radius-lg); overflow: hidden; box-shadow: var(--shadow-sm); border: 1px solid var(--color-border); transition: var(--transition-normal); display: flex; flex-direction: column;">
                    <div style="height: 140px; background: linear-gradient(135deg, ${isVeg ? '#f0fdf4, #bbf7d0' : '#ffedd5, #fed7aa'}); display: flex; align-items: center; justify-content: center; font-size: 3rem; color: ${isVeg ? 'var(--color-primary)' : 'var(--color-secondary)'}; position: relative;">
                        <i class="fa-solid ${isVeg ? 'fa-bread-slice' : 'fa-drumstick-bite'}"></i>
                        <span style="position: absolute; top: 1rem; right: 1rem; background: rgba(255,255,255,0.9); padding: 0.2rem 0.6rem; border-radius: 2rem; font-size: 0.8rem; font-weight: 700; color: #ef4444;"><i class="fa-regular fa-clock"></i> Exp: ${donation.expiryTime}</span>
                    </div>
                    <div style="padding: 1.5rem; flex: 1; display: flex; flex-direction: column;">
                        <h4 style="font-size: 1.25rem; margin-bottom: 0.5rem;">${donation.foodType}</h4>
                        <p style="margin-bottom: 1rem; font-size: 0.9rem; flex: 1;">
                            <i class="fa-solid fa-layer-group text-muted"></i> ${donation.quantity}<br>
                            <i class="fa-solid ${isVeg ? 'fa-leaf text-green' : 'fa-drumstick-bite text-orange'}"></i> ${donation.category}
                        </p>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 1rem; border-top: 1px solid var(--color-border); margin-bottom: 1rem;">
                            <span style="font-size: 0.85rem; color: var(--color-text-muted);"><i class="fa-solid fa-location-dot"></i> ${donation.pickupLocation}</span>
                            <span style="font-size: 0.85rem; font-weight: 600;">${donation.donor.name}</span>
                        </div>
                        <button class="btn btn-primary w-100" onclick="acceptDonation('${donation._id}')">Accept Pickup</button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (error) {
        console.error('Fetch error:', error);
    }
}

async function acceptDonation(id) {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return navigateTo('login-page');

    if (!confirm('Are you sure you want to accept this pickup?')) return;

    try {
        const response = await fetch(`${API_BASE_URL}/donations/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${user.token}`
            },
            body: JSON.stringify({ status: 'accepted' })
        });

        if (response.ok) {
            alert('Pickup accepted successfully!');
            loadDashboardData();
        } else {
            alert('Failed to accept pickup');
        }
    } catch (error) {
        console.error('Accept error:', error);
    }
}

function getStatusBg(status) {
    switch(status) {
        case 'pending': return '#fef3c7';
        case 'accepted': return '#dbeafe';
        case 'completed': return '#dcfce7';
        default: return '#f1f5f9';
    }
}

function getStatusColor(status) {
    switch(status) {
        case 'pending': return '#b45309';
        case 'accepted': return '#1d4ed8';
        case 'completed': return '#166534';
        default: return '#64748b';
    }
}