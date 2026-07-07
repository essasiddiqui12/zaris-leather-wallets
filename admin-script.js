// Admin Login Credentials
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'zaris123';

// Initialize Data Structures
function initializeData() {
    if (!localStorage.getItem('zarisOrders')) {
        localStorage.setItem('zarisOrders', JSON.stringify([]));
    }
    if (!localStorage.getItem('zarisCustomers')) {
        localStorage.setItem('zarisCustomers', JSON.stringify([]));
    }
    if (!localStorage.getItem('zarisSettings')) {
        const defaultSettings = {
            storeName: 'Zaris',
            storeEmail: 'contact@zaris.com',
            storePhone: '+91 98765 43210',
            currency: 'INR',
            taxRate: 18
        };
        localStorage.setItem('zarisSettings', JSON.stringify(defaultSettings));
    }
}

// Get Currency Symbol
function getCurrencySymbol() {
    const settings = getSettings();
    const currencyMap = {
        'USD': '$',
        'EUR': '€',
        'GBP': '£',
        'INR': '₹',
        'AUD': 'A$',
        'CAD': 'C$'
    };
    return currencyMap[settings.currency] || '₹';
}

// Format Currency
function formatCurrency(amount) {
    const symbol = getCurrencySymbol();
    return `${symbol}${parseFloat(amount).toFixed(2)}`;
}

// Check Authentication
function checkAuth() {
    const isLoggedIn = localStorage.getItem('zarisAdminLoggedIn');
    if (isLoggedIn === 'true') {
        // Force initialize settings with INR
        const settings = localStorage.getItem('zarisSettings');
        if (!settings) {
            const defaultSettings = {
                storeName: 'Zaris',
                storeEmail: 'contact@zaris.com',
                storePhone: '+91 98765 43210',
                currency: 'INR',
                taxRate: 18
            };
            localStorage.setItem('zarisSettings', JSON.stringify(defaultSettings));
        }
        showDashboard();
    }
}

// Login Form Handler
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const error = document.getElementById('loginError');

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        localStorage.setItem('zarisAdminLoggedIn', 'true');
        showDashboard();
        error.style.display = 'none';
    } else {
        error.style.display = 'block';
    }
});

// Show Dashboard
function showDashboard() {
    document.getElementById('loginPage').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    initializeData();
    
    // Force set currency to INR if not set
    const settings = getSettings();
    if (!settings.currency || settings.currency === 'USD') {
        settings.currency = 'INR';
        settings.storePhone = '+91 98765 43210';
        settings.taxRate = 18;
        saveSettings(settings);
    }
    
    loadDashboard();
    setupNavigation();
}

// Logout Handler
document.getElementById('logoutBtn').addEventListener('click', () => {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('zarisAdminLoggedIn');
        location.reload();
    }
});

// Navigation Setup
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.getAttribute('data-page');
            if (page) {
                switchPage(page);
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
            }
        });
    });
}

// Switch Pages
function switchPage(page) {
    const sections = document.querySelectorAll('.page-section');
    sections.forEach(section => section.classList.remove('active'));
    
    const pageMap = {
        'dashboard': 'dashboardPage',
        'products': 'productsPage',
        'orders': 'ordersPage',
        'customers': 'customersPage',
        'analytics': 'analyticsPage',
        'settings': 'settingsPage'
    };
    
    const pageId = pageMap[page];
    if (pageId) {
        document.getElementById(pageId).classList.add('active');
        document.getElementById('pageTitle').textContent = 
            page.charAt(0).toUpperCase() + page.slice(1);
    }
    
    // Load page-specific data
    switch(page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'products':
            loadProducts();
            break;
        case 'orders':
            loadOrders();
            break;
        case 'customers':
            loadCustomers();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'settings':
            loadSettings();
            break;
    }
}

// Get Data Functions
async function getProducts() {
    try {
        const { data, error } = await supabaseClient
            .from('products')
            .select('*')
            .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('Error fetching products:', error);
        // Fallback to localStorage
        const products = localStorage.getItem('zarisProducts');
        return products ? JSON.parse(products) : [];
    }
}

function getOrders() {
    const orders = localStorage.getItem('zarisOrders');
    return orders ? JSON.parse(orders) : [];
}

function getCustomers() {
    const customers = localStorage.getItem('zarisCustomers');
    return customers ? JSON.parse(customers) : [];
}

function getSettings() {
    const settings = localStorage.getItem('zarisSettings');
    return settings ? JSON.parse(settings) : {};
}

