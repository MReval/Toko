// Ini adalah file JavaScript utama Anda.
// Untuk saat ini, kita akan membiarkannya kosong atau dengan komentar dasar.
// Fungsi untuk mengambil dan menampilkan produk akan ditambahkan di sini nanti.

const productDataMap = {};
let allProducts = [];
let pbClient;
const cart = [];

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOM siap!");

    // Smooth scroll untuk link navigasi internal (jika ada)
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const hrefAttribute = this.getAttribute('href');
            // Pastikan itu bukan hanya "#" atau "#!"
            if (hrefAttribute && hrefAttribute.length > 1 && document.querySelector(hrefAttribute)) {
                e.preventDefault();
                document.querySelector(hrefAttribute).scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });

    if (document.getElementById('product-container')) {
        loadProducts();
        const filterSelect = document.getElementById('categoryFilter');
        const sortSelect = document.getElementById('sortSelect');
        if (filterSelect) filterSelect.addEventListener('change', applyFilters);
        if (sortSelect) sortSelect.addEventListener('change', applyFilters);
    }

    // Efek parallax sederhana untuk hero image jika ada
    const hero = document.getElementById('hero');
    if (hero) {
        window.addEventListener('scroll', function () {
            const offset = window.pageYOffset;
            hero.style.backgroundPositionY = offset * 0.7 + 'px';
        });
    }
});


async function loadProducts() {
    const productContainer = document.getElementById('product-container');
    if (!productContainer) return;

    // Inisialisasi Pocketbase Client
    // GANTI 'YOUR_POCKETBASE_URL' dengan URL Pocketbase Anda yang sebenarnya
    // Contoh: const pb = new PocketBase('http://127.0.0.1:8090');
    // Untuk sekarang, kita akan menggunakan data dummy karena URL Pocketbase belum tersedia.
    let pb;
    const pocketbaseUrl = 'https://gs7wtjsz-8090.asse.devtunnels.ms/'; // Ganti jika perlu atau buat ini bisa dikonfigurasi

    try {
        pb = new PocketBase(pocketbaseUrl);
        // Coba test koneksi (opsional, tapi bagus untuk debugging)
        await pb.health.check();
        pbClient = pb;
        console.log("Berhasil terhubung ke Pocketbase:", pocketbaseUrl);
    } catch (error) {
        console.warn("Gagal terhubung ke Pocketbase di", pocketbaseUrl, ". Menggunakan data dummy.", error);
        displayDummyProducts(productContainer);
        return;
    }


    try {
        const records = await pb.collection('products').getFullList({
            sort: '-created', // Urutkan berdasarkan terbaru
        });

        console.log("Produk diterima:", records);

        if (records.length === 0) {
            productContainer.innerHTML = '<p class="text-center col-12">Belum ada produk yang tersedia.</p>';
            return;
        }

        allProducts = records.map(record => {
            const imageUrl = record.image ? pb.files.getUrl(record, record.image) : 'https://via.placeholder.com/300x200.png?text=No+Image';
            return {
                id: record.id,
                name: record.name || 'Nama Produk Tidak Tersedia',
                description: record.description || 'Deskripsi tidak tersedia.',
                image: imageUrl,
                category: record.category || 'Umum',
                price: record.price || 0,
                stock: record.stock
            };
        });

        displayProducts(allProducts);

    } catch (error) {
        console.error('Error fetching products from Pocketbase:', error);
        productContainer.innerHTML = '<p class="text-center col-12">Gagal memuat produk. Silakan coba lagi nanti.</p>';
        // Fallback ke data dummy jika ada error setelah mencoba konek
        console.warn("Menggunakan data dummy karena gagal mengambil dari Pocketbase.");
        displayDummyProducts(productContainer);
    }
}

