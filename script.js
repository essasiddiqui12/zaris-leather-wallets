// Default Product Data (will be replaced by admin-added products)
const defaultProducts = [
    {
        id: 1,
        name: "Classic Bi-Fold",
        description: "Timeless design with 6 card slots and bill compartment",
        price: 2499,
        image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"
    },
    {
        id: 2,
        name: "Slim Minimalist",
        description: "Ultra-thin design perfect for front pocket carry",
        price: 1999,
        image: "https://images.unsplash.com/photo-1606398690966-0c39435be06f?w=600"
    },
    {
        id: 3,
        name: "Executive Tri-Fold",
        description: "Maximum capacity with premium leather finish",
        price: 3499,
        image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600"
    },
    {
        id: 4,
        name: "Card Holder Pro",
        description: "Compact design for essential cards only",
        price: 1499,
        image: "https://images.unsplash.com/photo-1598522325074-042db73aa4e6?w=600"
    },
    {
        id: 5,
        name: "Travel Wallet",
        description: "Large capacity with passport pocket",
        price: 4499,
        image: "https://images.unsplash.com/photo-1608666636577-3b881838b08b?w=600"
    },
    {
        id: 6,
        name: "Money Clip Wallet",
        description: "Modern design with integrated money clip",
        price: 2299,
        image: "https://images.unsplash.com/photo-1614246247468-7c6d9a7a6cc1?w=600"
    }
];

// Get Currency Symbol
function getCurrencySymbol() {
    const settings = localStorage.getItem('zarisSettings');
    if (settings) {
        const settingsObj = JSON.parse(settings);
        const currencyMap = {
            'USD': '$',
            'EUR': '€',
            'GBP': '£',
            'INR': '₹',
            'AUD': 'A$',
            'CAD': 'C$'
        };
        return currencyMap[settingsObj.currency] || '₹';
    }
    return '₹';
}

// Format Currency
function formatCurrency(amount) {
    const symbol = getCurrencySymbol();
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
}

// Get products from Supabase or use defaults
async function getProducts() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        
        // If no products in database, return defaults
        return data && data.length > 0 ? data : defaultProducts;
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to localStorage if Supabase fails
        const savedProducts = localStorage.getItem('zarisProducts');
        if (savedProducts) {
            return JSON.parse(savedProducts);
        }
        return defaultProducts;
    }
}

let products = [];

// Load products on page load
async function loadProducts() {
    products = await getProducts();
    renderProducts();
}

// Reload products function
function reloadProducts() {
    products = getProducts();
    renderProducts();
}

// Shopping Cart
let cart = [];

// Load cart from localStorage
function loadCart() {
    const savedCart = localStorage.getItem('zarisCart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('zarisCart', JSON.stringify(cart));
}

// Render Products
async function renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    // Get fresh products from Supabase
    const currentProducts = await getProducts();

    currentProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        // Add click event to image for lightbox
        const img = productCard.querySelector('.product-image');
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            openLightbox(product.image, product.name);
        });
        
        productsGrid.appendChild(productCard);
    });
}

// Add to Cart
async function addToCart(productId) {
    // Get fresh products list from Supabase
    const currentProducts = await getProducts();
    const product = currentProducts.find(p => p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    saveCart();
    updateCartUI();
    showNotification('Added to cart!');
}

// Remove from Cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    updateCartUI();
}

