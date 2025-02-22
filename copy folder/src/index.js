import { flags } from './flags';

export class CountryFlags {
    constructor() {
        this.flags = flags;
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
}

export default CountryFlags;