// Save Data Functions
async function saveProducts(products) {
    try {
        // For now, we'll handle individual operations (add/update/delete)
        // This function is kept for compatibility
        localStorage.setItem('zarisProducts', JSON.stringify(products));
        console.log('Products saved to localStorage as backup');
    } catch (error) {
        console.error('Error saving products:', error);
    }
}

function saveOrders(orders) {
    localStorage.setItem('zarisOrders', JSON.stringify(orders));
}

function saveCustomers(customers) {
    localStorage.setItem('zarisCustomers', JSON.stringify(customers));
}

function saveSettings(settings) {
    localStorage.setItem('zarisSettings', JSON.stringify(settings));
}

// Load Dashboard
async function loadDashboard() {
    const products = await getProducts();
    const orders = getOrders();
    const customers = getCustomers();
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    document.getElementById('totalProducts').textContent = products.length;
    document.getElementById('totalOrders').textContent = orders.length;
    document.getElementById('totalRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('totalCustomers').textContent = customers.length;
    
    // Recent Orders
    const recentOrders = orders.slice(-5).reverse();
    const recentOrdersHTML = recentOrders.length > 0 ? `
        <table>
            <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Status</th></tr>
            ${recentOrders.map(order => `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customerName}</td>
                    <td>${formatCurrency(order.total)}</td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                </tr>
            `).join('')}
        </table>
    ` : '<p class="empty-state">No orders yet</p>';
    document.getElementById('recentOrders').innerHTML = recentOrdersHTML;
    
    // Top Products
    const topProducts = products.slice(0, 5);
    const topProductsHTML = topProducts.length > 0 ? `
        <table>
            <tr><th>Product</th><th>Price</th></tr>
            ${topProducts.map(product => `
                <tr>
                    <td>${product.name}</td>
                    <td>${formatCurrency(product.price)}</td>
                </tr>
            `).join('')}
        </table>
    ` : '<p class="empty-state">No products yet</p>';
    document.getElementById('topProducts').innerHTML = topProductsHTML;
}

