document.addEventListener('DOMContentLoaded', async () => {
    // Debug to see what's available in the global scope
    console.log("Available globals:", Object.keys(window).filter(key =>
        key.toLowerCase().includes('flag') ||
        key.toLowerCase().includes('country') ||
        key.toLowerCase().includes('svg')
    ));

    // Try to find the CountryFlags constructor
    let CountryFlagsClass;

    // Option 1: Direct access
    if (typeof window.CountryFlags === 'function') {
        CountryFlagsClass = window.CountryFlags;
    }
    // Option 2: Module with named export
    else if (window.svgCountryFlags2x1 && typeof window.svgCountryFlags2x1.CountryFlags === 'function') {
        CountryFlagsClass = window.svgCountryFlags2x1.CountryFlags;
    }
    // Option 3: Package name variations
    else if (window.svgCountryFlags && typeof window.svgCountryFlags.CountryFlags === 'function') {
        CountryFlagsClass = window.svgCountryFlags.CountryFlags;
    }
    // Option 4: Try UMD export name variations
    else {
        // Look for any object that might contain our class
        for (const key of Object.keys(window)) {
            if (typeof window[key] === 'object' && window[key] !== null) {
                if (typeof window[key].CountryFlags === 'function') {
                    CountryFlagsClass = window[key].CountryFlags;
                    break;
                }
            } else if (typeof window[key] === 'function' &&
                (key.includes('Flag') || key.includes('flag') || key.includes('Country') || key.includes('country'))) {
                CountryFlagsClass = window[key];
                break;
            }
        }
    }

    if (!CountryFlagsClass) {
        console.error('CountryFlags class not found. Make sure the library is loaded correctly.');
        displayError('Library not loaded correctly. Please check the console for details.');
        return;
    }

    console.log("Found CountryFlags class:", CountryFlagsClass);

    try {
        // Create a new instance of CountryFlags
        const flags = new CountryFlagsClass();
        console.log("Flags instance:", flags);

        // Test a method to confirm it's working
        const testCode = 'us';
        const testFlag = await flags.getFlag(testCode, { width: 100 });
        console.log(`Test flag (${testCode}):`, testFlag);

        // Initialize demos if the test was successful
        if (testFlag) {
            await initFlagShowcase(flags, CountryFlagsClass);
            initFlagSearch(flags);
            await initSingleFlagDemo(flags, CountryFlagsClass);
        } else {
            displayError('Could not retrieve test flag. Library methods may not be working correctly.');
        }
    } catch (error) {
        console.error('Error initializing library:', error);
        displayError('Error initializing the flags library. Please check the console for details.');
    }
});

// Display error messages
function displayError(message) {
    const sections = document.querySelectorAll('section');
    sections.forEach(section => {
        section.innerHTML = `<div class="error" style="color: red; padding: 20px; border: 1px solid red; border-radius: 4px; background-color: #fff5f5;">${message}</div>`;
    });
}

// Initialize the flag showcase
async function initFlagShowcase(flags, CountryFlagsClass) {
    const container = document.getElementById('showcase-container');
    const showcaseFlags = ['in', 'ru', 'br', 'za', 'jp', 'cn', 'us', 'ca', 'gb', 'de', 'au', 'mx'];

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
async function initSingleFlagDemo(flags, CountryFlagsClass) {
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

                // Check if getFlagEmoji is a static method
                const emoji = typeof CountryFlagsClass.getFlagEmoji === 'function'
                    ? CountryFlagsClass.getFlagEmoji(code)
                    : (flags.getFlagEmoji ? flags.getFlagEmoji(code) : '');

                flagEmoji.textContent = `Emoji: ${emoji || '(Not available)'}`;
            }
        } catch (error) {
            console.error(`Error loading flag ${code}:`, error);
            selectedFlag.innerHTML = '<p>Error loading flag</p>';
        }
    });
}