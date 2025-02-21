const fs = require('fs');
const path = require('path');

class CountryFlags {
    constructor() {
        this.flagsPath = path.join(__dirname, '../flags');
        this.flags = new Map();
        this.originalWidth = 900;
        this.originalHeight = 450;
        this.loadFlags();
    }

    loadFlags() {
        const files = fs.readdirSync(this.flagsPath);

        files.forEach(file => {
            if (file.endsWith('.svg')) {
                const code = file.replace('.svg', '').toLowerCase();
                const svg = fs.readFileSync(path.join(this.flagsPath, file), 'utf-8');

                this.flags.set(code, {
                    code,
                    name: this.getCountryName(code),
                    svg
                });
            }
        });
    }

    getCountryName(code) {
        const countryNames = {
            'in': 'India',
            'us': 'United States',
            // Add more countries as needed
        };
        return countryNames[code] || code.toUpperCase();
    }

    resizeSVG(svg, options = {}) {
        const width = options.width || this.originalWidth;
        const height = options.preserveAspectRatio
            ? (width * this.originalHeight) / this.originalWidth
            : (options.height || this.originalHeight);

        return svg.replace(
            /<svg[^>]*>/,
            `<svg width="${width}" height="${height}" viewBox="0 0 ${this.originalWidth} ${this.originalHeight}">`
        );
    }

    getAllFlags() {
        return Array.from(this.flags.values());
    }

    getFlag(countryCode, options) {
        const flag = this.flags.get(countryCode.toLowerCase());

        if (!flag) return null;

        if (options) {
            return {
                ...flag,
                svg: this.resizeSVG(flag.svg, options)
            };
        }

        return flag;
    }

    getFlagAsDataURL(countryCode, options) {
        const flag = this.getFlag(countryCode, options);
        if (!flag) return null;

        return `data:image/svg+xml;base64,${Buffer.from(flag.svg).toString('base64')}`;
    }

    searchFlags(query) {
        const searchTerm = query.toLowerCase();
        return Array.from(this.flags.values()).filter(flag =>
            flag.name.toLowerCase().includes(searchTerm) ||
            flag.code.toLowerCase().includes(searchTerm)
        );
    }
}

// Utility functions
CountryFlags.validateCountryCode = (code) => {
    return /^[a-zA-Z]{2}$/.test(code);
};

CountryFlags.getFlagEmoji = (countryCode) => {
    const codePoints = countryCode
        .toUpperCase()
        .split('')
        .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

module.exports = CountryFlags;