// Update Cart UI
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');

    // Update count
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalItems;

    // Update cart items
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Your cart is empty</div>';
        totalPrice.textContent = '$0.00';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">${formatCurrency(item.price)} x ${item.quantity}</div>
            </div>
            <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                ✕
            </button>
        `;
        cartItems.appendChild(cartItem);
    });

    totalPrice.textContent = formatCurrency(total);
}

// Show Notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary);
        color: white;
        padding: 1rem 2rem;
        border-radius: 10px;
        z-index: 3000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 5px 20px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Mobile Menu Toggle
const menuToggle = document.getElementById('menuToggle');
const navMenu = document.getElementById('navMenu');

menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// Cart Modal
const cartBtn = document.getElementById('cartBtn');
const cartModal = document.getElementById('cartModal');
const closeCart = document.getElementById('closeCart');

cartBtn.addEventListener('click', () => {
    cartModal.classList.add('active');
});

closeCart.addEventListener('click', () => {
    cartModal.classList.remove('active');
});

// Close cart when clicking outside
cartModal.addEventListener('click', (e) => {
    if (e.target === cartModal) {
        cartModal.classList.remove('active');
    }
});

// Checkout
const checkoutBtn = document.getElementById('checkoutBtn');
checkoutBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} (x${item.quantity})`).join(', ');
    
    alert(`Thank you for your order!\n\nItems: ${itemsList}\nTotal: ${formatCurrency(total)}\n\nWe'll process your order shortly.`);
    
    cart = [];
    saveCart();
    updateCartUI();
    cartModal.classList.remove('active');
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            navMenu.classList.remove('active');
        }
    });
});

// Contact Form
const contactForm = document.getElementById('contactForm');
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    showNotification('Thank you! We\'ll get back to you soon.');
    contactForm.reset();
});

// Newsletter Form
const newsletterForm = document.getElementById('newsletterForm');
newsletterForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('newsletterEmail').value;
    
    try {
        // Save to Supabase
        const { data, error } = await supabaseClient
            .from('newsletter_subscribers')
            .insert([{ email: email }])
            .select();
        
        if (error) {
            if (error.code === '23505') { // Unique constraint violation
                showNotification('You are already subscribed!');
            } else {
                throw error;
            }
        } else {
            // Also save to localStorage as backup
            const subscribers = JSON.parse(localStorage.getItem('zarisSubscribers') || '[]');
            if (!subscribers.includes(email)) {
                subscribers.push(email);
                localStorage.setItem('zarisSubscribers', JSON.stringify(subscribers));
            }
            showNotification('🎉 Successfully subscribed! Check your email for exclusive offers.');
        }
    } catch (error) {
        console.error('Error subscribing:', error);
        showNotification('There was an error. Please try again.');
    }
    
    newsletterForm.reset();
});

// Navbar Scroll Effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 50) {
        navbar.style.padding = '0.5rem 0';
        navbar.style.boxShadow = '0 5px 30px rgba(0, 0, 0, 0.15)';
    } else {
        navbar.style.padding = '1rem 0';
        navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Back to Top Button
const backToTopBtn = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopBtn.classList.add('visible');
    } else {
        backToTopBtn.classList.remove('visible');
    }
});

backToTopBtn.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// Search Functionality
const searchBtn = document.getElementById('searchBtn');
const searchBar = document.getElementById('searchBar');
const searchInput = document.getElementById('searchInput');
const clearSearch = document.getElementById('clearSearch');

searchBtn.addEventListener('click', () => {
    searchBar.style.display = searchBar.style.display === 'none' ? 'block' : 'none';
    if (searchBar.style.display === 'block') {
        searchInput.focus();
    }
});

clearSearch.addEventListener('click', () => {
    searchInput.value = '';
    filterProducts();
});

searchInput.addEventListener('input', () => {
    filterProducts();
});

// Filter Functionality
let currentFilter = 'all';
let currentSort = 'default';

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentFilter = btn.dataset.filter;
        filterProducts();
    });
});

document.getElementById('sortProducts').addEventListener('change', (e) => {
    currentSort = e.target.value;
    filterProducts();
});

