
/* ==========================================
   NIJER BAJAR - MAIN JAVASCRIPT
   Existing Features + Toys & Foods
========================================== */

// DELIVERY CHARGE
const deliveryOptions = document.querySelectorAll(
    'input[name="delivery"]'
);

function getDeliveryCharge() {
    const selected = document.querySelector(
        'input[name="delivery"]:checked'
    );
    return selected && selected.value === 'outside' ? 120 : 80;
}

// CART
let cart = JSON.parse(
    localStorage.getItem('nijerBajarCart')
) || [];

const cartCount = document.querySelector('.cart');

function updateCartCount() {
    if (cartCount) {
        cartCount.textContent = '🛒 Cart (' + cart.length + ')';
    }
}

function saveCart() {
    localStorage.setItem('nijerBajarCart', JSON.stringify(cart));
}

updateCartCount();

// CART BUTTONS FOR STATIC PRODUCTS
document.querySelectorAll('.cart-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const card = this.closest('.product-card');
        if (!card) return;

        const name = card.querySelector('h3').textContent.trim();
        const price = card.querySelector('.price span').textContent.trim();

        cart.push({ name, price });
        saveCart();
        updateCartCount();
        alert(name + ' added to cart!');
    });
});

// CART PAGE
const cartItemsContainer = document.getElementById(
    'cart-items-container'
);

