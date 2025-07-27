// MinecraftTR - Main JavaScript
// Ana JavaScript dosyası - Modern ve işlevsel kod

'use strict';

// Utility functions
const utils = {
    // Sayı formatla (1000 -> 1K)
    formatNumber: (num) => {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    },
    
    // Tarih formatla
    formatDate: (date) => {
        return new Date(date).toLocaleDateString('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },
    
    // Toast bildirimi göster
    showToast: (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 15px 25px;
            border-radius: 8px;
            z-index: 9999;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;
        
        const icon = type === 'success' ? 'fas fa-check' : 
                    type === 'error' ? 'fas fa-times' : 'fas fa-info';
        
        toast.innerHTML = `<i class="${icon}" style="margin-right: 8px;"></i>${message}`;
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.style.transform = 'translateX(0)';
        }, 100);
        
        // Animate out and remove
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },
    
    // Clipboard'a kopyala
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback method
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            return true;
        }
    },
    
    // Loading spinner göster/gizle
    setLoading: (element, loading = true) => {
        if (loading) {
            element.disabled = true;
            element.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Yükleniyor...';
        } else {
            element.disabled = false;
            element.innerHTML = element.getAttribute('data-original-text') || 'Tamam';
        }
    }
};

// API functions
const api = {
    // Base API call
    call: async (endpoint, options = {}) => {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },
    
    // Sunucu istatistiklerini al
    getServerStats: () => api.call('/api/server/stats'),
    
    // Market item satın al
    purchaseItem: (itemId) => api.call('/api/purchase', {
        method: 'POST',
        body: JSON.stringify({ itemId })
    }),
    
    // Kullanıcı profili al
    getUserProfile: (username) => api.call(`/api/profile/${username}`),
    
    // Haberler al
    getNews: (limit = 10) => api.call(`/api/news?limit=${limit}`)
};

// Animation helpers
const animations = {
    // Sayı animasyonu
    animateNumber: (element, target, duration = 2000) => {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            
            if (target % 1 === 0) {
                element.textContent = Math.floor(current);
            } else {
                element.textContent = current.toFixed(1);
            }
        }, 16);
    },
    
    // Fade in animasyonu
    fadeIn: (element, duration = 500) => {
        element.style.opacity = '0';
        element.style.transition = `opacity ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.opacity = '1';
        }, 10);
    },
    
    // Slide up animasyonu
    slideUp: (element, duration = 500) => {
        element.style.transform = 'translateY(30px)';
        element.style.opacity = '0';
        element.style.transition = `all ${duration}ms ease`;
        
        setTimeout(() => {
            element.style.transform = 'translateY(0)';
            element.style.opacity = '1';
        }, 10);
    }
};

// Form validation
const forms = {
    // Email validation
    validateEmail: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    // Password strength
    getPasswordStrength: (password) => {
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[0-9]/.test(password)) strength++;
        if (/[^A-Za-z0-9]/.test(password)) strength++;
        
        return {
            score: strength,
            text: ['Çok Zayıf', 'Zayıf', 'Orta', 'Güçlü', 'Çok Güçlü'][strength] || 'Çok Zayıf'
        };
    },
    
    // Form validation
    validateForm: (formElement) => {
        const inputs = formElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;
        
        inputs.forEach(input => {
            const value = input.value.trim();
            const errorElement = input.parentNode.querySelector('.error-message');
            
            // Remove existing error
            if (errorElement) {
                errorElement.remove();
            }
            
            if (!value) {
                forms.showFieldError(input, 'Bu alan zorunludur');
                isValid = false;
            } else if (input.type === 'email' && !forms.validateEmail(value)) {
                forms.showFieldError(input, 'Geçerli bir email adresi giriniz');
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    // Show field error
    showFieldError: (field, message) => {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.cssText = 'color: #ef4444; font-size: 0.875rem; margin-top: 5px;';
        errorElement.textContent = message;
        field.parentNode.appendChild(errorElement);
        field.style.borderColor = '#ef4444';
    }
};

// Theme manager
const theme = {
    // Dark mode toggle
    toggleDarkMode: () => {
        document.body.classList.toggle('dark-mode');
        localStorage.setItem('darkMode', document.body.classList.contains('dark-mode'));
    },
    
    // Initialize theme
    init: () => {
        const savedTheme = localStorage.getItem('darkMode');
        if (savedTheme === 'true') {
            document.body.classList.add('dark-mode');
        }
    }
};

// Search functionality
const search = {
    // Debounce function
    debounce: (func, wait) => {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },
    
    // Search items
    searchItems: (query, items) => {
        const lowercaseQuery = query.toLowerCase();
        return items.filter(item => 
            item.name.toLowerCase().includes(lowercaseQuery) ||
            item.description.toLowerCase().includes(lowercaseQuery)
        );
    }
};

// Modal manager
const modal = {
    // Show modal
    show: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            modal.style.opacity = '0';
            modal.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                modal.style.opacity = '1';
            }, 10);
            
            // Close on background click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.hide(modalId);
                }
            });
        }
    },
    
    // Hide modal
    hide: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.opacity = '0';
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
};

// Server status manager
const serverStatus = {
    // Update player count
    updatePlayerCount: async () => {
        try {
            const stats = await api.getServerStats();
            const element = document.getElementById('player-count');
            
            if (element) {
                element.textContent = `Oyuncu: ${stats.online_players}/${stats.max_players}`;
            }
            
            // Update other stats if present
            const heroPlayerCount = document.getElementById('hero-player-count');
            if (heroPlayerCount) {
                heroPlayerCount.textContent = `${stats.online_players}/${stats.max_players} Oyuncu`;
            }
            
        } catch (error) {
            console.error('Failed to update player count:', error);
        }
    },
    
    // Initialize auto-update
    init: () => {
        serverStatus.updatePlayerCount();
        setInterval(serverStatus.updatePlayerCount, 30000); // Update every 30 seconds
    }
};

// Skin viewer (for Minecraft avatars)
const skinViewer = {
    // Get player skin URL
    getSkinUrl: (username, size = 64) => {
        return `https://crafatar.com/avatars/${username}?size=${size}`;
    },
    
    // Get player head URL
    getHeadUrl: (username, size = 32) => {
        return `https://crafatar.com/heads/${username}?size=${size}`;
    },
    
    // Load player skin
    loadSkin: (username, element) => {
        const img = element.querySelector('img') || element;
        img.src = skinViewer.getSkinUrl(username);
        img.onerror = () => {
            img.src = '/images/default-avatar.png';
        };
    }
};

