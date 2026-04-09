// ============================================
// RR Golf — Scripts
// ============================================

// Navigation scroll effect + announcement bar offset
const nav = document.getElementById('nav');
const announcementBar = document.getElementById('announcementBar');

function updateNavPosition() {
    if (announcementBar && nav) {
        const barHeight = announcementBar.offsetHeight;
        nav.style.top = barHeight + 'px';
        document.body.style.paddingTop = (barHeight + nav.offsetHeight) + 'px';
    }
}

if (announcementBar) {
    updateNavPosition();
    window.addEventListener('resize', updateNavPosition);
}

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
});

// Mobile menu toggle
const navToggle = document.getElementById('navToggle');
const navLinks = document.getElementById('navLinks');

navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile menu on link click
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Mobile dropdown toggles
document.querySelectorAll('.nav-book-dropdown > a').forEach(link => {
    link.addEventListener('click', (e) => {
        if (window.innerWidth <= 768) {
            e.preventDefault();
            link.parentElement.classList.toggle('open');
        }
    });
});

// Scroll animations
const fadeElements = document.querySelectorAll('.experience-card, .category-card, .testimonial-card, .location-card, .about-content, .about-image, .cave-content, .clarity-content, .clarity-image');

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
            setTimeout(() => {
                entry.target.classList.add('fade-in', 'visible');
            }, index * 80);
            observer.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -40px 0px'
});

fadeElements.forEach(el => {
    el.classList.add('fade-in');
    observer.observe(el);
});

// ============================================
// Book Popup
// ============================================
const bookPopup = document.getElementById('bookPopup');
const openBtn = document.getElementById('openBookPopup');
const closeBtn = document.getElementById('closePopup');
const bookForm = document.getElementById('bookForm');

function openPopup() {
    if (bookPopup) {
        bookPopup.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function closePopup() {
    if (bookPopup) {
        bookPopup.classList.remove('active');
        document.body.style.overflow = '';
    }
}

if (openBtn) openBtn.addEventListener('click', openPopup);
if (closeBtn) closeBtn.addEventListener('click', closePopup);

// Close on overlay click
if (bookPopup) {
    bookPopup.addEventListener('click', (e) => {
        if (e.target === bookPopup) closePopup();
    });
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup();
});

// Timed popup — show after 30 seconds on first visit
if (bookPopup && !sessionStorage.getItem('bookPopupShown')) {
    setTimeout(() => {
        if (!bookPopup.classList.contains('active')) {
            openPopup();
            sessionStorage.setItem('bookPopupShown', 'true');
        }
    }, 30000);
}

// Form submission — sends to /api/subscribe (Kit)
if (bookForm) {
    bookForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = bookForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            const res = await fetch('/api/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    first_name: bookForm.first_name.value,
                    email: bookForm.email.value,
                }),
            });

            if (res.ok) {
                bookForm.innerHTML = '<div style="padding: 20px 0;"><h3 style="font-size: 22px; color: #1a2744; margin-bottom: 12px;">You\'re in!</h3><p style="font-size: 15px; color: #9ca3af;">Check your inbox for your free copy of Eight Weeks to Mastery and the companion journal.</p></div>';
            } else {
                submitBtn.textContent = originalText;
                submitBtn.disabled = false;
                alert('Something went wrong — please try again.');
            }
        } catch {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
            alert('Something went wrong — please try again.');
        }
    });
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
            const offset = 80;
            const position = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({ top: position, behavior: 'smooth' });
        }
    });
});