function displayCartProducts() {
    if (!cartItemsContainer) return;

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to your cart to continue.</p>
                <a href="index.html" class="continue-btn">
                    Continue Shopping
                </a>
            </div>
        `;
        updateOrderSummary();
        return;
    }

    cartItemsContainer.innerHTML = '';

    cart.forEach(function(product, index) {
        const item = document.createElement('div');
        item.className = 'cart-product';

        item.innerHTML = `
            <div class="cart-product-info">
                <h3></h3>
                <p class="cart-item-price"></p>
                <p>Quantity: 1</p>
            </div>
            <button class="remove-cart-btn"
                data-index="${index}" type="button">×</button>
        `;

        item.querySelector('h3').textContent = product.name;
        item.querySelector('.cart-item-price').textContent =
            'Price: ' + product.price;

        cartItemsContainer.appendChild(item);
    });

    addRemoveButtons();
}

function addRemoveButtons() {
    document.querySelectorAll('.remove-cart-btn').forEach(
        function(button) {
            button.addEventListener('click', function() {
                const index = Number(this.dataset.index);
                cart.splice(index, 1);
                saveCart();
                updateCartCount();
                displayCartProducts();
                updateOrderSummary();
            });
        }
    );
}

// ORDER SUMMARY
function getSubtotal() {
    return cart.reduce(function(total, product) {
        const price = Number(
            String(product.price).replace(/[^\d.]/g, '')
        );
        return total + (Number.isFinite(price) ? price : 0);
    }, 0);
}

function updateOrderSummary() {
    const rows = document.querySelectorAll(
        '.order-summary .summary-row'
    );

    const subtotalElement = rows[0]
        ? rows[0].querySelector('strong') : null;
    const deliveryElement = rows[1]
        ? rows[1].querySelector('strong') : null;
    const totalElement = document.querySelector(
        '.order-summary .summary-total strong'
    );

    if (!subtotalElement || !deliveryElement || !totalElement) {
        return;
    }

    const subtotal = getSubtotal();
    const delivery = getDeliveryCharge();

    subtotalElement.textContent = '৳' + subtotal;
    deliveryElement.textContent = '৳' + delivery;
    totalElement.textContent = '৳' + (subtotal + delivery);
}

deliveryOptions.forEach(function(option) {
    option.addEventListener('change', updateOrderSummary);
});

displayCartProducts();
updateOrderSummary();

// GOOGLE SHEET ORDER CONNECTION
const GOOGLE_SHEET_URL =
    "https://script.google.com/macros/s/AKfycbxcOrlN_lu6Fk_uS42FwbgVajln_o70OVCRuh1-bfRkXWfiwqwtYUPE9x5smA-f-Ca0/exec";

// DIVISION AND DISTRICT
const divisionSelect = document.getElementById('division');
const districtSelect = document.getElementById('district');

const districts = {
    Dhaka: [
        'Dhaka','Faridpur','Gazipur','Gopalganj',
        'Kishoreganj','Madaripur','Manikganj',
        'Munshiganj','Narayanganj','Narsingdi',
        'Rajbari','Shariatpur','Tangail'
    ],
    Chattogram: [
        'Bandarban','Brahmanbaria','Chandpur',
        'Chattogram','Cumilla',"Cox's Bazar",
        'Feni','Khagrachhari','Lakshmipur',
        'Noakhali','Rangamati'
    ],
    Rajshahi: [
        'Bogura','Chapainawabganj','Joypurhat',
        'Naogaon','Natore','Pabna','Rajshahi',
        'Sirajganj'
    ],
    Khulna: [
        'Bagerhat','Chuadanga','Jashore',
        'Jhenaidah','Khulna','Kushtia','Magura',
        'Meherpur','Narail','Satkhira'
    ],
    Barishal: [
        'Barguna','Barishal','Bhola',
        'Jhalokati','Patuakhali','Pirojpur'
    ],
    Sylhet: [
        'Habiganj','Moulvibazar','Sunamganj',
        'Sylhet'
    ],
    Rangpur: [
        'Dinajpur','Gaibandha','Kurigram',
        'Lalmonirhat','Nilphamari','Panchagarh',
        'Rangpur','Thakurgaon'
    ],
    Mymensingh: [
        'Jamalpur','Mymensingh','Netrokona',
        'Sherpur'
    ]
};

if (divisionSelect && districtSelect) {
    divisionSelect.addEventListener('change', function() {
        districtSelect.innerHTML =
            '<option value="">Select District</option>';

        (districts[this.value] || []).forEach(function(district) {
            const option = document.createElement('option');
            option.value = district;
            option.textContent = district;
            districtSelect.appendChild(option);
        });
    });
}

// CONFIRM ORDER
const confirmOrderButton = document.getElementById(
    'confirm-order-btn'
);

if (confirmOrderButton) {
    confirmOrderButton.addEventListener('click', function() {
        const name = document.getElementById('name').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const district = document.getElementById('district').value;
        const area = document.getElementById('area').value.trim();
        const address = document.getElementById('address').value.trim();

        if (!name || !mobile || !district || !area || !address) {
            alert('Please fill in all customer information.');
            return;
        }

        if (cart.length === 0) {
            alert('Please add products to your cart.');
            return;
        }

        const deliveryCharge = getDeliveryCharge();
        const delivery = deliveryCharge === 120
            ? 'Outside Dhaka - ৳120'
            : 'Inside Dhaka - ৳80';

        const products = cart.map(function(product) {
            return product.name + ' - ' + product.price;
        }).join(' | ');

        const orderData = {
            orderId: 'NB-' + Date.now(),
            date: new Date().toLocaleString(),
            customerName: name,
            phone: mobile,
            address: district + ', ' + area + ', ' + address,
            delivery: delivery,
            products: products,
            total: '৳' + (getSubtotal() + deliveryCharge)
        };

        fetch(GOOGLE_SHEET_URL, {
            method: 'POST',
            mode: 'no-cors',
            headers: {
                'Content-Type': 'text/plain;charset=utf-8'
            },
            body: JSON.stringify(orderData)
        });

        const successModal = document.getElementById('success-modal');
        if (successModal) {
            successModal.classList.add('show');
        }
    });
}

// SUCCESS POPUP
const successOkButton = document.getElementById('success-ok-btn');
const successModal = document.getElementById('success-modal');

if (successOkButton && successModal) {
    successOkButton.addEventListener('click', function() {
        successModal.classList.remove('show');

        cart = [];
        saveCart();
        updateCartCount();
        displayCartProducts();

        const form = document.querySelector('.customer-form form');
        if (form) form.reset();

        const insideDelivery = document.querySelector(
            'input[name="delivery"][value="inside"]'
        );
        if (insideDelivery) insideDelivery.checked = true;

        updateOrderSummary();
    });
}

// BUY NOW FOR STATIC PRODUCTS
document.querySelectorAll('.buy-btn').forEach(function(button) {
    button.addEventListener('click', function() {
        const card = this.closest('.product-card');
        if (!card) return;

        cart = [{
            name: card.querySelector('h3').textContent.trim(),
            price: card.querySelector('.price span').textContent.trim()
        }];

        saveCart();
        updateCartCount();

        window.location.href = 'cart.html#customer-information';
    });
});

// SCROLL TO CUSTOMER INFORMATION
if (window.location.hash === '#customer-information') {
    const customerInformation = document.getElementById(
        'customer-information'
    );

    if (customerInformation) {
        setTimeout(function() {
            customerInformation.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }, 300);
    }
}

/* ==========================================
   GOOGLE SHEET PRODUCT API
========================================== */

const PRODUCT_API_URL =
    "https://script.google.com/macros/s/AKfycbyMnxQWKH3M7kCQQsHhf91heihs9bg5zdpIxxgKq-N6Jg46a9NykRscsxrUrvdR1-1UhQ/exec";

const productGrid = document.getElementById('product-grid');

if (productGrid) {
    fetch(PRODUCT_API_URL)
        .then(function(response) {
            if (!response.ok) {
                throw new Error('Product API request failed');
            }
            return response.json();
        })
        .then(function(products) {
            if (!Array.isArray(products)) {
                throw new Error('Invalid product data');
            }

            let filteredProducts = products;
            const title = document.title;

            // HOME PAGE
            if (document.getElementById('popular')) {
                filteredProducts = products.filter(function(product) {
                    return String(product.Popular)
                        .trim().toLowerCase() === 'yes';
                });
            }

            // BEAUTY CARE
            else if (title.includes('Beauty Care')) {
                filteredProducts = products.filter(function(product) {
                    return String(product.Category)
                        .trim().toLowerCase() === 'beauty care';
                });
            }

            // CLOTHING
            else if (title.includes('Clothing')) {
                filteredProducts = products.filter(function(product) {
                    return String(product.Category)
                        .trim().toLowerCase() === 'clothing';
                });
            }

            // NEW: TOYS & MORE
            else if (title.includes('Toys & More')) {
                filteredProducts = products.filter(function(product) {
                    return String(product.Category)
                        .trim().toLowerCase() === 'toys & more';
                });
            }

            // NEW: FOODS & GROCERY
            else if (title.includes('Foods & Grocery')) {
                filteredProducts = products.filter(function(product) {
                    return String(product.Category)
                        .trim().toLowerCase() === 'foods & grocery';
                });
            }

            productGrid.innerHTML = '';

            filteredProducts.forEach(function(product) {
                const card = document.createElement('div');
                card.className = 'product-card';

                const imageDiv = document.createElement('div');
                imageDiv.className = 'product-image';

                const img = document.createElement('img');
                img.src = product['Image URL'] || '';
                img.alt = product['Product Name'] || 'Product';
                imageDiv.appendChild(img);

                if (document.getElementById('popular')) {
                    const badge = document.createElement('span');
                    badge.className = 'sale-badge';
                    badge.textContent = 'Popular';
                    imageDiv.appendChild(badge);
                }

                const info = document.createElement('div');
                info.className = 'product-info';

                const category = document.createElement('p');
                category.className = 'product-category';
                category.textContent = product.Category || '';

                const name = document.createElement('h3');
                name.textContent = product['Product Name'] || '';

                const description = document.createElement('p');
                description.style.cssText =
                    'font-size:13px;color:#777;margin-bottom:10px;line-height:1.5;';
                description.textContent = product.Description || '';

                const rating = document.createElement('div');
                rating.className = 'rating';
                const ratingValue = Math.max(
                    0, Math.min(5, Number(product.Rating) || 0)
                );
                rating.textContent = '★'.repeat(Math.floor(ratingValue));

                const priceDiv = document.createElement('div');
                priceDiv.className = 'price';

                const price = document.createElement('span');
                price.textContent = '৳' + product.Price;
                priceDiv.appendChild(price);

                if (product['Old Price']) {
                    const oldPrice = document.createElement('del');
                    oldPrice.textContent = '৳' + product['Old Price'];
                    priceDiv.appendChild(oldPrice);
                }

                const buttons = document.createElement('div');
                buttons.className = 'product-buttons';

                const buyButton = document.createElement('button');
                buyButton.className = 'buy-btn';
                buyButton.type = 'button';
                buyButton.textContent = 'Buy Now';

                const addButton = document.createElement('button');
                addButton.className = 'cart-btn';
                addButton.type = 'button';
                addButton.textContent = 'Add to Cart';

                buttons.appendChild(buyButton);
                buttons.appendChild(addButton);

                info.appendChild(category);
                info.appendChild(name);
                info.appendChild(description);
                info.appendChild(rating);
                info.appendChild(priceDiv);
                info.appendChild(buttons);

                card.appendChild(imageDiv);
                card.appendChild(info);
                productGrid.appendChild(card);
            });
        })
        .catch(function(error) {
            console.error('Product loading error:', error);
            productGrid.innerHTML = '';

            const message = document.createElement('p');
            message.style.cssText =
                'text-align:center;width:100%;color:#777;';
            message.textContent = 'Products could not be loaded.';
            productGrid.appendChild(message);
        });
}

// DYNAMIC PRODUCT BUTTONS
if (productGrid) {
    productGrid.addEventListener('click', function(event) {
        const button = event.target.closest('button');
        if (!button) return;

        const card = button.closest('.product-card');
        if (!card) return;

        const name = card.querySelector('h3').textContent.trim();
        const price = card.querySelector('.price span').textContent.trim();

        if (button.classList.contains('cart-btn')) {
            cart.push({ name, price });
            saveCart();
            updateCartCount();
            alert(name + ' added to cart!');
        }

        if (button.classList.contains('buy-btn')) {
            cart = [{ name, price }];
            saveCart();
            updateCartCount();
            window.location.href = 'cart.html#customer-information';
        }
    });
}

/* ==========================================
   WHATSAPP ORDER
========================================== */

const whatsappOrderButton = document.getElementById(
    'whatsapp-order-btn'
);

if (whatsappOrderButton) {
    whatsappOrderButton.addEventListener('click', function() {
        const form = document.querySelector('.customer-form form');

        if (!form || !form.reportValidity()) return;

        if (cart.length === 0) {
            alert('Please add products to your cart.');
            return;
        }

        const name = document.getElementById('name').value.trim();
        const mobile = document.getElementById('mobile').value.trim();
        const division = document.getElementById('division').value;
        const district = document.getElementById('district').value;
        const area = document.getElementById('area').value.trim();
        const address = document.getElementById('address').value.trim();

        if (!name || !mobile || !division ||
            !district || !area || !address) {
            alert('Please complete your customer information.');
            return;
        }

        const deliveryCharge = getDeliveryCharge();
        const deliveryText = deliveryCharge === 120
            ? 'Outside Dhaka' : 'Inside Dhaka';

        const productList = cart.map(function(product, index) {
            return `${index + 1}. ${product.name} - ${product.price} (Qty: 1)`;
        }).join('\n');

        const subtotal = getSubtotal();
        const total = subtotal + deliveryCharge;

        const message = [
            '*NEW ORDER - NIJER BAJAR*',
            '',
            '*Customer Information*',
            `Name: ${name}`,
            `Mobile: ${mobile}`,
            `Division: ${division}`,
            `District: ${district}`,
            `Area: ${area}`,
            `Address: ${address}`,
            '',
            '*Ordered Products*',
            productList,
            '',
            `Subtotal: BDT ${subtotal}`,
            `Delivery: ${deliveryText} - BDT ${deliveryCharge}`,
            `Total: BDT ${total}`,
            '',
            'Payment: Cash on Delivery'
        ].join('\n');

        const whatsappNumber = '8801896140043';

        const whatsappURL =
            `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

        window.location.href = whatsappURL;
    });
}

/* =========================
   HOME BANNER AUTO SLIDER
   Change every 3 seconds
========================= */

const heroSlides = document.querySelectorAll('.hero-slide');

if (heroSlides.length > 1) {

    let currentSlide = 0;

    setInterval(() => {

        heroSlides[currentSlide].classList.remove('active');

        currentSlide = (currentSlide + 1) % heroSlides.length;

        heroSlides[currentSlide].classList.add('active');

    }, 4000);

}
