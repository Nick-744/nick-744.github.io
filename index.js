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
        const li     = document.createElement('li');
        li.innerHTML = `<span>${product}</span> <span>${price.toFixed(2)}€</span>`;
        receiptList.appendChild(li);

        total += price;
        updateTotal();
    }

    clearBtn.addEventListener('click', () => {
        receiptList.innerHTML = '';
        total                 = 0;
        updateTotal();
    });

    function updateTotal() { totalPriceElement.textContent = total.toFixed(2); }
});
