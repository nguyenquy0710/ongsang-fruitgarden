// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const navbarHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navbarHeight;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            // Close mobile menu if open
            if (window.innerWidth <= 768) {
                document.getElementById('navMenu').classList.remove('active');
            }
        }
    });
});

// Mobile menu toggle
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const navMenu = document.getElementById('navMenu');

mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    mobileMenuBtn.classList.toggle('active');
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.navbar')) {
        navMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('active');
    }
});

// Navbar scroll effect
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    // Add shadow on scroll
    if (currentScroll > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
    
    lastScroll = currentScroll;
});

// Scroll to top button
const scrollTopBtn = document.getElementById('scrollTopBtn');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        scrollTopBtn.classList.add('show');
    } else {
        scrollTopBtn.classList.remove('show');
    }
});

scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe all sections and cards
document.addEventListener('DOMContentLoaded', () => {
    // Add initial styles for animation (gallery-item excluded as they're loaded dynamically)
    const animatedElements = document.querySelectorAll('.service-card, .review-card, .info-card');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});


// Active navigation link highlight
function highlightActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let current = '';
    const scrollPosition = window.pageYOffset;
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

window.addEventListener('scroll', highlightActiveNavLink);
window.addEventListener('load', highlightActiveNavLink);

// Add loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// Parallax effect for hero section (subtle)
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    if (hero) {
        const scrolled = window.pageYOffset;
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Dynamic year in footer
const currentYear = new Date().getFullYear();
const footerText = document.querySelector('.footer-bottom p');
if (footerText) {
    footerText.innerHTML = footerText.innerHTML.replace('2024', currentYear);
}

// Service card hover effect enhancement
const serviceCards = document.querySelectorAll('.service-card');

serviceCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transition = 'all 0.3s ease';
    });
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = (y - centerY) / 20;
        const rotateY = (centerX - x) / 20;
        
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
    });
});

// Load and render gallery from JSON
async function loadGallery() {
    const galleryGrid = document.getElementById('galleryGrid');
    
    if (!galleryGrid) {
        console.error('Gallery grid element not found');
        return;
    }
    
    try {
        const response = await fetch('gallery.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Clear existing content
        galleryGrid.innerHTML = '';
        
        // Create and append gallery items
        data.images.forEach(image => {
            const galleryItem = createGalleryItem(image);
            galleryGrid.appendChild(galleryItem);
        });
        
        // Re-apply intersection observer for new items
        applyGalleryAnimations();
        
    } catch (error) {
        console.error('Error loading gallery:', error);
        // Show user-friendly error message using textContent for security
        const errorMsg = document.createElement('p');
        errorMsg.className = 'gallery-error-message';
        errorMsg.textContent = 'Không thể tải thư viện hình ảnh. Vui lòng thử lại sau.';
        galleryGrid.innerHTML = '';
        galleryGrid.appendChild(errorMsg);
    }
}

// Helper function to validate hex color
function isValidColor(color) {
    return /^#[0-9A-Fa-f]{6}$/.test(color);
}

// Create a gallery item element from image data
function createGalleryItem(image) {
    // Validate and sanitize input data
    const safeCategory = String(image.category || '').slice(0, 50);
    const safeDescription = String(image.description || '').slice(0, 200);
    const safeTitle = String(image.title || '').slice(0, 100);
    const safeEmoji = String(image.emoji || '').slice(0, 10);
    
    // Validate colors or use safe defaults
    const backgroundColor = isValidColor(image.backgroundColor) ? image.backgroundColor : '#e8f5e9';
    const circleColor = isValidColor(image.circleColor) ? image.circleColor : '#66bb6a';
    const textColor = isValidColor(image.textColor) ? image.textColor : '#2e7d32';
    
    const item = document.createElement('div');
    item.className = 'gallery-item';
    item.setAttribute('data-category', safeCategory);
    item.setAttribute('title', safeDescription);
    
    // Create SVG using DOM methods for security
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 400 300');
    
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('width', '400');
    rect.setAttribute('height', '300');
    rect.setAttribute('fill', backgroundColor);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '200');
    circle.setAttribute('cy', '150');
    circle.setAttribute('r', '60');
    circle.setAttribute('fill', circleColor);
    
    const emojiText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    emojiText.setAttribute('x', '200');
    emojiText.setAttribute('y', '170');
    emojiText.setAttribute('font-size', '50');
    emojiText.setAttribute('text-anchor', 'middle');
    emojiText.textContent = safeEmoji;
    
    const titleText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    titleText.setAttribute('x', '200');
    titleText.setAttribute('y', '260');
    titleText.setAttribute('font-size', '16');
    titleText.setAttribute('text-anchor', 'middle');
    titleText.setAttribute('fill', textColor);
    titleText.textContent = safeTitle;
    
    svg.appendChild(rect);
    svg.appendChild(circle);
    svg.appendChild(emojiText);
    svg.appendChild(titleText);
    item.appendChild(svg);
    
    return item;
}

// Apply animations to gallery items
function applyGalleryAnimations() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    galleryItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
        
        // Re-apply click event for zoom effect
        item.addEventListener('click', () => {
            const isZoomed = item.classList.contains('zoomed');
            
            // Reset all other items
            galleryItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('zoomed');
                }
            });
            
            // Toggle current item - add if not zoomed, remove if already zoomed
            if (isZoomed) {
                item.classList.remove('zoomed');
            } else {
                item.classList.add('zoomed');
            }
        });
    });
}

// Console message
console.log('%c🍊 Vườn Trái Cây Ông Sang 🍊', 'color: #ff9800; font-size: 24px; font-weight: bold;');
console.log('%cChào mừng bạn đến với website của chúng tôi!', 'color: #2e7d32; font-size: 16px;');
console.log('%cTrải nghiệm thiên nhiên miệt vườn đích thực 🌳', 'color: #66bb6a; font-size: 14px;');

// Load gallery when DOM is ready
document.addEventListener('DOMContentLoaded', loadGallery);