async function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const currentProducts = await getProducts();
    let filteredProducts = [...currentProducts];

    // Search filter
    if (searchTerm) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchTerm) || 
            p.description.toLowerCase().includes(searchTerm)
        );
    }

    // Category filter
    if (currentFilter !== 'all') {
        filteredProducts = filteredProducts.filter(p => 
            p.category && p.category.toLowerCase() === currentFilter.toLowerCase()
        );
    }

    // Sort
    if (currentSort === 'price-low') {
        filteredProducts.sort((a, b) => a.price - b.price);
    } else if (currentSort === 'price-high') {
        filteredProducts.sort((a, b) => b.price - a.price);
    } else if (currentSort === 'name') {
        filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Render filtered products
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    if (filteredProducts.length === 0) {
        productsGrid.innerHTML = '<p style="text-align: center; grid-column: 1/-1; color: #666;">No products found</p>';
        return;
    }

    filteredProducts.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'" data-name="${product.name}">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">${formatCurrency(product.price)}</span>
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        Add to Cart
                    </button>
                </div>
            </div>
        `;
        
        // Add click event to image for lightbox
        const img = productCard.querySelector('.product-image');
        img.style.cursor = 'pointer';
        img.addEventListener('click', () => {
            openLightbox(product.image, product.name);
        });
        
        productsGrid.appendChild(productCard);
    });
}

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const wasActive = faqItem.classList.contains('active');
        
        // Close all FAQs
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });
        
        // Open clicked FAQ if it wasn't active
        if (!wasActive) {
            faqItem.classList.add('active');
        }
    });
});

// WhatsApp Order
const whatsappOrderBtn = document.getElementById('whatsappOrderBtn');
whatsappOrderBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    const settings = JSON.parse(localStorage.getItem('zarisSettings') || '{}');
    const phone = settings.phone;
    
    if (!phone) {
        alert('WhatsApp number not configured. Please contact admin to set up WhatsApp ordering.');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const itemsList = cart.map(item => `${item.name} (x${item.quantity}) - ${formatCurrency(item.price * item.quantity)}`).join('%0A');
    
    const message = `Hi Zaris Team!%0A%0AI would like to order:%0A%0A${itemsList}%0A%0ATotal: ${formatCurrency(total)}%0A%0APlease confirm my order. Thank you!`;
    
    window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
});

// Checkout Modal
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutForm = document.getElementById('checkoutForm');
const checkoutTotal = document.getElementById('checkoutTotal');

// Update checkout button to open modal
checkoutBtn.onclick = () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    checkoutTotal.textContent = formatCurrency(total);
    
    cartModal.classList.remove('active');
    checkoutModal.classList.add('active');
};

closeCheckout.addEventListener('click', () => {
    checkoutModal.classList.remove('active');
});

checkoutModal.addEventListener('click', (e) => {
    if (e.target === checkoutModal) {
        checkoutModal.classList.remove('active');
    }
});

checkoutForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const orderData = {
        customer_name: document.getElementById('customerName').value,
        customer_phone: document.getElementById('customerPhone').value,
        customer_email: document.getElementById('customerEmail').value,
        customer_address: document.getElementById('customerAddress').value,
        customer_city: document.getElementById('customerCity').value,
        customer_pincode: document.getElementById('customerPincode').value,
        payment_method: document.getElementById('paymentMethod').value,
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        status: 'pending'
    };
    
    try {
        // Save order to Supabase
        const { data, error } = await supabaseClient
            .from('orders')
            .insert([orderData])
            .select();
        
        if (error) throw error;
        
        console.log('✅ Order saved to database:', data);
        
        // Also save to localStorage as backup
        const orders = JSON.parse(localStorage.getItem('zarisOrders') || '[]');
        orders.push(orderData);
        localStorage.setItem('zarisOrders', JSON.stringify(orders));
        
        // Clear cart
        cart = [];
        saveCart();
        updateCartUI();
        
        // Close modal and show success
        checkoutModal.classList.remove('active');
        alert(`Thank you ${orderData.customer_name}! Your order has been placed successfully.\n\nOrder Total: ${formatCurrency(orderData.total)}\nPayment Method: ${orderData.payment_method === 'cod' ? 'Cash on Delivery' : 'Online Payment'}\n\nWe'll contact you shortly on ${orderData.customer_phone}`);
        
        checkoutForm.reset();
    } catch (error) {
        console.error('Error saving order:', error);
        alert('There was an error placing your order. Please try again or contact support.');
    }
});

// Info Modal
const infoModal = document.getElementById('infoModal');
const infoModalTitle = document.getElementById('infoModalTitle');
const infoModalContent = document.getElementById('infoModalContent');
const closeInfo = document.getElementById('closeInfo');

closeInfo.addEventListener('click', () => {
    infoModal.classList.remove('active');
});

