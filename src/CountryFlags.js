class CountryFlags {
    constructor(options = {}) {
        this.flags = new Map();
        this.originalWidth = 900;
        this.originalHeight = 450;
        this.countryNames = {};

        // Allow injection of data for browser environments
        if (options.countryNames) {
            this.countryNames = options.countryNames;
        }

        if (options.flagData) {
            this.loadFlagsFromData(options.flagData);
        }
    }

    loadFlagsFromData(flagData) {
        Object.entries(flagData).forEach(([code, svg]) => {
            code = code.toLowerCase();
            this.flags.set(code, {
                code,
                name: this.getCountryName(code),
                svg
            });
        });
    }

    getCountryName(code) {
        return this.countryNames[code] || code.toUpperCase();
    }

    resizeSVG(svg, options = {}) {
        // If width is provided, ensure height is exactly half of width
        if (options.width) {
            const width = options.width;
            const height = width / 2; // This enforces 2:1 ratio
            return svg.replace(
                /<svg[^>]*>/,
                `<svg width="${width}" height="${height}" viewBox="0 0 ${this.originalWidth} ${this.originalHeight}">`
            );
        }

        // If height is provided, ensure width is exactly double
        if (options.height) {
            const height = options.height;
            const width = height * 2; // This enforces 2:1 ratio
            return svg.replace(
                /<svg[^>]*>/,
                `<svg width="${width}" height="${height}" viewBox="0 0 ${this.originalWidth} ${this.originalHeight}">`
            );
        }

        // If no dimensions provided, return original size (900x450)
        return svg.replace(
            /<svg[^>]*>/,
            `<svg width="${this.originalWidth}" height="${this.originalHeight}" viewBox="0 0 ${this.originalWidth} ${this.originalHeight}">`
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

        // Using btoa for browser environments
        return `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(flag.svg)))}`;
    }

    searchFlags(query) {
        const searchTerm = query.toLowerCase();
        return Array.from(this.flags.values()).filter(flag =>
            flag.name.toLowerCase().includes(searchTerm) ||
            flag.code.toLowerCase().includes(searchTerm)
        );
    }

    // Static utility methods
    static validateCountryCode(code) {
        return /^[a-zA-Z]{2}$/.test(code);
    }

    static getFlagEmoji(countryCode) {
        const codePoints = countryCode
            .toUpperCase()
            .split('')
            .map(char => 127397 + char.charCodeAt(0));
        return String.fromCodePoint(...codePoints);
    }
}

// Export for both ESM and CJS environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CountryFlags;
} else if (typeof exports !== 'undefined') {
    exports.CountryFlags = CountryFlags;
} else if (typeof define === 'function' && define.amd) {
    define([], function() { return CountryFlags; });
} else {
    window.CountryFlags = CountryFlags;
}