// Global functions (accessible from HTML)
window.MinecraftTR = {
    utils,
    api,
    animations,
    forms,
    theme,
    search,
    modal,
    serverStatus,
    skinViewer
};

// Copy IP function (used in HTML)
window.copyIP = async () => {
    const ip = 'play.minecrafttr.com';
    try {
        await utils.copyToClipboard(ip);
        utils.showToast('IP adresi kopyalandı!');
    } catch (error) {
        utils.showToast('Kopyalama başarısız!', 'error');
    }
};

// Toggle mobile menu
window.toggleMobileMenu = () => {
    const nav = document.getElementById('navbar-nav');
    if (nav) {
        nav.classList.toggle('active');
    }
};

// Purchase item function
window.purchaseItem = async (itemId) => {
    try {
        utils.setLoading(event.target, true);
        const result = await api.purchaseItem(itemId);
        
        if (result.success) {
            utils.showToast('Satın alma başarılı!');
            // Refresh page or update UI
            setTimeout(() => window.location.reload(), 1500);
        } else {
            utils.showToast(result.message || 'Satın alma başarısız!', 'error');
        }
    } catch (error) {
        utils.showToast('Bir hata oluştu!', 'error');
    } finally {
        utils.setLoading(event.target, false);
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🎮 MinecraftTR Website Loaded!');
    
    // Initialize theme
    theme.init();
    
    // Initialize server status
    serverStatus.init();
    
    // Animate stat numbers
    const statNumbers = document.querySelectorAll('[data-count]');
    if (statNumbers.length > 0) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const target = parseFloat(entry.target.getAttribute('data-count'));
                    animations.animateNumber(entry.target, target);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        statNumbers.forEach(stat => observer.observe(stat));
    }
    
    // Intersection Observer for scroll animations
    const observeElements = document.querySelectorAll('.feature-card, .news-card, .donor-card, .market-card');
    if (observeElements.length > 0) {
        const scrollObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animations.slideUp(entry.target);
                    scrollObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });
        
        observeElements.forEach(el => scrollObserver.observe(el));
    }
    
    // Initialize forms
    const forms_elements = document.querySelectorAll('form');
    forms_elements.forEach(form => {
        form.addEventListener('submit', (e) => {
            if (!forms.validateForm(form)) {
                e.preventDefault();
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        const nav = document.getElementById('navbar-nav');
        const menuBtn = document.querySelector('.mobile-menu-btn');
        
        if (nav && nav.classList.contains('active') && 
            !nav.contains(e.target) && 
            !menuBtn.contains(e.target)) {
            nav.classList.remove('active');
        }
    });
    
    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Lazy load images
    const images = document.querySelectorAll('img[data-src]');
    if (images.length > 0) {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
    
    // Add ripple effect to buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function(e) {
            const ripple = document.createElement('span');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.cssText = `
                position: absolute;
                border-radius: 50%;
                background: rgba(255,255,255,0.3);
                transform: scale(0);
                animation: ripple 0.6s linear;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                pointer-events: none;
            `;
            
            this.style.position = 'relative';
            this.style.overflow = 'hidden';
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// Add ripple animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
    
    .lazy {
        opacity: 0;
        transition: opacity 0.3s;
    }
    
    .lazy.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(style);

// Console welcome message
console.log(`
🎮 MinecraftTR Website
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🌟 Türkiye'nin En İyi Minecraft Sunucusu
🔧 Modern JavaScript Framework Loaded
📱 Responsive Design Active
🚀 All Systems Ready!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { utils, api, animations, forms, theme, search, modal, serverStatus, skinViewer };
}