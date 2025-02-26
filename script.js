document.addEventListener('DOMContentLoaded', async () => {
    // Check if the package is available globally
    if (typeof window.svgCountryFlags2x1 === 'undefined') {
        console.error('svg-country-flags-2x1 package not found. Make sure the CDN script is loaded correctly.');
        displayError('Package not loaded correctly. Please check the console for details.');
        return;
    }

    // Create a new instance of CountryFlags
    const { CountryFlags } = window.svgCountryFlags2x1;
    const flags = new CountryFlags();

    // Initialize demos
    await initFlagShowcase(flags);
    initFlagSearch(flags);
    await initSingleFlagDemo(flags);
});

// Display error messages
function displayError(message) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.innerHTML = `<div class="error">${message}</div>`;
    });
}

// Initialize the flag showcase
async function initFlagShowcase(flags) {
    const container = document.getElementById('showcase-container');
    const showcaseFlags = ['us', 'ca', 'gb', 'fr', 'de', 'jp', 'br', 'in', 'au', 'za', 'mx', 'ru'];

    for (const code of showcaseFlags) {
        try {
            const flag = await flags.getFlag(code, { width: 150 });
            if (flag) {
                const flagItem = document.createElement('div');
                flagItem.className = 'flag-item';
                flagItem.innerHTML = `
                    ${flag.svg}
                    <p>${flag.name}</p>
                `;
                container.appendChild(flagItem);
            }
        } catch (error) {
            console.error(`Error loading flag ${code}:`, error);
        }
    }
}

// Initialize the flag search functionality
function initFlagSearch(flags) {
    const searchInput = document.getElementById('flag-search');
    const resultsContainer = document.getElementById('search-results');

    let debounceTimeout;

    searchInput.addEventListener('input', (e) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(async () => {
            const query = e.target.value.trim();
            resultsContainer.innerHTML = '';

            if (query.length < 2) return;

            try {
                const results = await flags.searchFlags(query);

                if (results.length === 0) {
                    resultsContainer.innerHTML = '<p>No flags found</p>';
                    return;
                }

                results.forEach(flag => {
                    const flagItem = document.createElement('div');
                    flagItem.className = 'flag-item';
                    flagItem.innerHTML = `
                        ${flag.svg}
                        <p>${flag.name}</p>
                    `;
                    resultsContainer.appendChild(flagItem);
                });
            } catch (error) {
                console.error('Search error:', error);
                resultsContainer.innerHTML = '<p>Error searching flags</p>';
            }
        }, 300);
    });
}

// Initialize the single flag selection demo
async function initSingleFlagDemo(flags) {
    const select = document.getElementById('country-select');
    const selectedFlag = document.getElementById('selected-flag');
    const countryName = document.getElementById('country-name');
    const countryCode = document.getElementById('country-code');
    const flagEmoji = document.getElementById('flag-emoji');

    // Get all country codes
    const countryCodes = flags.getAllCountryCodes();

    // Get all flags to build the dropdown
    const allFlags = await flags.getAllFlags();

    // Sort by country name
    allFlags.sort((a, b) => a.name.localeCompare(b.name));

    // Populate dropdown
    allFlags.forEach(flag => {
        const option = document.createElement('option');
        option.value = flag.code;
        option.textContent = flag.name;
        select.appendChild(option);
    });

    // Handle selection change
    select.addEventListener('change', async (e) => {
        const code = e.target.value;
        if (!code) {
            selectedFlag.innerHTML = '';
            countryName.textContent = '';
            countryCode.textContent = '';
            flagEmoji.textContent = '';
            return;
        }

        try {
            const flag = await flags.getFlag(code, { width: 300 });
            if (flag) {
                selectedFlag.innerHTML = flag.svg;
                countryName.textContent = `Country: ${flag.name}`;
                countryCode.textContent = `Code: ${flag.code.toUpperCase()}`;
                flagEmoji.textContent = `Emoji: ${CountryFlags.getFlagEmoji(code)}`;
            }
        } catch (error) {
            console.error(`Error loading flag ${code}:`, error);
            selectedFlag.innerHTML = '<p>Error loading flag</p>';
        }
    });
}