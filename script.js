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
            initSingleFlag(flags, CountryFlagsLib); // Changed to not be async - we'll load country list first

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
    const showcaseFlags = ['in', 'ru', 'br', 'za', 'jp', 'cn', 'us', 'ca', 'fr', 'de', 'au', 'mx'];

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
function initSingleFlag(flags, CountryFlagsLib) {
    const select = document.getElementById('country-select');
    const selectedFlag = document.getElementById('selected-flag');
    const countryName = document.getElementById('country-name');
    const countryCode = document.getElementById('country-code');
    const flagEmoji = document.getElementById('flag-emoji');
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.textContent = 'Loading country list...';

    // Add loading indicator
    select.parentNode.insertBefore(loadingIndicator, select.nextSibling);

    // Disable select until options are loaded
    select.disabled = true;

    // Create a function to fetch and populate country data
    const fetchCountries = async () => {
        try {
            // Get all country data but don't fetch SVGs yet
            // We're using a separate API call that only gets names and codes
            const countryCodes = flags.getAllCountryCodes();

            // Check if we have countryCodes array
            if (!Array.isArray(countryCodes) || countryCodes.length === 0) {
                throw new Error('No country codes available');
            }

            // Create an array of objects with country info
            const countries = [];

            // This approach avoids loading all flags at once
            for (const code of countryCodes) {
                // Get country name using getCountryName method if available, or hardcode common ones
                let name = '';
                if (typeof flags.getCountryName === 'function') {
                    name = flags.getCountryName(code);
                } else {
                    // Fallback for common countries if method is not available
                    const countryNames = {
                        "ad": "Andorra",
                        "ae": "United Arab Emirates",
                        "af": "Afghanistan",
                        "ag": "Antigua and Barbuda",
                        "ai": "Anguilla",
                        "al": "Albania",
                        "am": "Armenia",
                        "ao": "Angola",
                        "aq": "Antarctica",
                        "ar": "Argentina",
                        "as": "American Samoa",
                        "at": "Austria",
                        "au": "Australia",
                        "aw": "Aruba",
                        "ax": "Aland Islands",
                        "az": "Azerbaijan",
                        "ba": "Bosnia and Herzegovina",
                        "bb": "Barbados",
                        "bd": "Bangladesh",
                        "be": "Belgium",
                        "bf": "Burkina Faso",
                        "bg": "Bulgaria",
                        "bh": "Bahrain",
                        "bi": "Burundi",
                        "bj": "Benin",
                        "bl": "Saint Barthelemy",
                        "bm": "Bermuda",
                        "bn": "Brunei Darussalam",
                        "bo": "Bolivia, Plurinational State of",
                        "bq": "Caribbean Netherlands",
                        "br": "Brazil",
                        "bs": "Bahamas",
                        "bt": "Bhutan",
                        "bv": "Bouvet Island",
                        "bw": "Botswana",
                        "by": "Belarus",
                        "bz": "Belize",
                        "ca": "Canada",
                        "cc": "Cocos (Keeling) Islands",
                        "cd": "Congo, the Democratic Republic of the",
                        "cf": "Central African Republic",
                        "cg": "Republic of the Congo",
                        "ch": "Switzerland",
                        "ci": "Ivory Coast",
                        "ck": "Cook Islands",
                        "cl": "Chile",
                        "cm": "Cameroon",
                        "cn": "China (People's Republic of China)",
                        "co": "Colombia",
                        "cr": "Costa Rica",
                        "cu": "Cuba",
                        "cv": "Cape Verde",
                        "cw": "Curacao",
                        "cx": "Christmas Island",
                        "cy": "Cyprus",
                        "cz": "Czech Republic",
                        "de": "Germany",
                        "dj": "Djibouti",
                        "dk": "Denmark",
                        "dm": "Dominica",
                        "do": "Dominican Republic",
                        "dz": "Algeria",
                        "ec": "Ecuador",
                        "ee": "Estonia",
                        "eg": "Egypt",
                        "eh": "Western Sahara",
                        "er": "Eritrea",
                        "es": "Spain",
                        "et": "Ethiopia",
                        "eu": "Europe",
                        "fi": "Finland",
                        "fj": "Fiji",
                        "fk": "Falkland Islands (Malvinas)",
                        "fm": "Micronesia, Federated States of",
                        "fo": "Faroe Islands",
                        "fr": "France",
                        "ga": "Gabon",
                        "gb_eng": "England",
                        "gb_nir": "Northern Ireland",
                        "gb_sct": "Scotland",
                        "gb_wls": "Wales",
                        "gb": "United Kingdom",
                        "gd": "Grenada",
                        "ge": "Georgia",
                        "gf": "French Guiana",
                        "gg": "Guernsey",
                        "gh": "Ghana",
                        "gi": "Gibraltar",
                        "gl": "Greenland",
                        "gm": "Gambia",
                        "gn": "Guinea",
                        "gp": "Guadeloupe",
                        "gq": "Equatorial Guinea",
                        "gr": "Greece",
                        "gs": "South Georgia and the South Sandwich Islands",
                        "gt": "Guatemala",
                        "gu": "Guam",
                        "gw": "Guinea-Bissau",
                        "gy": "Guyana",
                        "hk": "Hong Kong",
                        "hm": "Heard Island and McDonald Islands",
                        "hn": "Honduras",
                        "hr": "Croatia",
                        "ht": "Haiti",
                        "hu": "Hungary",
                        "id": "Indonesia",
                        "ie": "Ireland",
                        "il": "Israel",
                        "im": "Isle of Man",
                        "in": "India",
                        "io": "British Indian Ocean Territory",
                        "iq": "Iraq",
                        "ir": "Iran, Islamic Republic of",
                        "is": "Iceland",
                        "it": "Italy",
                        "je": "Jersey",
                        "jm": "Jamaica",
                        "jo": "Jordan",
                        "jp": "Japan",
                        "ke": "Kenya",
                        "kg": "Kyrgyzstan",
                        "kh": "Cambodia",
                        "ki": "Kiribati",
                        "km": "Comoros",
                        "kn": "Saint Kitts and Nevis",
                        "kp": "Korea, Democratic People's Republic of",
                        "kr": "Korea, Republic of",
                        "kw": "Kuwait",
                        "ky": "Cayman Islands",
                        "kz": "Kazakhstan",
                        "la": "Laos (Lao People's Democratic Republic)",
                        "lb": "Lebanon",
                        "lc": "Saint Lucia",
                        "li": "Liechtenstein",
                        "lk": "Sri Lanka",
                        "lr": "Liberia",
                        "ls": "Lesotho",
                        "lt": "Lithuania",
                        "lu": "Luxembourg",
                        "lv": "Latvia",
                        "ly": "Libya",
                        "ma": "Morocco",
                        "mc": "Monaco",
                        "md": "Moldova, Republic of",
                        "me": "Montenegro",
                        "mf": "Saint Martin",
                        "mg": "Madagascar",
                        "mh": "Marshall Islands",
                        "mk": "North Macedonia",
                        "ml": "Mali",
                        "mm": "Myanmar",
                        "mn": "Mongolia",
                        "mo": "Macao",
                        "mp": "Northern Mariana Islands",
                        "mq": "Martinique",
                        "mr": "Mauritania",
                        "ms": "Montserrat",
                        "mt": "Malta",
                        "mu": "Mauritius",
                        "mv": "Maldives",
                        "mw": "Malawi",
                        "mx": "Mexico",
                        "my": "Malaysia",
                        "mz": "Mozambique",
                        "na": "Namibia",
                        "nc": "New Caledonia",
                        "ne": "Niger",
                        "nf": "Norfolk Island",
                        "ng": "Nigeria",
                        "ni": "Nicaragua",
                        "nl": "Netherlands",
                        "no": "Norway",
                        "np": "Nepal",
                        "nr": "Nauru",
                        "nu": "Niue",
                        "nz": "New Zealand",
                        "om": "Oman",
                        "pa": "Panama",
                        "pe": "Peru",
                        "pf": "French Polynesia",
                        "pg": "Papua New Guinea",
                        "ph": "Philippines",
                        "pk": "Pakistan",
                        "pl": "Poland",
                        "pm": "Saint Pierre and Miquelon",
                        "pn": "Pitcairn",
                        "pr": "Puerto Rico",
                        "ps": "Palestine",
                        "pt": "Portugal",
                        "pw": "Palau",
                        "py": "Paraguay",
                        "qa": "Qatar",
                        "re": "Rrunion",
                        "ro": "Romania",
                        "rs": "Serbia",
                        "ru": "Russian Federation",
                        "rw": "Rwanda",
                        "sa": "Saudi Arabia",
                        "sb": "Solomon Islands",
                        "sc": "Seychelles",
                        "sd": "Sudan",
                        "se": "Sweden",
                        "sg": "Singapore",
                        "sh": "Saint Helena, Ascension and Tristan da Cunha",
                        "si": "Slovenia",
                        "sj": "Svalbard and Jan Mayen Islands",
                        "sk": "Slovakia",
                        "sl": "Sierra Leone",
                        "sm": "San Marino",
                        "sn": "Senegal",
                        "so": "Somalia",
                        "sr": "Suriname",
                        "ss": "South Sudan",
                        "st": "Sao Tome and Principe",
                        "sv": "El Salvador",
                        "sx": "Sint Maarten (Dutch part)",
                        "sy": "Syrian Arab Republic",
                        "sz": "Kingdom of Eswatini",
                        "tc": "Turks and Caicos Islands",
                        "td": "Chad",
                        "tf": "French Southern Territories",
                        "tg": "Togo",
                        "th": "Thailand",
                        "tj": "Tajikistan",
                        "tk": "Tokelau",
                        "tl": "Timor-Leste",
                        "tm": "Turkmenistan",
                        "tn": "Tunisia",
                        "to": "Tonga",
                        "tr": "Turkey",
                        "tt": "Trinidad and Tobago",
                        "tv": "Tuvalu",
                        "tw": "Taiwan (Republic of China)",
                        "tz": "Tanzania, United Republic of",
                        "ua": "Ukraine",
                        "ug": "Uganda",
                        "um": "US Minor Outlying Islands",
                        "us": "United States",
                        "uy": "Uruguay",
                        "uz": "Uzbekistan",
                        "va": "Holy See (Vatican City State)",
                        "vc": "Saint Vincent and the Grenadines",
                        "ve": "Venezuela, Bolivarian Republic of",
                        "vg": "Virgin Islands, British",
                        "vi": "Virgin Islands, U.S.",
                        "vn": "Vietnam",
                        "vu": "Vanuatu",
                        "wf": "Wallis and Futuna Islands",
                        "ws": "Samoa",
                        "xk": "Kosovo",
                        "ye": "Yemen",
                        "yt": "Mayotte",
                        "za": "South Africa",
                        "zm": "Zambia",
                        "zw": "Zimbabwe"
                    };
                    name = countryNames[code.toLowerCase()] || code.toUpperCase();
                }

                countries.push({ code, name });
            }

            // Sort by country name
            countries.sort((a, b) => a.name.localeCompare(b.name));

            // Remove the loading indicator
            if (loadingIndicator.parentNode) {
                loadingIndicator.parentNode.removeChild(loadingIndicator);
            }

            // Enable select
            select.disabled = false;

            // Populate dropdown
            countries.forEach(country => {
                const option = document.createElement('option');
                option.value = country.code;
                option.textContent = country.name;
                select.appendChild(option);
            });

            console.log(`Loaded ${countries.length} countries in dropdown`);

        } catch (error) {
            console.error('Error initializing country dropdown:', error);
            loadingIndicator.textContent = 'Error loading countries. Please try again.';
            loadingIndicator.style.color = 'red';
        }
        addZoomDragFunctionality();
    };


    function addZoomDragFunctionality() {
        const selectedFlag = document.getElementById('selected-flag');
        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        zoomControls.style.display = 'none'; // Initially hidden until a flag is selected

        // Create zoom buttons
        const zoomIn = document.createElement('button');
        zoomIn.textContent = '➕';
        zoomIn.title = 'Zoom In';
        zoomIn.className = 'zoom-button';

        const zoomOut = document.createElement('button');
        zoomOut.textContent = '➖';
        zoomOut.title = 'Zoom Out';
        zoomOut.className = 'zoom-button';

        const resetZoom = document.createElement('button');
        resetZoom.textContent = '⟲';
        resetZoom.title = 'Reset Zoom';
        resetZoom.className = 'zoom-button';

        // Add buttons to controls
        zoomControls.appendChild(zoomIn);
        zoomControls.appendChild(resetZoom);
        zoomControls.appendChild(zoomOut);

        // Insert controls after the selected flag div
        selectedFlag.parentNode.insertBefore(zoomControls, selectedFlag.nextSibling);

        // Add zoom info text
        const zoomInfo = document.createElement('div');
        zoomInfo.className = 'zoom-info';
        zoomInfo.textContent = 'SVG flags can be zoomed infinitely without losing quality';
        zoomInfo.style.display = 'none';
        selectedFlag.parentNode.insertBefore(zoomInfo, zoomControls.nextSibling);

        // Variables to track zoom level and drag state
        let currentZoom = 1;
        const zoomStep = 0.2;
        const maxZoom = 5;
        const minZoom = 0.5;

        // Variables for drag functionality
        let isDragging = false;
        let startX, startY;
        let translateX = 0;
        let translateY = 0;

        // Function to update flag transform
        function updateTransform() {
            const svg = selectedFlag.querySelector('svg');
            if (svg) {
                svg.style.transform = `scale(${currentZoom}) translate(${translateX}px, ${translateY}px)`;
                svg.style.transformOrigin = 'center center';
                zoomInfo.textContent = `Zoom: ${Math.round(currentZoom * 100)}% - Drag to pan when zoomed in`;

                // Show drag hint only when zoomed in
                if (currentZoom > 1) {
                    zoomInfo.textContent = `Zoom: ${Math.round(currentZoom * 100)}% - Drag to pan`;
                    selectedFlag.style.cursor = 'grab';
                } else {
                    zoomInfo.textContent = `Zoom: ${Math.round(currentZoom * 100)}%`;
                    selectedFlag.style.cursor = 'default';
                    // Reset translation when at normal zoom
                    translateX = 0;
                    translateY = 0;
                }
            }
        }

        // Event listeners for zoom buttons
        zoomIn.addEventListener('click', () => {
            if (currentZoom < maxZoom) {
                currentZoom += zoomStep;
                updateTransform();
            }
        });

        zoomOut.addEventListener('click', () => {
            if (currentZoom > minZoom) {
                currentZoom -= zoomStep;
                updateTransform();
            }
        });

        resetZoom.addEventListener('click', () => {
            currentZoom = 1;
            translateX = 0;
            translateY = 0;
            updateTransform();
        });

        // Show zoom controls when a flag is selected
        const countrySelect = document.getElementById('country-select');
        countrySelect.addEventListener('change', (e) => {
            const code = e.target.value;

            // Reset zoom and position when changing flags
            currentZoom = 1;
            translateX = 0;
            translateY = 0;

            // Show/hide zoom controls based on selection
            if (code) {
                // Wait a moment for the flag to load before showing controls
                setTimeout(() => {
                    zoomControls.style.display = 'flex';
                    zoomInfo.style.display = 'block';
                    updateTransform();
                }, 500);
            } else {
                zoomControls.style.display = 'none';
                zoomInfo.style.display = 'none';
            }
        });

        // Mouse wheel zoom functionality on the flag
        selectedFlag.addEventListener('wheel', (e) => {
            if (selectedFlag.querySelector('svg')) {
                e.preventDefault(); // Prevent page scrolling

                if (e.deltaY < 0 && currentZoom < maxZoom) {
                    // Zoom in
                    currentZoom += zoomStep;
                } else if (e.deltaY > 0 && currentZoom > minZoom) {
                    // Zoom out
                    currentZoom -= zoomStep;
                }

                updateTransform();
            }
        });

        // Drag functionality
        selectedFlag.addEventListener('mousedown', (e) => {
            const svg = selectedFlag.querySelector('svg');
            if (svg && currentZoom > 1) {
                isDragging = true;
                startX = e.clientX;
                startY = e.clientY;
                selectedFlag.style.cursor = 'grabbing';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                // Calculate the distance moved
                const dx = (e.clientX - startX) / currentZoom;
                const dy = (e.clientY - startY) / currentZoom;

                // Update the position
                translateX += dx;
                translateY += dy;

                // Update the starting point for the next move
                startX = e.clientX;
                startY = e.clientY;

                updateTransform();
            }
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                selectedFlag.style.cursor = 'grab';
            }
        });

        // Touch support for mobile devices
        selectedFlag.addEventListener('touchstart', (e) => {
            const svg = selectedFlag.querySelector('svg');
            if (svg && currentZoom > 1 && e.touches.length === 1) {
                isDragging = true;
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;
                e.preventDefault(); // Prevent scrolling on touch devices
            }
        });

        document.addEventListener('touchmove', (e) => {
            if (isDragging && e.touches.length === 1) {
                // Calculate the distance moved
                const dx = (e.touches[0].clientX - startX) / currentZoom;
                const dy = (e.touches[0].clientY - startY) / currentZoom;

                // Update the position
                translateX += dx;
                translateY += dy;

                // Update the starting point for the next move
                startX = e.touches[0].clientX;
                startY = e.touches[0].clientY;

                updateTransform();
                e.preventDefault(); // Prevent scrolling
            }
        });

        document.addEventListener('touchend', () => {
            isDragging = false;
        });
    }


    // Start fetching countries immediately
    fetchCountries();

    // Handle selection change
    select.addEventListener('change', async (e) => {
        const code = e.target.value;

        // Clear previous content
        selectedFlag.innerHTML = '';
        countryName.textContent = '';
        countryCode.textContent = '';
        flagEmoji.textContent = '';

        if (!code) {
            return;
        }

        // Add loading indicator to flag display area
        const flagLoading = document.createElement('div');
        flagLoading.textContent = 'Loading flag...';
        selectedFlag.appendChild(flagLoading);

        try {
            // Now fetch just the selected flag
            const flag = await flags.getFlag(code, { width: 300 });

            // Remove loading indicator
            selectedFlag.innerHTML = '';

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
}