// Load Products
async function loadProducts() {
    const products = await getProducts();
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';

    if (products.length === 0) {
        grid.innerHTML = '<p class="empty-state">No products yet. Click "Add Product" to create your first product!</p>';
        return;
    }

    products.forEach((product, index) => {
        const card = document.createElement('div');
        card.className = 'product-admin-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x200?text=No+Image'">
            <div class="product-admin-info">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <div class="product-admin-price">${formatCurrency(product.price)}</div>
                <div class="product-actions">
                    <button class="edit-btn" onclick="editProduct(${index})">✏️ Edit</button>
                    <button class="delete-btn" onclick="deleteProduct(${index})">🗑️ Delete</button>
                </div>
            </div>
        `;
        grid.appendChild(card);
    });
}

// Load Orders
function loadOrders() {
    const orders = getOrders();
    const container = document.getElementById('ordersTable');
    
    if (orders.length === 0) {
        container.innerHTML = '<p class="empty-state">No orders yet. Orders will appear here when customers make purchases.</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Order ID</th>
                    <th>Date</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${orders.map((order, index) => `
                    <tr>
                        <td>#${order.id}</td>
                        <td>${new Date(order.date).toLocaleDateString()}</td>
                        <td>${order.customerName}</td>
                        <td>${order.items.length}</td>
                        <td>${formatCurrency(order.total)}</td>
                        <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                        <td>
                            <button class="edit-btn" onclick="viewOrder(${index})">👁️ View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load Customers
function loadCustomers() {
    const customers = getCustomers();
    const container = document.getElementById('customersTable');
    
    if (customers.length === 0) {
        container.innerHTML = '<p class="empty-state">No customers yet. Customer data will appear here after orders are placed.</p>';
        return;
    }
    
    container.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Joined</th>
                </tr>
            </thead>
            <tbody>
                ${customers.map(customer => `
                    <tr>
                        <td>${customer.name}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phone || 'N/A'}</td>
                        <td>${customer.orderCount}</td>
                        <td>${formatCurrency(customer.totalSpent)}</td>
                        <td>${new Date(customer.joinedDate).toLocaleDateString()}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Load Analytics
function loadAnalytics() {
    const orders = getOrders();
    const products = getProducts();
    
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    const growth = orders.length > 0 ? '+15%' : '0%';
    
    document.getElementById('analyticsRevenue').textContent = formatCurrency(totalRevenue);
    document.getElementById('analyticsGrowth').textContent = growth;
    
    // Best Sellers
    const bestSellers = products.slice(0, 5);
    const bestSellersHTML = bestSellers.length > 0 ? `
        <table>
            <tr><th>Product</th><th>Price</th><th>Stock</th></tr>
            ${bestSellers.map(product => `
                <tr>
                    <td>${product.name}</td>
                    <td>${formatCurrency(product.price)}</td>
                    <td><span class="status-badge status-completed">In Stock</span></td>
                </tr>
            `).join('')}
        </table>
    ` : '<p class="empty-state">No data available</p>';
    document.getElementById('bestSellers').innerHTML = bestSellersHTML;
}

// Load Settings
function loadSettings() {
    const settings = getSettings();
    document.getElementById('storeName').value = settings.storeName || 'Zaris';
    document.getElementById('storeEmail').value = settings.storeEmail || 'contact@zaris.com';
    document.getElementById('storePhone').value = settings.storePhone || '+91 98765 43210';
    document.getElementById('storeCurrency').value = settings.currency || 'INR';
    document.getElementById('taxRate').value = settings.taxRate || 18;
}

// Product Modal Controls
const modal = document.getElementById('productModal');
const addBtn = document.getElementById('addProductBtn');
const closeBtn = document.getElementById('closeModal');
const productForm = document.getElementById('productForm');

addBtn.addEventListener('click', () => {
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('editId').value = '';
    productForm.reset();
    imageBase64 = '';
    document.getElementById('previewImg').style.display = 'none';
    document.getElementById('productImage').setAttribute('required', 'required');
    modal.classList.add('active');
});

closeBtn.addEventListener('click', () => {
    modal.classList.remove('active');
});

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.classList.remove('active');
    }
});

// Image Preview and File Handling
let imageBase64 = '';

document.getElementById('productImage').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        // Check file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size must be less than 5MB');
            e.target.value = '';
            return;
        }
        
        // Check file type
        if (!file.type.startsWith('image/')) {
            alert('Please upload an image file');
            e.target.value = '';
            return;
        }
        
        // Convert to base64 and show preview
        const reader = new FileReader();
        reader.onload = (event) => {
            imageBase64 = event.target.result;
            const preview = document.getElementById('previewImg');
            preview.src = imageBase64;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    }
});

// Product Form Submit
productForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const products = await getProducts();
    const editId = document.getElementById('editId').value;
    
    // Check if image is uploaded (for new products) or exists (for edits)
    if (!editId && !imageBase64) {
        alert('Please upload a product image');
        return;
    }
    
    const productData = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDesc').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image: imageBase64 || (editId !== '' ? products[parseInt(editId)].image : '')
    };

    try {
        if (editId !== '') {
            // Update existing product
            const product = products[parseInt(editId)];
            const { data, error} = await supabaseClient
                .from('products')
                .update(productData)
                .eq('id', product.id)
                .select();
            
            if (error) throw error;
            showNotification('✅ Product updated successfully!');
        } else {
            // Add new product
            const { data, error } = await supabaseClient
                .from('products')
                .insert([productData])
                .select();
            
            if (error) throw error;
            showNotification('✅ Product added successfully!');
        }
        
        // Also save to localStorage as backup
        if (editId !== '') {
            products[parseInt(editId)] = { ...productData, id: products[parseInt(editId)].id };
        } else {
            products.push({ ...productData, id: Date.now() });
        }
        await saveProducts(products);
        
        await loadProducts();
        await loadDashboard();
        modal.classList.remove('active');
        productForm.reset();
        imageBase64 = '';
        document.getElementById('previewImg').style.display = 'none';
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Error saving product. Please try again.');
    }
});

// Edit Product
async function editProduct(index) {
    const products = await getProducts();
    const product = products[index];
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('editId').value = index;
    document.getElementById('productName').value = product.name;
    document.getElementById('productDesc').value = product.description;
    document.getElementById('productPrice').value = product.price;
    
    // Set the current image
    imageBase64 = product.image;
    const preview = document.getElementById('previewImg');
    preview.src = product.image;
    preview.style.display = 'block';
    
    // Clear file input
    document.getElementById('productImage').value = '';
    document.getElementById('productImage').removeAttribute('required');
    
    modal.classList.add('active');
}

// Delete Product
async function deleteProduct(index) {
    if (!confirm('⚠️ Are you sure you want to delete this product? This action cannot be undone.')) return;
    
    try {
        const products = await getProducts();
        const product = products[index];
        
        // Delete from Supabase
        const { error } = await supabaseClient
            .from('products')
            .delete()
            .eq('id', product.id);
        
        if (error) throw error;
        
        // Also delete from localStorage backup
        products.splice(index, 1);
        await saveProducts(products);
        
        await loadProducts();
        await loadDashboard();
        showNotification('🗑️ Product deleted successfully!');
    } catch (error) {
        console.error('Error deleting product:', error);
        alert('Error deleting product. Please try again.');
    }
}

// View Order
function viewOrder(index) {
    const orders = getOrders();
    const order = orders[index];
    alert(`Order Details:\n\nOrder ID: #${order.id}\nCustomer: ${order.customerName}\nItems: ${order.items.length}\nTotal: ${formatCurrency(order.total)}\nStatus: ${order.status}`);
}

// Settings Form
document.getElementById('settingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const settings = {
        storeName: document.getElementById('storeName').value,
        storeEmail: document.getElementById('storeEmail').value,
        storePhone: document.getElementById('storePhone').value,
        currency: document.getElementById('storeCurrency').value,
        taxRate: parseFloat(document.getElementById('taxRate').value)
    };
    
    saveSettings(settings);
    showNotification('⚙️ Settings saved successfully!');
});

// Export Functions
document.getElementById('exportProducts').addEventListener('click', () => {
    const products = getProducts();
    downloadJSON(products, 'zaris-products.json');
    showNotification('📥 Products exported successfully!');
});

document.getElementById('exportOrders').addEventListener('click', () => {
    const orders = getOrders();
    downloadJSON(orders, 'zaris-orders.json');
    showNotification('📥 Orders exported successfully!');
});

document.getElementById('exportCustomers').addEventListener('click', () => {
    const customers = getCustomers();
    downloadJSON(customers, 'zaris-customers.json');
    showNotification('📥 Customers exported successfully!');
});

// Download JSON
function downloadJSON(data, filename) {
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// Clear All Data
document.getElementById('clearAllData').addEventListener('click', () => {
    if (confirm('⚠️ WARNING: This will delete ALL data including products, orders, and customers. Are you absolutely sure?')) {
        if (confirm('This action cannot be undone. Click OK to proceed.')) {
            localStorage.removeItem('zarisProducts');
            localStorage.removeItem('zarisOrders');
            localStorage.removeItem('zarisCustomers');
            showNotification('🗑️ All data cleared!');
            setTimeout(() => location.reload(), 1500);
        }
    }
});

// Reset Demo Data
document.getElementById('resetDemo').addEventListener('click', () => {
    if (confirm('Reset to demo data? This will add sample products and orders.')) {
        // Add demo products with INR prices
        const demoProducts = [
            {
                id: Date.now() + 1,
                name: "Classic Bi-Fold Wallet",
                description: "Premium leather bi-fold with 6 card slots",
                price: 2499,
                image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=600"
            },
            {
                id: Date.now() + 2,
                name: "Slim Minimalist Wallet",
                description: "Ultra-thin design for front pocket",
                price: 1999,
                image: "https://images.unsplash.com/photo-1606398690966-0c39435be06f?w=600"
            },
            {
                id: Date.now() + 3,
                name: "Executive Leather Wallet",
                description: "Handcrafted Italian leather wallet",
                price: 3499,
                image: "https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600"
            }
        ];
        
        // Add demo orders
        const demoOrders = [
            {
                id: 1001,
                date: new Date().toISOString(),
                customerName: "Rahul Sharma",
                items: [demoProducts[0]],
                total: 2499,
                status: "completed"
            },
            {
                id: 1002,
                date: new Date().toISOString(),
                customerName: "Priya Patel",
                items: [demoProducts[1]],
                total: 1999,
                status: "pending"
            }
        ];
        
        // Add demo customers
        const demoCustomers = [
            {
                name: "Rahul Sharma",
                email: "rahul@example.com",
                phone: "+91 98765 00001",
                orderCount: 1,
                totalSpent: 2499,
                joinedDate: new Date().toISOString()
            },
            {
                name: "Priya Patel",
                email: "priya@example.com",
                phone: "+91 98765 00002",
                orderCount: 1,
                totalSpent: 1999,
                joinedDate: new Date().toISOString()
            }
        ];
        
        saveProducts(demoProducts);
        saveOrders(demoOrders);
        saveCustomers(demoCustomers);
        showNotification('🔄 Demo data loaded!');
        setTimeout(() => location.reload(), 1500);
    }
});

// Show Notification
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize
checkAuth();
