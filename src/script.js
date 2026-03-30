document.addEventListener('DOMContentLoaded', () => {

    /* ==================== PRELOADER ==================== */
    const preloader = document.getElementById('preloader');
    if (preloader) {
        window.addEventListener('load', () => {
            setTimeout(() => {
                preloader.classList.add('hidden');
            }, 1800);
        });
    }

    /* ==================== SCROLL PROGRESS BAR ==================== */
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        window.addEventListener('scroll', () => {
            const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const progress = (scrollTop / scrollHeight) * 100;
            scrollProgress.style.width = progress + '%';
        });
    }

    /* ==================== NAVBAR SCROLL EFFECT ==================== */
    const navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    /* ==================== HAMBURGER MENU ==================== */
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');

    if (hamburger && mobileMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });

        // Close mobile menu when a link is clicked
        document.querySelectorAll('.mobile-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                mobileMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });
    }

    /* ==================== DARK / LIGHT MODE TOGGLE ==================== */
    function setTheme(isLight) {
        document.body.classList.toggle('light-mode', isLight);

        // Update all theme icons
        const icons = document.querySelectorAll('#theme-icon, #theme-icon-mobile');
        icons.forEach(icon => {
            icon.className = isLight ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
        });

        localStorage.setItem('theme', isLight ? 'light' : 'dark');
    }

    // Load saved theme
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        setTheme(true);
    }

    // Toggle buttons
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            setTheme(!document.body.classList.contains('light-mode'));
        });
    }

    const themeToggleMobile = document.getElementById('theme-toggle-mobile');
    if (themeToggleMobile) {
        themeToggleMobile.addEventListener('click', () => {
            setTheme(!document.body.classList.contains('light-mode'));
        });
    }

    /* ==================== SCROLL REVEAL ==================== */
    const revealElements = document.querySelectorAll('.reveal');

    if (revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');

                    // Animate skill bars when they become visible
                    if (entry.target.classList.contains('skill-card')) {
                        const fill = entry.target.querySelector('.skill-bar-fill');
                        if (fill) {
                            const level = fill.getAttribute('data-level');
                            setTimeout(() => {
                                fill.style.width = level + '%';
                            }, 200);
                        }
                    }
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        revealElements.forEach(el => revealObserver.observe(el));
    }

    /* ==================== ACTIVE NAV LINK HIGHLIGHT ==================== */
    const sections = document.querySelectorAll('section[id]');

    if (sections.length > 0) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY + 100;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
                    document.querySelectorAll('.nav-link').forEach(link => {
                        link.style.color = '';
                        if (link.getAttribute('href') === '#' + sectionId) {
                            link.style.color = 'var(--color-accent)';
                        }
                    });
                }
            });
        });
    }

    /* ==================== CONTACT FORM (RESEND) ==================== */
    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const name = document.getElementById('contact-name').value.trim();
            const email = document.getElementById('contact-email').value.trim();
            const subject = document.getElementById('contact-subject').value.trim();
            const message = document.getElementById('contact-message').value.trim();
            const status = document.getElementById('form-status');
            const btn = document.getElementById('submit-btn');

            if (!name || !email || !subject || !message) {
                status.textContent = 'Please fill in all fields.';
                status.className = 'form-status error';
                return;
            }

            // Show loading state
            btn.disabled = true;
            btn.innerHTML = '<span>Sending...</span><i class="fa-solid fa-spinner fa-spin"></i>';
            status.textContent = '';
            status.className = 'form-status';

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message }),
                });

                const data = await response.json();

                if (response.ok) {
                    btn.innerHTML = '<span>Sent!</span><i class="fa-solid fa-check"></i>';
                    status.textContent = 'Message sent successfully! I\'ll get back to you soon.';
                    status.className = 'form-status success';
                    contactForm.reset();
                } else {
                    throw new Error(data.error || 'Failed to send message.');
                }
            } catch (err) {
                btn.innerHTML = '<span>Try Again</span><i class="fa-solid fa-arrow-right"></i>';
                status.textContent = err.message || 'Something went wrong. Please try again.';
                status.className = 'form-status error';
            }

            // Reset button after 4 seconds
            setTimeout(() => {
                btn.disabled = false;
                btn.innerHTML = '<span>Send Message</span><i class="fa-solid fa-arrow-right"></i>';
                status.textContent = '';
                status.className = 'form-status';
            }, 4000);
        });
    }

});