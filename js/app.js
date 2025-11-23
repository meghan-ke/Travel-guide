import { CONFIG } from './config.js';
import { Utils } from './utils.js';

class TravelHubApp {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.init();
    }

    // Detect current page
    detectCurrentPage() {
        const path = window.location.pathname;
        if (path.includes('country.html')) return 'country';
        if (path.includes('countries.html')) return 'countries';
        return 'home';
    }

    // Initialize app
    async init() {
        this.setupNavigation();
        
        switch (this.currentPage) {
            case 'home':
                await this.initHomepage();
                break;
            case 'countries':
                await this.initCountriesPage();
                break;
            case 'country':
                await this.initCountryPage();
                break;
        }
    }

    // Setup mobile navigation
    setupNavigation() {
        const hamburger = document.getElementById('hamburger');
        const navMenu = document.getElementById('navMenu');
        
        if (hamburger && navMenu) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }
    }

    // Homepage functionality
    async initHomepage() {
        const popularCountriesGrid = document.getElementById('popularCountriesGrid');
        if (!popularCountriesGrid) return;

        try {
            const allCountries = await Utils.fetchAllCountries();
            const popularCountries = Utils.getPopularCountries(allCountries);
            
            this.displayCountries(popularCountries, popularCountriesGrid, false);
            
        } catch (error) {
            console.error('Error loading homepage:', error);
            popularCountriesGrid.innerHTML = '<p>Failed to load countries. Please try again later.</p>';
        }
    }

    // Countries page functionality
    async initCountriesPage() {
        const countriesGrid = document.getElementById('countriesGrid');
        const searchInput = document.getElementById('countrySearch');
        const searchButton = document.getElementById('searchButton');
        
        if (!countriesGrid) return;

        this.allCountries = [];
        
        // Load all countries initially
        await this.loadAllCountries();
        
        // Setup search functionality
        if (searchInput) {
            const debouncedSearch = Utils.debounce((event) => {
                this.handleSearch(event.target.value);
            }, 300);
            
            searchInput.addEventListener('input', debouncedSearch);
            
            searchInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    this.handleSearch(searchInput.value);
                }
            });
        }
        
        if (searchButton) {
            searchButton.addEventListener('click', () => {
                this.handleSearch(searchInput.value);
            });
        }
    }

    // Country details page functionality
    async initCountryPage() {
        const countryDetailsContainer = document.getElementById('countryDetailsContainer');
        if (!countryDetailsContainer) return;

        const countryName = this.getCountryNameFromURL();
        if (!countryName) {
            this.showCountryError('No country specified');
            return;
        }
        // Load all countries first to have the data cached
        if (!this.allCountries || this.allCountries.length === 0) {
            try {
                 console.log('Loading all countries for cache...');
                 this.allCountries = await Utils.fetchAllCountries();
            } catch (error) {
                 console.warn('Could not load countries:', error);
            }
       }

        await this.loadCountryDetails(countryName);
    }

    // Load all countries for countries page
    async loadAllCountries() {
        const countriesGrid = document.getElementById('countriesGrid');
        if (!countriesGrid) return;

        try {
            this.allCountries = await Utils.fetchAllCountries();
            console.log('Loaded countries:', this.allCountries.length);
            
            const sortedCountries = Utils.sortCountriesAlphabetically(this.allCountries);
            this.displayCountries(sortedCountries, countriesGrid, true);
            
        } catch (error) {
            console.error('Error loading countries:', error);
            countriesGrid.innerHTML = '<p>Failed to load countries. Please try again later.</p>';
        }
    }

    // Handle search on countries page - FULLY FIXED
    async handleSearch(query) {
        const countriesGrid = document.getElementById('countriesGrid');
        if (!countriesGrid || !this.allCountries) return;

        const searchTerm = query.trim();
        
        if (!searchTerm) {
            const sortedCountries = Utils.sortCountriesAlphabetically(this.allCountries);
            this.displayCountries(sortedCountries, countriesGrid, true);
            return;
        }

        const filteredCountries = this.allCountries.filter(country => {
            try {
                const lowerQuery = searchTerm.toLowerCase();
                
                // Safely get country name
                const countryName = country?.name?.common ? 
                    country.name.common.toLowerCase() : '';
                
                // Safely get capital - it's an array, so check if it exists and has elements
                const capital = (country?.capital && Array.isArray(country.capital) && country.capital.length > 0) ? 
                    country.capital[0].toLowerCase() : '';
                
                // Safely get region
                const region = country?.region ? 
                    country.region.toLowerCase() : '';
                
                return (
                    countryName.includes(lowerQuery) ||
                    capital.includes(lowerQuery) ||
                    region.includes(lowerQuery)
                );
            } catch (error) {
                console.error('Error filtering country:', country, error);
                return false;
            }
        });

        if (filteredCountries.length > 0) {
            this.displayCountries(filteredCountries, countriesGrid, true);
        } else {
            countriesGrid.innerHTML = '<p>No countries found matching your search</p>';
        }
    }

    // Load country details for country page
    async loadCountryDetails(countryName) {
    const container = document.getElementById('countryDetailsContainer');
    
    try {
        // FIRST: Try to find in cached data if we have it
        if (this.allCountries && this.allCountries.length > 0) {
            const country = this.allCountries.find(c => 
                c?.name?.common?.toLowerCase() === countryName.toLowerCase()
            );
            
            if (country) {
                console.log('Using cached country data');
                this.displayCountryDetails(country);
                return; // Exit here - no API call needed!
            }
        }
        
        // SECOND: Only if not in cache, try API (this might timeout)
        console.log('Country not in cache, fetching from API...');
        const countries = await Utils.fetchCountriesByName(countryName);
        if (!countries || countries.length === 0) {
            throw new Error('Country not found');
        }
        
        const country = countries[0];
        this.displayCountryDetails(country);
        
    } catch (error) {
        console.error('Error loading country details:', error);
        this.showCountryError('Failed to load country details. Please try again or go back to countries list.');
    }
}

    // Display countries in grid
    displayCountries(countries, container, showLinks = false) {
        container.innerHTML = countries.map(country => 
            Utils.createCountryCard(country, showLinks)
        ).join('');
    }

    // Display country details
    displayCountryDetails(country) {
        const container = document.getElementById('countryDetailsContainer');
        
        // Safely extract data
        const countryName = country?.name?.common || 'Unknown';
        const officialName = country?.name?.official || countryName;
        const flagUrl = country?.flags?.png || country?.flags?.svg || '';
        const capital = (country?.capital && country.capital.length > 0) ? country.capital[0] : 'N/A';
        const region = country?.region || 'N/A';
        const population = country?.population ? country.population.toLocaleString() : 'N/A';
        const area = country?.area ? country.area.toLocaleString() + ' km²' : 'N/A';
        const timezone = (country?.timezones && country.timezones.length > 0) ? country.timezones[0] : 'N/A';
        
        // Safely get currencies
        let currencyText = 'N/A';
        if (country?.currencies) {
            try {
                currencyText = Object.values(country.currencies).map(c => c.name).join(', ');
            } catch (e) {
                currencyText = 'N/A';
            }
        }
        
        // Safely get languages
        let languagesHTML = 'N/A';
        if (country?.languages) {
            try {
                languagesHTML = Object.values(country.languages).map(lang => 
                    `<span class="language-tag">${lang}</span>`
                ).join('');
            } catch (e) {
                languagesHTML = 'N/A';
            }
        }
        
        // Get coordinates for places API
        const lat = country?.latlng?.[0];
        const lon = country?.latlng?.[1];
        console.log('Coordinates for places:', lat, lon);

        console.log('Full country object:', country);
        console.log('latlng:', country?.latlng);
        console.log('capitalInfo:', country?.capitalInfo);
        console.log('All keys:', Object.keys(country));

        // seeing what we get from the api 
        //console.log('Full country object:', country);
        //console.log('capitalInfo:', country?.capitalInfo);

        container.innerHTML = `
            <div class="country-detail-card">
                <div class="country-header">
                    <div class="country-flag-large">
                        <img src="${flagUrl}" alt="${countryName} flag" onerror="this.style.display='none'">
                    </div>
                    <div class="country-basic-info">
                        <h1>${countryName}</h1>
                        <p class="country-official-name">${officialName}</p>
                        <div class="country-meta">
                            <span class="meta-item">
                                <strong>Capital:</strong> ${capital}
                            </span>
                            <span class="meta-item">
                                <strong>Region:</strong> ${region}
                            </span>
                            <span class="meta-item">
                                <strong>Population:</strong> ${population}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="country-details-grid">
                    <div class="detail-section">
                        <h3>General Information</h3>
                        <div class="detail-item">
                            <strong>Area:</strong> ${area}
                        </div>
                        <div class="detail-item">
                            <strong>Timezone:</strong> ${timezone}
                        </div>
                        <div class="detail-item">
                            <strong>Currency:</strong> ${currencyText}
                        </div>
                    </div>

                    <div class="detail-section">
                        <h3>Languages</h3>
                        <div class="languages-list">
                            ${languagesHTML}
                        </div>
                    </div>
                        <div class="detail-section">
                            <h3>Country Summary</h3>
                            <div id="wikiSummary" class="wiki-summary">
                                <p>Loading summary...</p>
                            </div>
                        </div>
                </div>

                <div class="action-buttons">
                    <a href="countries.html" class="btn btn-secondary">Back to Countries</a>
                </div>
            </div>
        `;
        // Load a short Wikipedia summary for the country or capital
        const summaryTarget = document.getElementById('wikiSummary');
        if (summaryTarget) {
            const preferredTitle = (capital && capital !== 'N/A') ? capital : countryName;
            Utils.fetchWikipediaSummary(preferredTitle).then(data => {
                if (!data) {
                    summaryTarget.innerHTML = '<p>Summary not available.</p>';
                    return;
                }
                const { extract, thumbnail, pageUrl } = data;
                summaryTarget.innerHTML = `
                    <div class="wiki-card">
                        ${thumbnail ? `<img src="${thumbnail}" alt="${preferredTitle} thumbnail" class="wiki-thumb">` : ''}
                        <div class="wiki-text">
                            <p>${extract}</p>
                            <p><a href="${pageUrl}" target="_blank" rel="noopener">Read more on Wikipedia</a></p>
                        </div>
                    </div>
                `;
            }).catch(err => {
                console.error('Error fetching wiki summary:', err);
                summaryTarget.innerHTML = '<p>Summary not available.</p>';
            });
        }
    }

    // Get country name from URL
    getCountryNameFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('name');
    }

    // Show error on country page
    showCountryError(message) {
        const container = document.getElementById('countryDetailsContainer');
        container.innerHTML = `
            <div class="error-state">
                <h2>${message}</h2>
                <a href="countries.html" class="btn btn-primary">Back to Countries</a>
            </div>
        `;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TravelHubApp();
});