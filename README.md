# country-flags-svg-2x1

NPM package providing detailed SVG country flags with resizing capabilities. All flags maintain a 2:1 aspect ratio.

## Installation

```bash
npm i country-flags-svg-2x1
```

## Basic Usage

### 1. Importing the Package

```javascript
// Using require
const CountryFlags = require('country-flags-svg-2x1');

// Using ES6 import
import CountryFlags from 'country-flags-svg-2x1';
```

### 2. Creating an Instance

```javascript
const flags = new CountryFlags();
```

### 3. Getting a Flag

```javascript
// Get flag by country code (returns full flag object)
const indiaFlag = flags.getFlag('in');
console.log(indiaFlag);
// Output:
// {
//   code: "in",
//   name: "India",
//   svg: "<svg>...</svg>"
// }

// Access the SVG string
console.log(indiaFlag.svg);
```

### 4. Resizing Flags

```javascript
// Resize by width (height will automatically be width/2)
const flag1 = flags.getFlag('us', { width: 400 });  // Returns 400x200 flag

// Resize by height (width will automatically be height*2)
const flag2 = flags.getFlag('gb', { height: 300 }); // Returns 600x300 flag

// Original size (900x450)
const flag3 = flags.getFlag('jp');
```

### 5. Getting Flag as Data URL

```javascript
// Get flag as data URL (useful for <img> tags)
const dataUrl = flags.getFlagAsDataURL('jp');
console.log(dataUrl); 
// Output: data:image/svg+xml;base64,...

// Get resized flag as data URL
const resizedDataUrl = flags.getFlagAsDataURL('jp', { width: 400 });
```

### 6. Searching Flags

```javascript
// Search by country name
const results1 = flags.searchFlags('united');
// Returns array of flags for United States, United Kingdom, etc.

// Search by country code
const results2 = flags.searchFlags('us');
// Returns array with US flag data
```

### 7. Getting Flag Emoji

```javascript
// Static method - doesn't need instance
const emoji1 = CountryFlags.getFlagEmoji('us');
console.log(emoji1); // 🇺🇸

const emoji2 = CountryFlags.getFlagEmoji('in');
console.log(emoji2); // 🇮🇳
```

## Framework Examples

### Using with HTML

```html
<!DOCTYPE html>
<html>
<head>
    <title>Flag Example</title>
</head>
<body>
    <div id="flag-container"></div>

    <script type="module">
        import CountryFlags from 'country-flags-svg-2x1';
        
        const flags = new CountryFlags();
        const flagUrl = flags.getFlagAsDataURL('us', { width: 400 });
        
        const img = document.createElement('img');
        img.src = flagUrl;
        img.alt = 'US Flag';
        document.getElementById('flag-container').appendChild(img);
    </script>
</body>
</html>
```

### Using with React

```jsx
import React from 'react';
import CountryFlags from 'country-flags-svg-2x1';

// Component that displays a country flag
function Flag({ countryCode, width }) {
    const flags = new CountryFlags();
    const flagUrl = flags.getFlagAsDataURL(countryCode, { width });
    
    return (
        <img 
            src={flagUrl} 
            alt={`${countryCode} flag`}
            style={{ display: 'block' }}
        />
    );
}

// Usage
function App() {
    return (
        <div>
            <Flag countryCode="us" width={400} />
            <Flag countryCode="in" width={300} />
        </div>
    );
}
```

### Using with Vue

```vue
<template>
    <div>
        <img :src="flagUrl" :alt="countryCode + ' flag'" />
    </div>
</template>

<script>
import CountryFlags from 'country-flags-svg-2x1';

export default {
    props: {
        countryCode: String,
        width: Number
    },
    computed: {
        flagUrl() {
            const flags = new CountryFlags();
            return flags.getFlagAsDataURL(this.countryCode, { 
                width: this.width 
            });
        }
    }
}
</script>
```

## Reference

### Class: CountryFlags

#### Methods

1. `getFlag(countryCode, options?)`
   - `countryCode`: Two-letter country code (e.g., 'us', 'in')
   - `options`: Optional object with:
     - `width`: Desired width in pixels
     - `height`: Desired height in pixels
   - Returns: `{ code, name, svg }`

2. `getFlagAsDataURL(countryCode, options?)`
   - Same parameters as `getFlag()`
   - Returns: Base64 data URL string

3. `getAllFlags()`
   - Returns: Array of all flag objects

4. `searchFlags(query)`
   - `query`: Search string
   - Returns: Array of matching flag objects

#### Static Methods

1. `CountryFlags.getFlagEmoji(countryCode)`
   - Returns: Flag emoji for the country code

2. `CountryFlags.validateCountryCode(code)`
   - Returns: Boolean indicating if code is valid

## Error Handling

```javascript
const flags = new CountryFlags();

// Handle invalid country code
try {
    const flag = flags.getFlag('invalid');
    if (!flag) {
        console.log('Flag not found');
    }
} catch (error) {
    console.error('Error:', error);
}

// Validate country code before use
if (CountryFlags.validateCountryCode('us')) {
    const flag = flags.getFlag('us');
}
```

## Browser Support

This package works in all modern browsers that support SVG and Base64 encoding.

## License

MIT