function displayDummyProducts(container) {
    console.log("Menampilkan produk dummy...");
    const dummyProducts = [
        {
            id: 'dummy1',
            name: 'Kue Lapis Legit (Dummy)',
            description: 'Kue lapis klasik dengan rasa manis legit yang khas.',
            image_url: 'https://via.placeholder.com/300x200.png?text=Kue+Lapis',
            category: 'Non Gorengan',
            price: 150000,
            stock: 15
        },
        {
            id: 'dummy2',
            name: 'Risoles Ragout (Dummy)',
            description: 'Risoles gurih dengan isian ragout ayam dan sayuran.',
            image_url: 'https://via.placeholder.com/300x200.png?text=Risoles',
            category: 'Gorengan',
            price: 5000,
            stock: 50
        },
        {
            id: 'dummy3',
            name: 'Bolu Kukus Pelangi (Dummy)',
            description: 'Bolu kukus lembut dengan warna-warni menarik.',
            image_url: 'https://via.placeholder.com/300x200.png?text=Bolu+Kukus',
            category: 'Non Gorengan',
            price: 3000,
            stock: 30
        },
        {
            id: 'dummy4',
            name: 'Pastel Isi (Dummy)',
            description: 'Pastel renyah dengan isian bihun dan sayuran, cocok untuk camilan.',
            image_url: 'https://via.placeholder.com/300x200.png?text=Pastel',
            category: 'Gorengan',
            price: 4000,
            stock: 40
        }
    ];

    allProducts = dummyProducts.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        image: p.image_url,
        category: p.category,
        price: p.price,
        stock: p.stock
    }));

    displayProducts(allProducts);
}

function displayProducts(products) {
    const container = document.getElementById('product-container');
    if (!container) return;
    container.innerHTML = '';

    products.forEach((product, index) => {
        productDataMap[product.id] = {
            name: product.name,
            description: product.description,
            image: product.image
        };

        const card = `
            <div class="col">
                <div class="card product-card h-100" data-id="${product.id}" style="animation-delay: ${index * 0.1}s">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text flex-grow-1">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary">${product.category}</span>
                            <span class="price">Rp ${product.price.toLocaleString('id-ID')}</span>
                        </div>
                        <p class="card-text"><small class="text-muted">Stok: ${product.stock}</small></p>
                        <div class="input-group input-group-sm mb-2 qty-control" data-id="${product.id}">
                            <button class="btn btn-outline-secondary qty-dec" data-id="${product.id}">-</button>
                            <input type="number" min="1" value="1" class="form-control text-center qty-input-card" data-id="${product.id}">
                            <button class="btn btn-outline-secondary qty-inc" data-id="${product.id}">+</button>
                        </div>
                        <button class="btn btn-primary add-cart-btn mt-auto" data-id="${product.id}">Tambah ke Keranjang</button>
                    </div>
                </div>
            </div>`;
        container.innerHTML += card;
    });

    attachDetailEvents();
    attachCartEvents();
}
//Filtering,Sorting,Kategori
function applyFilters() {
    const filterSelect = document.getElementById('categoryFilter');
    const sortSelect = document.getElementById('sortSelect');
    let filtered = [...allProducts];

    if (filterSelect && filterSelect.value !== 'all') {
        const selectedCategory = filterSelect.value.trim().toLowerCase();
        filtered = filtered.filter(p => p.category.trim().toLowerCase() === selectedCategory);
    }


    if (sortSelect) {
        if (sortSelect.value === 'price') {
            filtered.sort((a, b) => a.price - b.price);
        } else if (sortSelect.value === '-price') {
            filtered.sort((a, b) => b.price - a.price);
        } else if (sortSelect.value === 'name') {
            filtered.sort((a, b) => a.name.localeCompare(b.name));
        }
    }

    displayProducts(filtered);
}

function attachDetailEvents() {
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.qty-control') || e.target.closest('.add-cart-btn')) {
                return;
            }
            const id = this.dataset.id;
            const data = productDataMap[id];
            if (data) {
                openProductModal(data);
            }
        });
    });
    document.querySelectorAll('.add-cart-btn, .qty-control *').forEach(el => {
        el.addEventListener('click', e => e.stopPropagation());
    });
}

