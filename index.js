class MenuApp {
    constructor() {
        this.currentFilter = 'all';
        this.menuData = {};
        this.isLoading = false;
        this.init();
    }

    async init() {
        await this.loadAllMenuSections();
        this.setupNavigation();
        this.setupMobileEnhancements();
        this.setupErrorHandling();
    }

    // Function to load menu items from text file with error handling
    async loadMenuSection(filename, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // Show loading state
        container.innerHTML = '<div class="loading">Φόρτωση...</div>';

        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const text = await response.text();
            
            // Split by lines and filter out empty lines
            const lines = text.split('\n').filter(line => line.trim() !== '');
            
            // Clear loading state
            container.innerHTML = '';
            
            if (lines.length === 0) {
                container.innerHTML = '<div class="menu-item"><span class="item-name">Δεν υπάρχουν διαθέσιμα προϊόντα</span></div>';
                return;
            }

            // Store data for filtering
            this.menuData[containerId] = lines;
            
            lines.forEach((line, index) => {
                const [itemName, itemPrice] = line.split('|');
                if (itemName && itemPrice) {
                    const menuItem = this.createMenuItem(itemName.trim(), itemPrice.trim(), index);
                    container.appendChild(menuItem);
                }
            });

        }
        catch (error) {
            console.error(`Error loading ${filename}:`, error);
            container.innerHTML = `
                <div class="menu-item error-item">
                    <span class="item-name">Σφάλμα φόρτωσης. Δοκιμάστε ξανά.</span>
                    <button class="retry-btn" onclick="menuApp.loadMenuSection('${filename}', '${containerId}')">↻</button>
                </div>
            `;
        }
    }

    createMenuItem(name, price, index) {
        const menuItem = document.createElement('div');
        menuItem.className = 'menu-item';
        menuItem.style.animationDelay = `${index * 0.1}s`;
        menuItem.innerHTML = `
            <span class="item-name">${name}</span>
            <span class="item-price">${price}</span>
        `;
        
        // Add touch feedback
        this.addTouchFeedback(menuItem);
        
        return menuItem;
    }

    addTouchFeedback(element) {
        let touchTimer;
        
        element.addEventListener('touchstart', (e) => {
            clearTimeout(touchTimer);
            element.style.transform = 'scale(0.98)';
        }, { passive: true });

        element.addEventListener('touchend', (e) => {
            touchTimer = setTimeout(() => {
                element.style.transform = '';
            }, 150);
        }, { passive: true });

        element.addEventListener('touchcancel', (e) => {
            clearTimeout(touchTimer);
            element.style.transform = '';
        }, { passive: true });
    }

    async loadAllMenuSections() {
        this.isLoading = true;
        
        try {
            await Promise.all([
                this.loadMenuSection('menu-orektika.txt', 'orektika-items'),
                this.loadMenuSection('menu-scharas.txt', 'scharas-items'),
                this.loadMenuSection('menu-salates.txt', 'salates-items'),
                this.loadMenuSection('menu-anapsyktika.txt', 'anapsyktika-items'),
                this.loadMenuSection('menu-pota.txt', 'pota-items')
            ]);
        }
        catch (error) {
            console.error('Error loading menu sections:', error);
        }
        finally {
            this.isLoading = false;
        }
    }

    setupNavigation() {
        const navButtons = document.querySelectorAll('.nav-btn');
        
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const section = btn.dataset.section;
                this.filterMenu(section);
                this.setActiveButton(btn);
                
                // Smooth scroll to top on mobile
                if (window.innerWidth <= 768) {
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                }
            });

            // Add touch feedback to nav buttons
            this.addTouchFeedback(btn);
        });
    }

    filterMenu(section) {
        const menuSections = document.querySelectorAll('.menu-section');
        
        menuSections.forEach(menuSection => {
            const category = menuSection.dataset.category;
            
            if (section === 'all' || category === section) {
                menuSection.classList.remove('hidden');
                // Trigger animation
                menuSection.style.opacity = '0';
                menuSection.style.transform = 'translateY(20px)';
                
                requestAnimationFrame(() => {
                    menuSection.style.transition = 'all 0.3s ease';
                    menuSection.style.opacity = '1';
                    menuSection.style.transform = 'translateY(0)';
                });
            }
            else {
                menuSection.classList.add('hidden');
            }
        });

        this.currentFilter = section;
    }

    setActiveButton(activeBtn) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        activeBtn.classList.add('active');
    }

    setupMobileEnhancements() {
        // Prevent zoom on double tap for iOS
        let lastTouchEnd = 0;
        document.addEventListener('touchend', (e) => {
            const now = new Date().getTime();
            if (now - lastTouchEnd <= 300) {
                e.preventDefault();
            }
            lastTouchEnd = now;
        }, false);

        // Handle orientation change
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.handleResize();
            }, 100);
        });

        // Handle resize
        window.addEventListener('resize', () => { this.handleResize(); });

        // Prevent context menu on long press for menu items
        document.addEventListener('contextmenu', (e) => {
            if (e.target.closest('.menu-item')) {
                e.preventDefault();
            }
        });

        // Remove hover effects on touch devices
        if ('ontouchstart' in window) {
            document.body.classList.add('touch-device');
        }

        // Handle scroll performance
        let ticking = false;
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        }, { passive: true });
    }

    handleResize() {
        // Recalculate navigation scroll if needed
        const nav = document.querySelector('.menu-navigation');
        if (nav.scrollWidth > nav.clientWidth) {
            const activeBtn = nav.querySelector('.nav-btn.active');
            if (activeBtn) {
                activeBtn.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }
        }
    }

    handleScroll() {
        const nav = document.querySelector('.menu-navigation');
        const scrolled = window.pageYOffset;
        
        // Add shadow to navigation when scrolled
        if (scrolled > 10) {
            nav.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        }
        else {
            nav.style.boxShadow = 'none';
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Global error:', e.error);
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('Unhandled promise rejection:', e.reason);
        });
    }

    // Retry failed loads
    async retryLoad() {
        if (this.isLoading) return;
        await this.loadAllMenuSections();
    }
}

// Initialize the app when DOM is loaded
let menuApp;

document.addEventListener('DOMContentLoaded', () => {
    menuApp = new MenuApp();
    
    // Add CSS animation class after load
    setTimeout(() => {
        document.body.classList.add('loaded');
    }, 100);
});

// Add performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log('Page load time:', loadTime + 'ms');
        }, 0);
    });
}

// Service Worker registration for offline support (future enhancement)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Future: Register service worker for offline functionality
        console.log('Service worker support detected');
    });
}
