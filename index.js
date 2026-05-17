document.addEventListener('DOMContentLoaded', () => {
    const productButtonsContainer = document.getElementById('product-buttons');
    const receiptList             = document.getElementById('receipt-list');
    const totalPriceElement       = document.getElementById('total-price');
    const clearBtn                = document.getElementById('clear-btn');

    let total = 0;

    // Load price list from JSON
    fetch('price_list.json')
        .then(response => response.json())
        .then(prices => {
            for (const [product, price] of Object.entries(prices)) {
                const btn       = document.createElement('button');
                btn.className   = 'product-btn';
                btn.textContent = product;
                btn.onclick     = () => addItem(product, price);
                productButtonsContainer.appendChild(btn);
            }
        })
        .catch(error => console.error('Error loading prices:', error));

    function addItem(product, price) {
        // Get the very last item in the receipt list
        let lastItem = receiptList.lastElementChild;

        // Check if the last item exists AND if it's the exact same product just clicked
        if (lastItem && lastItem.getAttribute('data-product') === product) {
            let quantity       = parseInt(lastItem.getAttribute('data-quantity')) + 1;
            lastItem.setAttribute('data-quantity', quantity);
            lastItem.innerHTML = `<span>${quantity}x ${product}</span> <span>${(price * quantity).toFixed(2)}€</span>`;
        } else {
            // Create a new entry if the last item was a different product
            const li     = document.createElement('li');
            li.setAttribute('data-product', product);
            li.setAttribute('data-quantity', 1);
            li.innerHTML = `<span>1x ${product}</span> <span>${price.toFixed(2)}€</span>`;
            receiptList.appendChild(li);
        }

        total += price;
        updateTotal();

        // Scroll the receipt list to the bottom
        receiptList.scrollTop = receiptList.scrollHeight;
    }

    clearBtn.addEventListener('click', () => {
        receiptList.innerHTML = '';
        total                 = 0;
        updateTotal();
    });

    function updateTotal() { totalPriceElement.textContent = total.toFixed(2); }
});
