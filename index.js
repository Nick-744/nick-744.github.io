// Function to load menu items from text file
async function loadMenuSection(filename, containerId) {
    try {
        const response  = await fetch(filename)
        const text      = await response.text()
        const container = document.getElementById(containerId)
        
        // Split by lines and filter out empty lines
        const lines = text.split('\n').filter(line => line.trim() !== '')
        
        lines.forEach(line => {
            const [itemName, itemPrice] = line.split('|')
            if (itemName && itemPrice) {
                const menuItem     = document.createElement('div')
                menuItem.className = 'menu-item'
                menuItem.innerHTML = `
                    <span class="item-name">${itemName.trim()}</span>
                    <span class="item-price">${itemPrice.trim()}</span>
                `
                container.appendChild(menuItem)
            }
        })
    }
    catch (error) {
        console.error(`Error loading ${filename}:`, error)

        // Fallback: show error message in the container
        const container     = document.getElementById(containerId)
        container.innerHTML =
            '<div class="menu-item"><span class="item-name">Φόρτωση...</span></div>'
    }

    return;
}

// Load all menu sections when page loads
document.addEventListener('DOMContentLoaded', async function() {
    // Load menu sections
    await Promise.all([
        loadMenuSection('menu-orektika.txt',    'orektika-items'   ),
        loadMenuSection('menu-scharas.txt',     'scharas-items'    ),
        loadMenuSection('menu-salates.txt',     'salates-items'    ),
        loadMenuSection('menu-anapsyktika.txt', 'anapsyktika-items'),
        loadMenuSection('menu-pota.txt',        'pota-items'       )
    ])

    // Remove stuck hover effect and prevent long press issues on mobile
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.querySelectorAll('.menu-item').forEach(function(item) {
            item.addEventListener('touchend', function() {
                // Force reflow to remove :hover
                this.style.pointerEvents = 'none'
                setTimeout(() => { this.style.pointerEvents = '' }, 50)
            })
            // Prevent long press context menu
            item.addEventListener('contextmenu', function(e) {
                e.preventDefault()
            })
            // Prevent text selection on long press
            item.addEventListener('selectstart', function(e) {
                e.preventDefault()
            })
        })
    }
})
