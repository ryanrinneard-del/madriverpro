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

// Close mobile menu on link click — but NOT when the link is a dropdown
// parent (e.g. "Player Portal", "Book Now"). Those don't navigate; they
// expand a sub-menu, and we want the menu to stay open while that happens.
// Uses closest() rather than parentElement so we're robust against any
// markup change (extra wrappers, etc.).
navLinks.querySelectorAll('a').forEach(link => {
    const isDropdownParent = link.matches('.nav-book-dropdown > a');
    link.addEventListener('click', () => {
        if (isDropdownParent) return;
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Dropdown parent toggle — works on every viewport.
//
// Bug history: this used to only `preventDefault()` when innerWidth <= 768,
// which left iPad / iOS Safari at landscape widths navigating to the parent
// link's href. The "Player Portal" parent had href="/adult/" so iOS users
// got dropped on the Adult sign-in page instead of seeing the Juniors /
// Adult dropdown choice — which they read as "kicked back to login" or
// "options don't show at all". Both anchors now have href="#" and we
// preventDefault unconditionally so the dropdown can do its job.
document.querySelectorAll('.nav-book-dropdown > a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const parent = link.parentElement;
        // Close any other open dropdowns at the same time (single-open UX).
        document.querySelectorAll('.nav-book-dropdown.open').forEach(other => {
            if (other !== parent) other.classList.remove('open');
        });
        parent.classList.toggle('open');
        link.setAttribute('aria-expanded', parent.classList.contains('open') ? 'true' : 'false');
    });
});

// Tapping outside any dropdown closes them — important on iOS where the
// dropdown stays "open" until something tells it to collapse.
document.addEventListener('click', (e) => {
    if (e.target.closest('.nav-book-dropdown')) return;
    document.querySelectorAll('.nav-book-dropdown.open').forEach(dd => {
        dd.classList.remove('open');
        const parentLink = dd.querySelector(':scope > a');
        if (parentLink) parentLink.setAttribute('aria-expanded', 'false');
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

// Timed popup — show after 15 seconds on first visit
if (bookPopup && !sessionStorage.getItem('bookPopupShown')) {
    setTimeout(() => {
        if (!bookPopup.classList.contains('active')) {
            openPopup();
            sessionStorage.setItem('bookPopupShown', 'true');
        }
    }, 15000);

    // Exit-intent popup — triggers when mouse moves toward top of viewport (desktop)
    document.addEventListener('mouseout', (e) => {
        if (!e.relatedTarget && e.clientY < 10 && !sessionStorage.getItem('bookPopupShown')) {
            openPopup();
            sessionStorage.setItem('bookPopupShown', 'true');
        }
    });
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
                    website: bookForm.website?.value || '',
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
