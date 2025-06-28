import PocketBase from 'pocketbase';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data'; // Diperlukan untuk membuat FormData object

const POCKETBASE_URL = 'http://127.0.0.1:8090'; // Sesuaikan jika perlu
const POCKETBASE_ADMIN_EMAIL = 'admin@example.com'; // Ganti dengan email admin Anda
const POCKETBASE_ADMIN_PASSWORD = 'password123'; // Ganti dengan password admin Anda
const COLLECTION_NAME = 'products';

const ASSETS_DIR = 'assets';
const CATEGORIES = ['gorengan', 'non gorengan'];

async function migrateData() {
    const pb = new PocketBase(POCKETBASE_URL);

    try {
        // 1. Autentikasi sebagai admin (jika koleksi tidak publik)
        // Jika koleksi 'products' Anda dapat ditulis secara publik, Anda bisa melewati langkah ini.
        // Namun, untuk operasi create/update/delete biasanya memerlukan autentikasi.
        console.log('Authenticating admin...');
        await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
        console.log('Admin authenticated successfully.');

        for (const category of CATEGORIES) {
            const categoryDir = path.join(ASSETS_DIR, category);
            console.log(`\nProcessing category: ${category} from ${categoryDir}`);

            try {
                const files = await fs.readdir(categoryDir);

                for (const file of files) {
                    const filePath = path.join(categoryDir, file);
                    const fileNameWithoutExt = path.parse(file).name;

                    console.log(`Processing file: ${file}`);

                    // Cek apakah produk sudah ada berdasarkan nama (opsional, untuk menghindari duplikasi)
                    // Ini memerlukan field 'name' unik atau logika tambahan jika nama tidak unik.
                    // Untuk contoh ini, kita akan mengabaikan pengecekan duplikasi dan selalu membuat record baru.
                    /*
                    try {
                        const existingRecord = await pb.collection(COLLECTION_NAME).getFirstListItem(`name="${fileNameWithoutExt}"`);
                        if (existingRecord) {
                            console.log(`Product "${fileNameWithoutExt}" already exists. Skipping.`);
                            continue;
                        }
                    } catch (error) {
                        // getFirstListItem akan error jika tidak ada record, ini normal.
                        if (error.status !== 404) {
                            console.warn(`Could not check for existing product "${fileNameWithoutExt}":`, error.message);
                        }
                    }
                    */

                    const fileBuffer = await fs.readFile(filePath);

                    // Membuat FormData untuk upload file
                    const formData = new FormData();
                    formData.append('name', fileNameWithoutExt);
                    formData.append('description', 'Ini adalah deskripsi placeholder.');
                    formData.append('price', 10000); // Harga default
                    formData.append('stock', 100);   // Stok default
                    formData.append('category', category);
                    // Untuk field file, PocketBase SDK mengharapkan Buffer atau Blob
                    // dan nama file asli.
                    // Kita harus membuat Blob dari Buffer jika menggunakan di Node.js
                    // atau pastikan SDK bisa menangani Buffer langsung untuk field file.
                    // PocketBase SDK v0.20+ seharusnya bisa menangani Buffer dari fs.readFile.
                    formData.append('image', new Blob([fileBuffer]), file);


                    console.log(`Creating record for ${fileNameWithoutExt} in category ${category}...`);
                    const record = await pb.collection(COLLECTION_NAME).create(formData);
                    console.log(`Successfully created record for ${fileNameWithoutExt} with ID: ${record.id}`);
                }
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.warn(`Directory not found: ${categoryDir}. Skipping category.`);
                } else {
                    console.error(`Error processing directory ${categoryDir}:`, err);
                }
            }
        }
        console.log('\nMigration completed successfully!');

    } catch (error) {
        console.error('Migration failed:');
        if (error.response && error.response.data) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error);
        }
    } finally {
        // Logout admin (opsional, tergantung kebutuhan)
        // pb.authStore.clear();
    }
}

migrateData();
