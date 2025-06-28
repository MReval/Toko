// Ini adalah file JavaScript utama Anda.
// Untuk saat ini, kita akan membiarkannya kosong atau dengan komentar dasar.
// Fungsi untuk mengambil dan menampilkan produk akan ditambahkan di sini nanti.

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

    // Logika untuk halaman produk akan ditambahkan di sini
    // Misalnya, mengambil data dari Pocketbase dan menampilkannya.
    if (document.getElementById('product-container')) {
        // Fungsi ini akan dipanggil jika kita berada di halaman produk
        loadProducts();
    }

    // Efek parallax sederhana untuk hero image jika ada
    const hero = document.getElementById('hero');
    if (hero) {
        window.addEventListener('scroll', function() {
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

        productContainer.innerHTML = ''; // Bersihkan placeholder atau produk lama

        records.forEach((product, index) => {
            // Untuk mendapatkan URL gambar dari Pocketbase:
            // pb.files.getUrl(record, filename, queryParams = {})
            const imageUrl = product.image ? pb.files.getUrl(product, product.image) : 'https://via.placeholder.com/300x200.png?text=No+Image';

            const productCard = `
                <div class="col">
                    <div class="card product-card h-100" style="animation-delay: ${index * 0.1}s">
                        <img src="${imageUrl}" class="card-img-top" alt="${product.name || 'Gambar Produk'}">
                        <div class="card-body d-flex flex-column">
                            <h5 class="card-title">${product.name || 'Nama Produk Tidak Tersedia'}</h5>
                            <p class="card-text flex-grow-1">${product.description || 'Deskripsi tidak tersedia.'}</p>
                            <div class="d-flex justify-content-between align-items-center mb-2">
                                <span class="badge bg-primary">${product.category || 'Umum'}</span>
                                <span class="price">Rp ${product.price ? product.price.toLocaleString('id-ID') : 'N/A'}</span>
                            </div>
                            <p class="card-text"><small class="text-muted">Stok: ${product.stock !== undefined ? product.stock : 'N/A'}</small></p>
                            <a href="#" class="btn btn-outline-danger mt-auto">Detail Produk</a>
                        </div>
                    </div>
                </div>
            `;
            productContainer.innerHTML += productCard;
        });

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

    container.innerHTML = ''; // Bersihkan container

    dummyProducts.forEach((product, index) => {
        const productCard = `
            <div class="col">
                <div class="card product-card h-100" style="animation-delay: ${index * 0.1}s">
                    <img src="${product.image_url}" class="card-img-top" alt="${product.name}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${product.name}</h5>
                        <p class="card-text flex-grow-1">${product.description}</p>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                             <span class="badge bg-primary">${product.category}</span>
                             <span class="price">Rp ${product.price.toLocaleString('id-ID')}</span>
                        </div>
                        <p class="card-text"><small class="text-muted">Stok: ${product.stock}</small></p>
                        <a href="#" class="btn btn-outline-danger mt-auto">Detail Produk</a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += productCard;
    });
}

// Panggil loadProducts jika kita berada di halaman produk.
// Ini akan di-trigger oleh DOMContentLoaded di atas.
// Jika Anda ingin memanggilnya secara eksplisit setelah DOMContentLoaded:
// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', loadProducts);
// } else {
//     // DOMContentLoaded sudah selesai
//     if (document.getElementById('product-container')) {
//         loadProducts();
//     }
// }
