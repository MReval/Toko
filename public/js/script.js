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
    const pocketbaseUrl = 'http://127.0.0.1:8090'; // Ganti jika perlu atau buat ini bisa dikonfigurasi

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
                <div class="card product-card h-100" style="animation-delay: ${index * 0.1}s">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text flex-grow-1">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary">${product.category}</span>
                            <span class="price">Rp ${product.price.toLocaleString('id-ID')}</span>
                        </div>
                        <p class="card-text"><small class="text-muted">Stok: ${product.stock}</small></p>
                        <button class="btn btn-outline-danger detail-btn mb-2" data-id="${product.id}">Detail Produk</button>
                        <button class="btn btn-primary add-cart-btn mt-auto" data-id="${product.id}">Tambah ke Keranjang</button>
                    </div>
                </div>
            </div>`;
        container.innerHTML += card;
    });

    attachDetailEvents();
    attachCartEvents();
}

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
    document.querySelectorAll('.detail-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const id = this.dataset.id;
            const data = productDataMap[id];
            if (data) {
                openProductModal(data);
            }
        });
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
            addToCart(btn.dataset.id);
        });
    });
}

function addToCart(productId) {
    const product = allProducts.find(p => p.id === productId);
    if (!product) return;
    const existing = cart.find(item => item.id === productId);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ id: product.id, name: product.name, price: product.price, qty: 1 });
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
        li.textContent = `${item.name} x${item.qty} - Rp ${item.price.toLocaleString('id-ID')}`;
        list.appendChild(li);
    });
    totalEl.textContent = `Total: Rp ${computeTotal().toLocaleString('id-ID')}`;
}

function showCart() {
    updateCartUI();
    document.getElementById('cartOverlay').classList.remove('d-none');
}

function hideCart() {
    document.getElementById('cartOverlay').classList.add('d-none');
}

function showCheckoutForm() {
    const content = document.getElementById('cartContent');
    const total = computeTotal();
    if (!content) return;
    content.innerHTML = `
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
            <button type="submit" class="btn btn-success">Kirim Pesanan</button>
        </form>`;
    document.getElementById('checkoutForm').addEventListener('submit', submitCheckout);
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
        alert('Pesanan berhasil dikirim');
        cart.length = 0;
        hideCart();
    } catch (err) {
        console.error(err);
        alert('Gagal mengirim pesanan');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const cartBtn = document.getElementById('cartButton');
    const closeBtn = document.getElementById('closeCartButton');
    const checkoutBtn = document.getElementById('checkoutButton');
    if (cartBtn) cartBtn.addEventListener('click', showCart);
    if (closeBtn) closeBtn.addEventListener('click', hideCart);
    if (checkoutBtn) checkoutBtn.addEventListener('click', showCheckoutForm);
});
