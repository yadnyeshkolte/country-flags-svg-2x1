
(function createFlagDemo() {
    // Create and inject required CSS
    const style = document.createElement('style');
    style.textContent = `
    .demo-container {
      max-width: 100%;
      margin: 0 auto;
      padding: 2rem;
    }

    .demo-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .demo-header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
      color: #333;
    }

    .demo-subtitle {
      color: #666;
      font-size: 1.1rem;
    }

    .search-container {
      max-width: 500px;
      margin: 0 auto 2rem;
    }

    .search-input {
      width: 100%;
      padding: 0.8rem 1rem;
      font-size: 1rem;
      border: 2px solid #ddd;
      border-radius: 8px;
      transition: border-color 0.3s ease;
    }

    .search-input:focus {
      outline: none;
      border-color: #666;
    }

    .selected-flag-container {
      background: #fff;
      border: 2px solid #ddd;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .selected-flag-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1rem;
    }

    .selected-flag-header h2 {
      font-size: 1.5rem;
      margin: 0;
    }

    .country-code {
      color: #666;
    }

    .selected-flag-svg {
      width: 50%;
      max-width: 100%;
      margin: 0 auto;
      height: 300px;
    }

    .selected-flag-svg svg {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .flags-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .flag-card {
      background: #fff;
      border: 2px solid #ddd;
      border-radius: 8px;
      padding: 1rem;
      cursor: pointer;
      transition: transform 0.3s ease, border-color 0.3s ease;
    }

    .flag-card:hover {
      transform: translateY(-5px);
      border-color: #666;
    }

    .flag-svg {
      width: 100%;
      height: 150px;
      margin-bottom: 1rem;
    }

    .flag-svg svg {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .flag-info {
      text-align: center;
    }

    .flag-name {
      font-weight: bold;
      margin: 0 0 0.5rem 0;
    }

    .flag-code {
      color: #666;
      margin: 0;
    }

    .mode-indicator {
      text-align: center;
      margin-top: 2rem;
      color: #666;
    }

    @media (max-width: 768px) {
      .demo-container {
        padding: 1rem;
      }

      .demo-header h1 {
        font-size: 2rem;
      }

      .flags-grid {
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
      }

      .selected-flag-header {
        flex-direction: column;
        text-align: center;
      }

      .selected-flag-header h2 {
        margin-bottom: 0.5rem;
      }
    }
  `;
    document.head.appendChild(style);

    // Create HTML structure
    const container = document.createElement('div');
    container.className = 'demo-container';
    container.innerHTML = `
    <div class="demo-header">
      <h1>Country Flags Demo</h1>
      <p class="demo-subtitle">Explore flags and country information using country-flags-svg-2x1</p>
    </div>
    <div class="search-container">
      <input type="text" placeholder="Search for a country..." class="search-input">
    </div>
    <div id="selected-flag"></div>
    <div class="flags-grid"></div>
    <div class="mode-indicator"></div>
  `;
    document.body.appendChild(container);

    // Initialize state
    let flags = [];
    let selectedFlag = null;
    let searchTerm = '';
    let mode = 'all';

    // Get DOM elements
    const searchInput = container.querySelector('.search-input');
    const selectedFlagContainer = container.querySelector('#selected-flag');
    const flagsGrid = container.querySelector('.flags-grid');
    const modeIndicator = container.querySelector('.mode-indicator');

    // Load flags
    async function loadFlags() {
        const CountryFlags = window.CountryFlags;
        if (!CountryFlags) {
            console.error('CountryFlags library not found. Make sure to include the library script.');
            return;
        }

        const flagsInstance = new CountryFlags();

        if (searchTerm.trim()) {
            flags = await flagsInstance.searchFlags(searchTerm);
            mode = 'search';
        } else {
            flags = (await flagsInstance.getAllFlags()).slice(0, 12);
            mode = 'all';
        }

        renderFlags();
        updateModeIndicator();
    }

    // Render functions
    function renderSelectedFlag() {
        if (!selectedFlag) {
            selectedFlagContainer.innerHTML = '';
            return;
        }

        selectedFlagContainer.innerHTML = `
      <div class="selected-flag-container">
        <div class="selected-flag-header">
          <h2>${selectedFlag.name} ${CountryFlags.getFlagEmoji(selectedFlag.code)}</h2>
          <span class="country-code">Code: ${selectedFlag.code.toUpperCase()}</span>
        </div>
        <div class="selected-flag-svg">${selectedFlag.svg}</div>
      </div>
    `;
    }

    function renderFlags() {
        flagsGrid.innerHTML = flags.map(flag => `
      <div class="flag-card" data-code="${flag.code}">
        <div class="flag-svg">${flag.svg}</div>
        <div class="flag-info">
          <p class="flag-name">${flag.name}</p>
          <p class="flag-code">${flag.code.toUpperCase()} ${CountryFlags.getFlagEmoji(flag.code)}</p>
        </div>
      </div>
    `).join('');
    }

    function updateModeIndicator() {
        modeIndicator.innerHTML = mode === 'search'
            ? `<p>Showing search results for "${searchTerm}"</p>`
            : '<p>Showing first 12 flags. Use search to explore more!</p>';
    }

    // Event listeners
    searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        loadFlags();
    });

    flagsGrid.addEventListener('click', (e) => {
        const flagCard = e.target.closest('.flag-card');
        if (!flagCard) return;

        const code = flagCard.dataset.code;
        selectedFlag = flags.find(f => f.code === code);
        renderSelectedFlag();
    });

    // Initial load
    loadFlags();
})();