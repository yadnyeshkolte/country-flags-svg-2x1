document.addEventListener('DOMContentLoaded', async () => {
    // Wait for a moment to ensure the script is fully loaded
    setTimeout(async () => {
        try {
            // Clear detection approach - set default variables to null
            let CountryFlagsLib = null;
            let globalObjects = [];

            // Check if library is loaded and get key objects
            // that might contain our library
            for (const key in window) {
                if (typeof window[key] === 'object' && window[key] !== null) {
                    globalObjects.push({ name: key, value: window[key] });
                }
            }

            console.log("Global objects:", globalObjects.map(obj => obj.name));

            // Look specifically for the UMD build of svg-country-flags-2x1
            if (window.svgCountryFlags2x1) {
                CountryFlagsLib = window.svgCountryFlags2x1.CountryFlags;
                console.log("Found via svgCountryFlags2x1");
            }
            // Direct global - from some UMD builds
            else if (window.CountryFlags && typeof window.CountryFlags === 'function') {
                CountryFlagsLib = window.CountryFlags;
                console.log("Found via global CountryFlags");
            }
            // Generic search
            else {
                for (const obj of globalObjects) {
                    if (obj.value.CountryFlags && typeof obj.value.CountryFlags === 'function') {
                        CountryFlagsLib = obj.value.CountryFlags;
                        console.log(`Found via ${obj.name}.CountryFlags`);
                        break;
                    }
                }
            }

            if (!CountryFlagsLib) {
                throw new Error('CountryFlags class not found');
            }

            console.log("CountryFlags constructor:", CountryFlagsLib);

            // Test initialize
            const flags = new CountryFlagsLib();
            console.log("Flags instance created successfully:", flags);

            // Check if we have access to the required methods
            if (typeof flags.getFlag !== 'function' || typeof flags.getAllCountryCodes !== 'function') {
                throw new Error('Required methods not found on flags instance');
            }

            // Initialize demos
            await initShowcase(flags, CountryFlagsLib);
            initSearch(flags);
            await initSingleFlag(flags, CountryFlagsLib);

        } catch (error) {
            console.error('Initialization error:', error);
            displayError(`Library initialization error: ${error.message}. Please check the console for details.`);
        }
    }, 500);  // Wait 500ms to ensure script is fully loaded
});

// Display error messages
function displayError(message) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.innerHTML = `<div class="error" style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px; background-color: #fff5f5;">${message}</div>`;
    });
}

// Initialize the flag showcase
async function initShowcase(flags, CountryFlagsLib) {
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
function initSearch(flags) {
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
async function initSingleFlag(flags, CountryFlagsLib) {
    const select = document.getElementById('country-select');
    const selectedFlag = document.getElementById('selected-flag');
    const countryName = document.getElementById('country-name');
    const countryCode = document.getElementById('country-code');
    const flagEmoji = document.getElementById('flag-emoji');

    try {
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

                    // Check if getFlagEmoji is available as static or instance method
                    let emoji = '';
                    if (typeof CountryFlagsLib.getFlagEmoji === 'function') {
                        emoji = CountryFlagsLib.getFlagEmoji(code);
                    } else if (typeof flags.getFlagEmoji === 'function') {
                        emoji = flags.getFlagEmoji(code);
                    }

                    flagEmoji.textContent = `Emoji: ${emoji || '(Not available)'}`;
                }
            } catch (error) {
                console.error(`Error loading flag ${code}:`, error);
                selectedFlag.innerHTML = '<p>Error loading flag</p>';
            }
        });
    } catch (error) {
        console.error('Error initializing dropdown:', error);
    }
}