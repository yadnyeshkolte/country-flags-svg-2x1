import { flags } from './flags';
import { countryData } from './countryData';

export class CountryFlags {
    constructor() {
        this.flags = flags;
        this.countryData = countryData;
    }

    /**
     * Get flag URL by country code
     * @param {string} countryCode - Two letter country code (ISO 3166-1 alpha-2)
     * @returns {string|null} Flag URL or null if not found
     */
    getFlagUrl(countryCode) {
        const code = countryCode.toLowerCase();
        return this.flags[code] || null;
    }
    /**
     * Get SVG element for a country flag
     * @param {string} countryCode - Two letter country code (ISO 3166-1 alpha-2)
     * @returns {Promise<SVGElement|null>} SVG element or null if not found
     */
    async getFlagElement(countryCode) {
        const url = this.getFlagUrl(countryCode);
        if (!url) return null;

        try {
            const response = await fetch(url);
            const svgText = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgText, 'image/svg+xml');
            return doc.documentElement;
        } catch (error) {
            console.error('Error fetching flag:', error);
            return null;
        }
    }

    /**
     * Get all available country codes
     * @returns {string[]} Array of country codes
     */
    getAllCountryCodes() {
        return Object.keys(this.flags);
    }

    /**
     * Get detailed flag information with optional sizing
     * @param {string} countryCode - Two letter country code
     * @param {Object} [options] - Optional configuration
     * @param {number} [options.width] - Desired width in pixels
     * @param {number} [options.height] - Desired height in pixels
     * @returns {Promise<Object>} Flag object with code, name, and SVG
     */
    async getFlag(countryCode, options = {}) {
        const code = countryCode.toLowerCase();
        if (!this.flags[code]) return null;

        try {
            const element = await this.getFlagElement(code);
            if (!element) return null;

            // Apply sizing if provided
            //if (options.width) element.setAttribute('width', `${options.width}px`);
            //if (options.height) element.setAttribute('height', `${options.height}px`);

            return {
                code,
                name: this.countryData[code]?.name || code.toUpperCase(),
                svg: element.outerHTML
            };
        } catch (error) {
            console.error('Error getting flag:', error);
            return null;
        }
    }

    /**
     * Get all flags with their details
     * @returns {Promise<Array>} Array of flag objects
     */
    async getAllFlags() {
        const flags = [];
        for (const code of this.getAllCountryCodes()) {
            const flag = await this.getFlag(code);
            if (flag) flags.push(flag);
        }
        return flags;
    }

    /**
     * Search flags by country code or name
     * @param {string} query - Search string
     * @returns {Promise<Array>} Array of matching flag objects
     */
    async searchFlags(query) {
        if (!query) return [];

        const searchTerm = query.toLowerCase();
        const matchingCodes = this.getAllCountryCodes().filter(code => {
            const countryName = this.countryData[code]?.name.toLowerCase() || '';
            return code.includes(searchTerm) || countryName.includes(searchTerm);
        });

        const results = [];
        for (const code of matchingCodes) {
            const flag = await this.getFlag(code);
            if (flag) results.push(flag);
        }
        return results;
    }

    /**
     * Get flag emoji for a country code
     * @param {string} countryCode - Two letter country code
     * @returns {string|null} Flag emoji or null if not found
     */
    static getFlagEmoji(countryCode) {
        const code = countryCode.toLowerCase();
        return countryData[code]?.emoji || null;
    }

    /**
     * Validate a country code
     * @param {string} code - Two letter country code to validate
     * @returns {boolean} Whether the code is valid
     */
    static validateCountryCode(code) {
        if (!code || typeof code !== 'string') return false;
        code = code.toLowerCase();
        return code.length === 2 && code in flags;
    }
}

export default CountryFlags;