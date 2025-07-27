// Main JavaScript file for MinecraftTR website

// Global configuration
const config = {
    apiBaseUrl: '/api',
    updateInterval: 30000, // 30 seconds
    animationDuration: 300
};

// Utility functions
const utils = {
    // Format numbers with Turkish locale
    formatNumber: (num) => {
        return new Intl.NumberFormat('tr-TR').format(num);
    },

    // Format date with Turkish locale
    formatDate: (date) => {
        return new Intl.DateTimeFormat('tr-TR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(date));
    },

    // Show toast notification
    showToast: (message, type = 'info', duration = 5000) => {
        const toast = document.createElement('div');
        toast.className = `fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full`;
        
        const colors = {
            success: 'bg-green-500 text-white',
            error: 'bg-red-500 text-white',
            warning: 'bg-yellow-500 text-black',
            info: 'bg-blue-500 text-white'
        };
        
        toast.className += ` ${colors[type] || colors.info}`;
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas fa-${type === 'success' ? 'check' : type === 'error' ? 'exclamation-triangle' : type === 'warning' ? 'exclamation' : 'info'} mr-2"></i>
                <span>${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 opacity-70 hover:opacity-100">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.remove('translate-x-full');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.add('translate-x-full');
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, duration);
    },

    // Copy text to clipboard
    copyToClipboard: async (text) => {
        try {
            await navigator.clipboard.writeText(text);
            utils.showToast('Kopyalandı!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            utils.showToast('Kopyalandı!', 'success');
        }
    },

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

    // Smooth scroll to element
    scrollTo: (element, offset = 0) => {
        const target = typeof element === 'string' ? document.querySelector(element) : element;
        if (target) {
            const targetPosition = target.offsetTop - offset;
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    }
};

// API functions
const api = {
    // Get server statistics
    getServerStats: async () => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/server/stats`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching server stats:', error);
            return null;
        }
    },

    // Get player profile
    getPlayerProfile: async (username) => {
        try {
            const response = await fetch(`${config.apiBaseUrl}/player/${username}`);
            return await response.json();
        } catch (error) {
            console.error('Error fetching player profile:', error);
            return null;
        }
    },

    // Purchase item
    purchaseItem: async (itemId) => {
        try {
            const response = await fetch('/purchase', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ itemId })
            });
            return await response.json();
        } catch (error) {
            console.error('Error purchasing item:', error);
            return { success: false, message: 'Bir hata oluştu!' };
        }
    }
};

// Server status updater
const serverStatus = {
    elements: [],
    
    init: () => {
        // Find all elements that need server status updates
        serverStatus.elements = [
            ...document.querySelectorAll('[data-server-stat]'),
            document.getElementById('player-count'),
            document.getElementById('hero-player-count')
        ].filter(Boolean);
        
        if (serverStatus.elements.length > 0) {
            serverStatus.update();
            setInterval(serverStatus.update, config.updateInterval);
        }
    },
    
    update: async () => {
        const stats = await api.getServerStats();
        if (stats) {
            serverStatus.elements.forEach(element => {
                if (element.id === 'player-count') {
                    element.textContent = `Oyuncu: ${stats.online_players}/${stats.max_players}`;
                } else if (element.id === 'hero-player-count') {
                    element.textContent = `${stats.online_players}/${stats.max_players} Oyuncu`;
                } else {
                    const statType = element.getAttribute('data-server-stat');
                    if (stats[statType] !== undefined) {
                        element.textContent = utils.formatNumber(stats[statType]);
                    }
                }
            });
        }
    }
};

// Animation helpers
const animations = {
    // Counter animation
    animateCounter: (element, target, duration = 2000) => {
        const start = parseInt(element.textContent) || 0;
        const increment = (target - start) / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if ((increment > 0 && current >= target) || (increment < 0 && current <= target)) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    },

    // Fade in animation
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let opacity = 0;
        const increment = 1 / (duration / 16);
        
        const timer = setInterval(() => {
            opacity += increment;
            if (opacity >= 1) {
                opacity = 1;
                clearInterval(timer);
            }
            element.style.opacity = opacity;
        }, 16);
    },

    // Slide down animation
    slideDown: (element, duration = 300) => {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight;
        let height = 0;
        const increment = targetHeight / (duration / 16);
        
        const timer = setInterval(() => {
            height += increment;
            if (height >= targetHeight) {
                height = targetHeight;
                clearInterval(timer);
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            }
            element.style.height = height + 'px';
        }, 16);
    }
};

// Form helpers
const forms = {
    // Validate username
    validateUsername: (username) => {
        const regex = /^[a-zA-Z0-9_]{3,16}$/;
        return regex.test(username);
    },

    // Validate email
    validateEmail: (email) => {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    },

    // Password strength checker
    checkPasswordStrength: (password) => {
        let strength = 0;
        const checks = [
            password.length >= 8,
            /[a-z]/.test(password),
            /[A-Z]/.test(password),
            /[0-9]/.test(password),
            /[^A-Za-z0-9]/.test(password)
        ];
        
        strength = checks.filter(Boolean).length;
        
        const levels = ['Çok Zayıf', 'Zayıf', 'Orta', 'İyi', 'Güçlü'];
        const colors = ['red', 'orange', 'yellow', 'green', 'green'];
        
        return {
            score: strength,
            level: levels[Math.min(strength, 4)],
            color: colors[Math.min(strength, 4)],
            percentage: (strength / 5) * 100
        };
    }
};

// Theme manager
const theme = {
    init: () => {
        const saved = localStorage.getItem('theme');
        if (saved) {
            theme.set(saved);
        }
    },
    
    set: (themeName) => {
        document.documentElement.setAttribute('data-theme', themeName);
        localStorage.setItem('theme', themeName);
    },
    
    toggle: () => {
        const current = document.documentElement.getAttribute('data-theme');
        theme.set(current === 'light' ? 'dark' : 'light');
    }
};

// Search functionality
const search = {
    init: () => {
        const searchInput = document.querySelector('[data-search]');
        if (searchInput) {
            searchInput.addEventListener('input', utils.debounce(search.perform, 300));
        }
    },
    
    perform: (event) => {
        const query = event.target.value.toLowerCase();
        const searchables = document.querySelectorAll('[data-searchable]');
        
        searchables.forEach(element => {
            const text = element.textContent.toLowerCase();
            const isVisible = text.includes(query);
            element.style.display = isVisible ? 'block' : 'none';
        });
    }
};

// Modal manager
const modal = {
    open: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
            document.body.style.overflow = 'hidden';
        }
    },
    
    close: (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
            document.body.style.overflow = 'auto';
        }
    },
    
    init: () => {
        // Close modal when clicking outside
        document.addEventListener('click', (event) => {
            if (event.target.classList.contains('modal-overlay')) {
                const modalId = event.target.id;
                modal.close(modalId);
            }
        });
        
        // Close modal with escape key
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                const openModal = document.querySelector('.modal-overlay.flex');
                if (openModal) {
                    modal.close(openModal.id);
                }
            }
        });
    }
};

// Intersection Observer for animations
const observeElements = () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Animate counters
                if (entry.target.hasAttribute('data-count')) {
                    const target = parseFloat(entry.target.getAttribute('data-count'));
                    animations.animateCounter(entry.target, target);
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });

    // Observe all elements with animation classes
    document.querySelectorAll('[data-animate], [data-count]').forEach(el => {
        observer.observe(el);
    });
};

// Minecraft skin viewer
const skinViewer = {
    generateSkinUrl: (username, size = 64) => {
        return `https://crafatar.com/avatars/${username}?size=${size}&overlay`;
    },
    
    generateBodyUrl: (username, size = 64) => {
        return `https://crafatar.com/renders/body/${username}?size=${size}&overlay`;
    },
    
    generateHeadUrl: (username, size = 64) => {
        return `https://crafatar.com/renders/head/${username}?size=${size}&overlay`;
    }
};

// Lazy loading for images
const lazyLoad = {
    init: () => {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('opacity-0');
                    img.classList.add('opacity-100');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
};

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('MinecraftTR website loaded');
    
    // Initialize components
    serverStatus.init();
    theme.init();
    search.init();
    modal.init();
    lazyLoad.init();
    observeElements();
    
    // Global IP copy function
    window.copyIP = () => {
        utils.copyToClipboard('play.minecrafttr.com');
    };
    
    // Global functions for templates
    window.utils = utils;
    window.api = api;
    window.modal = modal;
    window.skinViewer = skinViewer;
});

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
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
}