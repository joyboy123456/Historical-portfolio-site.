// Portfolio Website JavaScript

// 官方 Supabase 配置
const supabaseUrl = "https://jcxlgmmudtbizyinqyrq.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpjeGxnbW11ZHRiaXp5aW5xeXJxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE2MTc3MzksImV4cCI6MjA3NzE5MzczOX0.SYmaIOEVhS5P-wJmlUoP_mhOlrhVQo7OaEZYbDGKuVg";

const { createClient } = supabase;
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener('DOMContentLoaded', function() {
    // Navigation Elements
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navigation = document.getElementById('navigation');

    // Mobile Navigation Toggle
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        // Close mobile menu when clicking on nav links
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }

    // Smooth Scrolling for Navigation Links
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 72; // Account for fixed navigation
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Active Navigation Link Highlighting
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section[id]');
        const scrollPosition = window.scrollY + 100;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            const correspondingNavLink = document.querySelector(`a[href="#${sectionId}"]`);

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                // Remove active class from all nav links
                navLinks.forEach(link => link.classList.remove('active'));
                
                // Add active class to current nav link
                if (correspondingNavLink) {
                    correspondingNavLink.classList.add('active');
                }
            }
        });
    }

    // Throttled Scroll Event Listener
    let ticking = false;
    
    function handleScroll() {
        if (!ticking) {
            requestAnimationFrame(() => {
                updateActiveNavLink();
                updateNavigationBackground();
                ticking = false;
            });
            ticking = true;
        }
    }

    // Navigation Background Opacity
    function updateNavigationBackground() {
        const scrolled = window.scrollY;
        
        if (scrolled > 50) {
            navigation.style.backgroundColor = 'rgba(254, 254, 254, 0.95)';
            navigation.style.backdropFilter = 'blur(10px)';
        } else {
            navigation.style.backgroundColor = '#FEFEFE';
            navigation.style.backdropFilter = 'none';
        }
    }

    // Scroll Event Listener
    window.addEventListener('scroll', handleScroll);

    // Initial call to set active state
    updateActiveNavLink();
    updateNavigationBackground();

    // 加载作品
    loadPortfolioProjects();

    // Portfolio Item Click Handling
    const portfolioItems = document.querySelectorAll('.portfolio-item');
    
    portfolioItems.forEach(item => {
        item.addEventListener('click', function() {
            // Add click animation
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Intersection Observer for Animations
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

    // Observe portfolio items for scroll animations
    portfolioItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 600ms ease-out, transform 600ms ease-out';
        observer.observe(item);
    });

    // Observe other sections
    const sections = document.querySelectorAll('.about-content, .contact-content');
    sections.forEach(section => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(30px)';
        section.style.transition = 'opacity 600ms ease-out, transform 600ms ease-out';
        observer.observe(section);
    });

    // Email Link Handling
    const emailLinks = document.querySelectorAll('a[href^="mailto:"]');
    
    emailLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });

    // Button Click Handling
    const buttons = document.querySelectorAll('.btn');
    
    buttons.forEach(button => {
        button.addEventListener('click', function(e) {
            // Add ripple effect
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'rgba(255, 255, 255, 0.3)';
            ripple.style.transform = 'scale(0)';
            ripple.style.animation = 'ripple 600ms linear';
            ripple.style.pointerEvents = 'none';
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // Add ripple animation keyframes
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Keyboard Navigation Support
    document.addEventListener('keydown', function(e) {
        // Close mobile menu with Escape key
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        }
        
        // Navigate with arrow keys when menu is open
        if (navMenu.classList.contains('active') && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
            e.preventDefault();
            const focusableElements = navMenu.querySelectorAll('.nav-link');
            const currentIndex = Array.from(focusableElements).indexOf(document.activeElement);
            
            let nextIndex;
            if (e.key === 'ArrowDown') {
                nextIndex = (currentIndex + 1) % focusableElements.length;
            } else {
                nextIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
            }
            
            focusableElements[nextIndex].focus();
        }
    });

    // Performance Optimization: Lazy Loading for Images
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src || img.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });

        const lazyImages = document.querySelectorAll('img[loading="lazy"]');
        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    }

    // Error Handling for Images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', function() {
            // Hide broken images or show placeholder
            this.style.display = 'none';
            
            // Create placeholder if it's a portfolio image
            if (this.closest('.portfolio-item')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'image-placeholder';
                placeholder.style.cssText = `
                    width: 100%;
                    height: 200px;
                    background-color: #F9F9F7;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #6B6B6B;
                    font-family: 'Inter', sans-serif;
                    font-size: 14px;
                `;
                placeholder.textContent = '图片加载失败';
                this.parentNode.insertBefore(placeholder, this);
            }
        });
    });

    // Smooth scroll to top functionality
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Add scroll to top button (optional)
    const scrollToTopButton = document.createElement('button');
    scrollToTopButton.innerHTML = '↑';
    scrollToTopButton.className = 'scroll-to-top';
    scrollToTopButton.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background-color: #B8001F;
        color: white;
        border: none;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 300ms ease-out;
        z-index: 1000;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    `;

    document.body.appendChild(scrollToTopButton);

    // Show/hide scroll to top button
    window.addEventListener('scroll', () => {
        if (window.scrollY > 500) {
            scrollToTopButton.style.opacity = '1';
            scrollToTopButton.style.visibility = 'visible';
        } else {
            scrollToTopButton.style.opacity = '0';
            scrollToTopButton.style.visibility = 'hidden';
        }
    });

    scrollToTopButton.addEventListener('click', scrollToTop);

    // Console welcome message
    console.log('%c欢迎访问李明的作品集！', 'color: #B8001F; font-size: 16px; font-weight: bold;');
    console.log('%c如果您对网站的技术实现感兴趣，欢迎交流讨论。', 'color: #4A4A4A; font-size: 14px;');
});

// 加载作品数据
async function loadPortfolioProjects() {
    const loading = document.getElementById('portfolio-loading');
    const grid = document.getElementById('portfolio-grid');

    try {
        // 使用直接 fetch 调用，绕过 Supabase SDK 的问题
        const response = await fetch(`${supabaseUrl}/functions/v1/projects-api`, {
            headers: {
                'Authorization': `Bearer ${supabaseAnonKey}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const projects = data.data || [];

        if (projects.length === 0) {
            loading.textContent = '暂无作品';
            return;
        }

        // 渲染作品
        grid.innerHTML = projects.map(project => `
            <article class="portfolio-item" data-project-id="${project.id}">
                <div class="portfolio-image">
                    <img src="${project.image_url}" alt="${project.title}" loading="lazy" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'400\\' height=\\'300\\'%3E%3Crect fill=\\'%23f0f0f0\\' width=\\'400\\' height=\\'300\\'/%3E%3Ctext x=\\'50%25\\' y=\\'50%25\\' dominant-baseline=\\'middle\\' text-anchor=\\'middle\\' fill=\\'%23999\\' font-family=\\'Arial\\' font-size=\\'18\\'%3E图片加载失败%3C/text%3E%3C/svg%3E'">
                </div>
                <div class="portfolio-content">
                    <h3 class="portfolio-title">${project.title}</h3>
                    <p class="portfolio-description">${project.description.substring(0, 100)}${project.description.length > 100 ? '...' : ''}</p>
                    <div class="portfolio-tags">
                        ${project.tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                </div>
            </article>
        `).join('');

        // 存储项目数据供后续使用
        window.portfolioProjects = projects;

        // 隐藏加载提示，显示作品网格
        loading.style.display = 'none';
        grid.style.display = 'grid';

        // 重新应用观察者动画和点击事件
        const portfolioItems = document.querySelectorAll('.portfolio-item');
        portfolioItems.forEach(item => {
            // 点击打开详情
            item.addEventListener('click', function() {
                const projectId = this.getAttribute('data-project-id');
                const project = window.portfolioProjects.find(p => p.id === projectId);
                if (project) {
                    openProjectModal(project);
                }
            });

            // 鼠标悬停效果
            item.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-8px)';
            });

            item.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
            });

            // 动画效果
            item.style.opacity = '0';
            item.style.transform = 'translateY(30px)';
            item.style.transition = 'opacity 600ms ease-out, transform 600ms ease-out';
            
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
            
            observer.observe(item);
        });

    } catch (error) {
        console.error('加载作品时发生错误:', error);
        loading.textContent = '加载失败，请刷新页面重试';
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Project Modal Functions
function openProjectModal(project) {
    const modal = document.getElementById('projectModal');
    const modalImage = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalCategory = document.getElementById('modalCategory');
    const modalTags = document.getElementById('modalTags');
    const modalDescription = document.getElementById('modalDescription');

    // 设置内容
    modalImage.src = project.image_url;
    modalImage.alt = project.title;
    modalTitle.textContent = project.title;
    modalCategory.textContent = project.category || '未分类';
    modalDescription.textContent = project.description;

    // 渲染标签
    modalTags.innerHTML = project.tags.map(tag => 
        `<span class="tag">${tag}</span>`
    ).join('');

    // 显示模态框
    modal.classList.add('active');
    document.body.classList.add('modal-open');
    
    // 触发动画
    setTimeout(() => {
        modal.classList.add('visible');
    }, 10);

    // 添加关闭事件
    const closeBtn = modal.querySelector('.project-modal-close');
    const overlay = modal.querySelector('.project-modal-overlay');
    
    closeBtn.onclick = closeProjectModal;
    overlay.onclick = closeProjectModal;

    // ESC 键关闭
    document.addEventListener('keydown', handleEscKey);
}

function closeProjectModal() {
    const modal = document.getElementById('projectModal');
    
    modal.classList.remove('visible');
    
    setTimeout(() => {
        modal.classList.remove('active');
        document.body.classList.remove('modal-open');
    }, 300);

    document.removeEventListener('keydown', handleEscKey);
}

function handleEscKey(e) {
    if (e.key === 'Escape') {
        closeProjectModal();
    }
}