infoModal.addEventListener('click', (e) => {
    if (e.target === infoModal) {
        infoModal.classList.remove('active');
    }
});

function openModal(type) {
    const content = {
        shipping: {
            title: 'Shipping Information',
            html: `
                <h3>Delivery Times</h3>
                <p>• Standard Delivery: 3-5 business days</p>
                <p>• Express Delivery: 1-2 business days (select locations)</p>
                <p>• Free shipping on orders above ₹2000</p>
                <h3>Shipping Partners</h3>
                <p>We use trusted courier services like Delhivery, Blue Dart, and India Post for safe delivery.</p>
            `
        },
        returns: {
            title: 'Returns & Refunds',
            html: `
                <h3>Return Policy</h3>
                <p>• 7-day return window from delivery date</p>
                <p>• Product must be unused and in original packaging</p>
                <p>• Refunds processed within 5-7 business days</p>
                <h3>How to Return</h3>
                <p>1. Contact us via WhatsApp or email</p>
                <p>2. Ship the product back to us</p>
                <p>3. Receive your refund once we verify the product</p>
            `
        },
        care: {
            title: 'Leather Care Guide',
            html: `
                <h3>Daily Care</h3>
                <p>• Keep leather dry and away from direct sunlight</p>
                <p>• Avoid contact with water and chemicals</p>
                <p>• Store in a cool, dry place</p>
                <h3>Cleaning</h3>
                <p>• Wipe with a soft, dry cloth regularly</p>
                <p>• Use leather conditioner once every 3 months</p>
                <p>• For stains, consult a professional leather cleaner</p>
            `
        },
        privacy: {
            title: 'Privacy Policy',
            html: `
                <h3>Information We Collect</h3>
                <p>We collect name, phone, email, and address for order processing and delivery.</p>
                <h3>How We Use Your Data</h3>
                <p>• To process and deliver your orders</p>
                <p>• To communicate about your order status</p>
                <p>• To improve our services</p>
                <h3>Data Security</h3>
                <p>We do not share your personal information with third parties except for delivery purposes.</p>
            `
        },
        terms: {
            title: 'Terms & Conditions',
            html: `
                <h3>Product Information</h3>
                <p>All products are handcrafted from genuine leather. Minor variations in color and texture are natural.</p>
                <h3>Pricing</h3>
                <p>All prices are in Indian Rupees (₹) and include applicable GST.</p>
                <h3>Payment</h3>
                <p>We accept Cash on Delivery, UPI, credit/debit cards, and net banking.</p>
                <h3>Warranty</h3>
                <p>Lifetime warranty against manufacturing defects. Normal wear and tear not covered.</p>
            `
        }
    };
    
    if (content[type]) {
        infoModalTitle.textContent = content[type].title;
        infoModalContent.innerHTML = content[type].html;
        infoModal.classList.add('active');
    }
}

// Make openModal globally accessible
window.openModal = openModal;

// Lightbox functionality
const lightboxModal = document.getElementById('lightboxModal');
const lightboxImage = document.getElementById('lightboxImage');
const lightboxCaption = document.getElementById('lightboxCaption');
const closeLightbox = document.getElementById('closeLightbox');

function openLightbox(imageSrc, caption) {
    lightboxImage.src = imageSrc;
    lightboxCaption.textContent = caption;
    lightboxModal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

closeLightbox.addEventListener('click', () => {
    lightboxModal.classList.remove('active');
    document.body.style.overflow = 'auto';
});

lightboxModal.addEventListener('click', (e) => {
    if (e.target === lightboxModal) {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Close lightbox with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal.classList.contains('active')) {
        lightboxModal.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
});

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    await loadProducts();
    loadCart();
    console.log('🛍️ Welcome to Zaris - Premium Leather Wallets');
    console.log('✅ Connected to Supabase Database');
});

// Check for product updates every 5 seconds from Supabase
setInterval(async () => {
    const currentProducts = await getProducts();
    const oldCount = document.querySelectorAll('.product-card').length;
    if (currentProducts.length !== oldCount) {
        console.log('🔄 Products updated from database! Reloading...');
        await renderProducts();
    }
}, 5000);
