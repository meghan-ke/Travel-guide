import { CONFIG } from './config.js';

// Utility functions
class Utils {
    // Fetch all countries
    static async fetchAllCountries() {
        try {
            // Expect CONFIG.COUNTRIES_API to be the REST Countries base (e.g. https://restcountries.com/v3.1)
            // Request only the fields our app needs to avoid providers that require a 'fields' query
            const FIELDS = [
                'name', 'capital', 'population', 'region', 'flags', 'cca3', 'area', 'timezones', 'currencies', 'languages'
            ].join(',');

            const response = await fetch(`${CONFIG.COUNTRIES_API}/all?fields=${encodeURIComponent(FIELDS)}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) {
                // capture response body for diagnostics (may be text or JSON)
                let bodyText = '';
                try { bodyText = await response.text(); } catch (e) { bodyText = '<unreadable response body>'; }
                console.error('REST Countries returned non-OK:', response.status, response.statusText, bodyText);
                throw new Error(`Failed to fetch countries: ${response.status} ${response.statusText}`);
            }

            const json = await response.json();
            // REST Countries returns an array; return it directly
            if (Array.isArray(json)) return json;
            // If API returns an object with data array, unwrap it
            if (json && Array.isArray(json.data)) return json.data;
            // Unknown shape — return empty array to avoid runtime errors
            console.error('Unexpected countries response shape', json);
            return [];
        } catch (error) {
            console.error('Error fetching countries:', error);
            throw error;
        }
    }

    // Fetch countries by name
    static async fetchCountriesByName(name) {
        try {
            const FIELDS = [
                'name', 'capital', 'population', 'region', 'flags', 'cca3', 'area', 'timezones', 'currencies', 'languages'
            ].join(',');

            const response = await fetch(`${CONFIG.COUNTRIES_API}/name/${encodeURIComponent(name)}?fields=${encodeURIComponent(FIELDS)}`, {
                method: 'GET',
                headers: { 'Accept': 'application/json' }
            });
            if (!response.ok) {
                let bodyText = '';
                try { bodyText = await response.text(); } catch (e) { bodyText = '<unreadable response body>'; }
                console.error('REST Countries (name) returned non-OK:', response.status, response.statusText, bodyText);
                throw new Error('Country not found');
            }
            const json = await response.json();
            if (Array.isArray(json)) return json;
            if (json && Array.isArray(json.data)) return json.data;
            return [];
        } catch (error) {
            console.error('Error searching countries:', error);
            throw error;
        }
    }

    // Fetch weather for a city
    static async fetchWeather(cityName) {
        try {
            const response = await fetch(
                `${CONFIG.WEATHER_API}?q=${cityName}&appid=${CONFIG.WEATHER_API_KEY}&units=metric`
            );
            if (!response.ok) throw new Error('Weather data not available');
            return await response.json();
        } catch (error) {
            console.error(`Error fetching weather for ${cityName}:`, error);
            throw error;
        }
    }

    // Get popular countries
    static getPopularCountries(allCountries) {
        return allCountries.filter(country => 
            CONFIG.POPULAR_DESTINATIONS.includes(country.name.common)
        );
    }

    // Sort countries alphabetically
    static sortCountriesAlphabetically(countries) {
        return countries.sort((a, b) => a.name.common.localeCompare(b.name.common));
    }

    // Create country card HTML
    static createCountryCard(country, showLink = false) {
        const countryId = country.name.common.replace(/\s+/g, '-');
        
        return `
            <div class="country-card">
                <div class="country-flag">
                    <img src="${country.flags.png}" alt="${country.name.common} flag">
                </div>
                <div class="country-info">
                    <h3>${showLink ? 
                        `<a href="country.html?name=${encodeURIComponent(country.name.common)}" class="country-link">${country.name.common}</a>` : 
                        country.name.common}
                    </h3>
                    <p><strong>Capital:</strong> ${country.capital ? country.capital[0] : 'N/A'}</p>
                    <p><strong>Population:</strong> ${country.population.toLocaleString()}</p>
                    <p><strong>Languages:</strong> ${country.languages ? Object.values(country.languages).join(', ') : 'N/A'}</p>
                    <div class="weather-info" id="weather-${countryId}">
                        <p>Loading weather...</p>
                    </div>
                </div>
            </div>
        `;
    }

    // Debounce function
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
}

export { Utils };