// Simple and elegant menu application
class MenuApp {
    constructor() {
        this.currentFilter = 'all';
        this.init();
    }

    async init() {
        await this.loadMenu();
        this.setupNavigation();
    }

    // Load menu data from JSON
    async loadMenu() {
        try {
            const response = await fetch('menus.json');
            const menuData = await response.json();
            
            const sections = {
                'orektika':    'orektika-items',
                'scharas':     'scharas-items', 
                'salates':     'salates-items',
                'anapsyktika': 'anapsyktika-items',
                'pota':        'pota-items'
            };

            Object.entries(sections).forEach(([key, containerId]) => {
                const container = document.getElementById(containerId);
                const section   = menuData[key];
                
                if (container && section?.items) {
                    container.innerHTML = '';
                    section.items.forEach(item => {
                        container.appendChild(this.createMenuItem(item.name, item.price_text));
                    });
                }
            });
        }
        catch (error) { 
            console.error('Failed to load menu:', error);
            this.showErrorMessage();
        }
    }

    // Show error message when menu fails to load
    showErrorMessage() {
        // Hide navigation
        const navigation = document.querySelector('.menu-navigation');
        if (navigation) { navigation.style.display = 'none'; }

        // Hide all menu sections
        document.querySelectorAll('.menu-section').forEach(section => {
            section.style.display = 'none';
        });

        // Create and show error message
        const menuContent = document.querySelector('.menu-content');
        if (menuContent) {
            menuContent.innerHTML = `
                <div class = "error-message">
                    <span class = "error-icon">⚠️</span>
                    <h2>Ο κατάλογος δεν είναι διαθέσιμος...</h2>
                </div>
            `;
        }
    }

    // Create a menu item element
    createMenuItem(name, price) {
        const item     = document.createElement('div');
        item.className = 'menu-item';
        item.innerHTML = `
            <span class = "item-name">${name}</span>
            <span class = "item-price">${price}</span>
        `;
        return item;
    }

    // Setup navigation buttons
    setupNavigation() {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                this.filterMenu(section);
                this.setActiveButton(btn);
            });
        });
    }

    // Filter menu sections
    filterMenu(section) {
        document.querySelectorAll('.menu-section').forEach(menuSection => {
            const category            = menuSection.dataset.category;
            menuSection.style.display = (section === 'all' || category === section) ? 'block' : 'none';
        });
    }

    // Set active navigation button
    setActiveButton(activeBtn) {
        document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));
        activeBtn.classList.add('active');
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => { new MenuApp(); });