function openProductModal(data) {
    const img = document.getElementById('modalProductImage');
    const nameEl = document.getElementById('modalProductName');
    const descEl = document.getElementById('modalProductDescription');
    const waBtn = document.getElementById('waOrderButton');

    if (img) {
        img.src = data.image;
        img.alt = data.name;
    }
    if (nameEl) {
        nameEl.textContent = data.name;
    }
    if (descEl) {
        descEl.textContent = data.description;
    }
    if (waBtn) {
        const msg = encodeURIComponent(`Hai, aku mengunjungi website kalian dan tertarik pada produk ${data.name}`);
        waBtn.href = `https://wa.me/6281289839168?text=${msg}`;
        waBtn.textContent = 'pesan sekarang, melalui whatsapp';
    }

    const modalElement = document.getElementById('productModal');
    if (modalElement) {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();
    }
}

function attachCartEvents() {
    document.querySelectorAll('.add-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const input = document.querySelector(`.qty-input-card[data-id="${id}"]`);
            const qty = input ? parseInt(input.value, 10) || 1 : 1;
            addToCart(id, qty);
        });
    });
    document.querySelectorAll('.qty-inc').forEach(btn => {
        btn.addEventListener('click', () => adjustCardQty(btn.dataset.id, 1));
    });
    document.querySelectorAll('.qty-dec').forEach(btn => {
        btn.addEventListener('click', () => adjustCardQty(btn.dataset.id, -1));
    });
    document.querySelectorAll('.qty-input-card').forEach(input => {
        input.addEventListener('change', () => setCardQty(input.dataset.id, parseInt(input.value, 10)));
    });
}

function addToCart(productId, qty = 1) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    if (product.stock <= 0) {
        alert('Stok produk habis');
        return;
    }
    qty = Math.min(qty, product.stock);
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        if (existing.qty + qty <= product.stock) {
            existing.qty += qty;
        } else {
            alert('Jumlah melebihi stok yang tersedia');
            return;
        }
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty });
    }
    updateCartUI();
}

