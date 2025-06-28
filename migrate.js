import PocketBase from 'pocketbase';
import fs from 'fs/promises';
import path from 'path';
import FormData from 'form-data';
import fetch from 'node-fetch';
import { fileTypeFromBuffer } from 'file-type';

const POCKETBASE_URL = 'http://127.0.0.1:8090';
const POCKETBASE_ADMIN_EMAIL = 'admin@admin.com';
const POCKETBASE_ADMIN_PASSWORD = 'admin12345';
const COLLECTION_NAME = 'products';
const ASSETS_DIR = 'assets';
const CATEGORIES = ['gorengan', 'non gorengan'];

async function migrateData() {
    const pb = new PocketBase(POCKETBASE_URL);

    try {
        console.log('Authenticating admin...');
        await pb.admins.authWithPassword(POCKETBASE_ADMIN_EMAIL, POCKETBASE_ADMIN_PASSWORD);
        console.log('Admin authenticated successfully.');

        for (const category of CATEGORIES) {
            const categoryDir = path.join(ASSETS_DIR, category);
            console.log(`\nProcessing category: ${category} from ${categoryDir}`);

            let files;
            try {
                files = await fs.readdir(categoryDir);
            } catch (err) {
                if (err.code === 'ENOENT') {
                    console.warn(`Directory not found: ${categoryDir}. Skipping category.`);
                    continue;
                }
                throw err;
            }

            for (const file of files) {
                const filePath = path.join(categoryDir, file);
                const fileNameWithoutExt = path.parse(file).name;

                console.log(`Processing file: ${file}`);
                const fileBuffer = await fs.readFile(filePath);
                const fileTypeResult = await fileTypeFromBuffer(fileBuffer);
                const mimeType = fileTypeResult?.mime || 'application/octet-stream';

                const form = new FormData();
                form.append('name', fileNameWithoutExt);
                form.append('description', 'Ini adalah deskripsi placeholder.');
                form.append('price', 10000);
                form.append('stock', 100);
                form.append('category', category);
                form.append('image', fileBuffer, {
                    filename: file,
                    contentType: mimeType,
                });

                try {
                    const response = await fetch(`${POCKETBASE_URL}/api/collections/${COLLECTION_NAME}/records`, {
                        method: 'POST',
                        headers: {
                            'Authorization': pb.authStore.token ? `Bearer ${pb.authStore.token}` : '',
                        },
                        body: form,
                    });

                    if (!response.ok) {
                        const errorBody = await response.text();
                        console.error(`Failed to create record for ${fileNameWithoutExt}:`, errorBody);
                        continue;
                    }

                    const record = await response.json();
                    console.log(`✅ Created: ${fileNameWithoutExt} [ID: ${record.id}]`);
                } catch (err) {
                    console.error(`❌ Error uploading ${fileNameWithoutExt}:`, err);
                }
            }
        }

        console.log('\n✅ Migration completed successfully!');
    } catch (error) {
        console.error('Migration failed:');
        if (error.response?.data) {
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error);
        }
    }
}

migrateData();
