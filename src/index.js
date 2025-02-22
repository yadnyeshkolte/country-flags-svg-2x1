// index.js
import { CountryFlags } from './CountryFlags.js';
import { loadFlagData, countryNames } from './flagDataLoader.js';

// Detect environment
const isNode = typeof process !== 'undefined' &&
    process.versions != null &&
    process.versions.node != null;

async function createCountryFlags() {
    if (isNode) {
        // Node.js environment
        const fs = await import('fs');
        const path = await import('path');
        const { fileURLToPath } = await import('url');

        const __filename = fileURLToPath(import.meta.url);
        const __dirname = path.dirname(__filename);

        const flagsPath = path.join(__dirname, '../flags');
        const flagData = {};

        const files = fs.readdirSync(flagsPath);
        files.forEach(file => {
            if (file.endsWith('.svg')) {
                const code = file.replace('.svg', '').toLowerCase();
                const svg = fs.readFileSync(path.join(flagsPath, file), 'utf-8');
                flagData[code] = svg;
            }
        });

        return new CountryFlags({ flagData, countryNames });
    } else {
        // Browser environment
        const flagData = await loadFlagData();
        return new CountryFlags({ flagData, countryNames });
    }
}

export { createCountryFlags, CountryFlags };