function computeTotal() {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartUI() {
    const list = document.getElementById('cartItems');
    const totalEl = document.getElementById('cartTotal');
    if (!list || !totalEl) return;
    list.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <span>${item.name}</span>
                <div class="input-group input-group-sm" style="width: 110px;">
                    <button class="btn btn-outline-secondary btn-dec" data-id="${item.id}">-</button>
                    <input type="number" min="1" class="form-control text-center qty-input" data-id="${item.id}" value="${item.qty}">
                    <button class="btn btn-outline-secondary btn-inc" data-id="${item.id}">+</button>
                </div>
            </div>
            <small>Rp ${item.price.toLocaleString('id-ID')}</small>`;
        list.appendChild(li);
    });
    totalEl.textContent = `Total: Rp ${computeTotal().toLocaleString('id-ID')}`;
    attachQtyEvents();
}

function attachQtyEvents() {
    document.querySelectorAll('.btn-inc').forEach(btn => {
        btn.onclick = () => changeQty(btn.dataset.id, 1);
    });
    document.querySelectorAll('.btn-dec').forEach(btn => {
        btn.onclick = () => changeQty(btn.dataset.id, -1);
    });
    document.querySelectorAll('.qty-input').forEach(input => {
        input.onchange = () => setQty(input.dataset.id, parseInt(input.value, 10));
    });
}

function changeQty(id, delta) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const product = allProducts.find(p => p.id === id);
    const maxQty = product ? product.stock : Infinity;
    item.qty = Math.min(Math.max(1, item.qty + delta), maxQty);
    updateCartUI();
}

function setQty(id, qty) {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    const product = allProducts.find(p => p.id === id);
    const maxQty = product ? product.stock : Infinity;
    if (isNaN(qty) || qty < 1) qty = 1;
    item.qty = Math.min(qty, maxQty);
    updateCartUI();
}

function adjustCardQty(id, delta) {
    const input = document.querySelector(`.qty-input-card[data-id="${id}"]`);
    if (!input) return;
    const product = allProducts.find(p => p.id === id);
    const max = product ? product.stock : Infinity;
    let val = parseInt(input.value, 10) || 1;
    val = Math.min(Math.max(1, val + delta), max);
    input.value = val;
}

function setCardQty(id, qty) {
    const input = document.querySelector(`.qty-input-card[data-id="${id}"]`);
    if (!input) return;
    const product = allProducts.find(p => p.id === id);
    const max = product ? product.stock : Infinity;
    if (isNaN(qty) || qty < 1) qty = 1;
    input.value = Math.min(qty, max);
}
//Keranjang
function renderCartView() {
    const content = document.getElementById('cartContent');
    if (!content) return;
    content.innerHTML = `
        <button type="button" class="btn-close position-absolute top-0 end-0 m-2" id="closeCartXButton" aria-label="Close"></button>
        <h5 class="mb-3">Keranjang</h5>
        <ul id="cartItems" class="list-unstyled"></ul>
        <div id="cartTotal" class="fw-bold mb-3"></div>
        <button id="checkoutButton" class="btn btn-success mb-2">Checkout</button>
        <button id="closeCartButton" class="btn btn-secondary">Tutup</button>
    `;
    document.getElementById('checkoutButton').addEventListener('click', showCheckoutForm);
    document.getElementById('closeCartButton').addEventListener('click', hideCart);
    document.getElementById('closeCartXButton').addEventListener('click', hideCart);
    updateCartUI();
}

function showCart() {
    renderCartView();
    document.getElementById('cartOverlay').classList.remove('d-none');
}

function hideCart() {
    document.getElementById('cartOverlay').classList.add('d-none');
}
//Cekout
function showCheckoutForm() {
    const content = document.getElementById('cartContent');
    const total = computeTotal();
    if (!content) return;
    content.innerHTML = `
        <button type="button" class="btn-close position-absolute top-0 end-0 m-2" id="closeCartXButton" aria-label="Close"></button>
        <form id="checkoutForm">
            <div class="mb-3">
                <label class="form-label">Nama</label>
                <input type="text" class="form-control" id="checkoutName" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Alamat</label>
                <textarea class="form-control" id="checkoutAddress" required></textarea>
            </div>
            <div class="mb-3">
                <label class="form-label">No HP</label>
                <input type="text" class="form-control" id="checkoutPhone" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Total Harga</label>
                <input type="text" class="form-control" id="checkoutTotal" readonly value="Rp ${total.toLocaleString('id-ID')}">
            </div>
            <div class="d-flex justify-content-between">
                <button type="button" class="btn btn-secondary" id="backToCartButton">Kembali</button>
                <button type="submit" class="btn btn-success">Kirim Pesanan</button>
            </div>
        </form>`;
    document.getElementById('checkoutForm').addEventListener('submit', submitCheckout);
    document.getElementById('backToCartButton').addEventListener('click', renderCartView);
    document.getElementById('closeCartXButton').addEventListener('click', hideCart);
}

async function submitCheckout(e) {
    e.preventDefault();
    if (!pbClient) {
        try {
            pbClient = new PocketBase('http://127.0.0.1:8090');
            await pbClient.health.check();
        } catch (err) {
            alert('Gagal terhubung ke server');
            return;
        }
    }
    const data = {
        name: document.getElementById('checkoutName').value,
        address: document.getElementById('checkoutAddress').value,
        phone: document.getElementById('checkoutPhone').value,
        total: computeTotal(),
        items: JSON.stringify(cart)
    };
    try {
        await pbClient.collection('orders').create(data);
        for (const item of cart) {
            try {
                const product = allProducts.find(p => p.id === item.id);
                if (!product) continue;
                const newStock = Math.max(0, product.stock - item.qty);
                await pbClient.collection('products').update(item.id, { stock: newStock });
                product.stock = newStock;
            } catch (err) {
                console.error('Gagal memperbarui stok', err);
            }
        }
        alert('Pesanan berhasil dikirim');
        cart.length = 0;
        hideCart();
        renderCartView();
        displayProducts(allProducts);
    } catch (err) {
        console.error(err);
        alert('Gagal mengirim pesanan');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cartBtn = document.getElementById('cartButton');
    if (cartBtn) cartBtn.addEventListener('click', showCart);
});
