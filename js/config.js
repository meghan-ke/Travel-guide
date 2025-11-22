// Configuration and constants
export const CONFIG = {
    // Base URL only - paths and query params are added in utils.js
    COUNTRIES_API: 'https://restcountries.com/v3.1',

    // Geoapify Places API (Free: 3000 requests/day
PLACES_API: 'https://serpapi.com/search?engine=google_hotels',
PLACES_API_KEY: 'd16134f8ce879618b1b20dfb230b16fbb90d70c592361c854b39185bc7307d52', // Get free key at https://www.geoapify.com/
    
    POPULAR_DESTINATIONS: [
        'France', 'Italy', 'Japan', 'United States', 'Thailand', 
        'Spain', 'Australia', 'Brazil', 'Greece', 'Egypt'
    ]
};