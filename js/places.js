import { CONFIG } from './config.js';

// Places functionality
class Places {
    // Fetch places (restaurants and hotels) for a city
    static async fetchPlaces(cityName, lat, lon) {
        try {
            const results = {};
            
            // If we don't have coordinates, use text search with city name
            // Geoapify Places API expects free-text queries via `text=` (not `name=`)
            const searchParam = (lat && lon)
                ? `filter=circle:${lon},${lat},5000`
                : `text=${encodeURIComponent(cityName)}`;
            // Fetch restaurant
            try {
                const restaurantUrl = `${CONFIG.PLACES_API}?categories=catering.restaurant&${searchParam}&limit=1&apiKey=${CONFIG.PLACES_API_KEY}`;
                console.log('Places restaurant URL:', restaurantUrl);
                const restaurantResponse = await fetch(restaurantUrl);
                if (restaurantResponse.ok) {
                    const restaurantData = await restaurantResponse.json();
                    if (restaurantData.features && restaurantData.features.length > 0) {
                        const place = restaurantData.features[0].properties;
                        results.restaurant = {
                            name: place.name || 'Local Restaurant',
                            address: place.address_line2 || place.street || 'Address not available',
                            category: place.categories?.[0] || 'Restaurant'
                        };
                    }
                } else {
                    let body = '';
                    try { body = await restaurantResponse.text(); } catch (e) { body = '<unreadable>'; }
                    console.error('Places restaurant fetch failed:', restaurantResponse.status, restaurantResponse.statusText, body);
                    // Retry with a simpler text-only query (helps diagnose param-related 400s)
                    try {
                        const fallbackUrl = `${CONFIG.PLACES_API}?text=${encodeURIComponent(cityName)}&limit=1&apiKey=${CONFIG.PLACES_API_KEY}`;
                        console.log('Retrying restaurant with fallback URL:', fallbackUrl);
                        const fbResp = await fetch(fallbackUrl);
                        if (fbResp.ok) {
                            const fbData = await fbResp.json();
                            if (fbData.features && fbData.features.length > 0) {
                                const place = fbData.features[0].properties;
                                results.restaurant = {
                                    name: place.name || 'Local Restaurant',
                                    address: place.address_line2 || place.street || 'Address not available',
                                    category: place.categories?.[0] || 'Restaurant'
                                };
                            }
                        } else {
                            let fbBody = '';
                            try { fbBody = await fbResp.text(); } catch (e) { fbBody = '<unreadable>'; }
                            console.error('Fallback restaurant fetch also failed:', fbResp.status, fbResp.statusText, fbBody);
                        }
                    } catch (fbErr) {
                        console.error('Fallback restaurant fetch error:', fbErr);
                    }
                }
            } catch (e) {
                console.log('Could not fetch restaurant:', e);
            }

            // Fetch hotel
            try {
                const hotelUrl = `${CONFIG.PLACES_API}?categories=accommodation.hotel&${searchParam}&limit=1&apiKey=${CONFIG.PLACES_API_KEY}`;
                console.log('Places hotel URL:', hotelUrl);
                const hotelResponse = await fetch(hotelUrl);
                if (hotelResponse.ok) {
                    const hotelData = await hotelResponse.json();
                    if (hotelData.features && hotelData.features.length > 0) {
                        const place = hotelData.features[0].properties;
                        results.hotel = {
                            name: place.name || 'Local Hotel',
                            address: place.address_line2 || place.street || 'Address not available',
                            category: place.categories?.[0] || 'Hotel'
                        };
                    }
                } else {
                    let body = '';
                    try { body = await hotelResponse.text(); } catch (e) { body = '<unreadable>'; }
                    console.error('Places hotel fetch failed:', hotelResponse.status, hotelResponse.statusText, body);
                    // Retry with a simpler text-only query
                    try {
                        const fallbackUrl = `${CONFIG.PLACES_API}?text=${encodeURIComponent(cityName)}&limit=1&apiKey=${CONFIG.PLACES_API_KEY}`;
                        console.log('Retrying hotel with fallback URL:', fallbackUrl);
                        const fbResp = await fetch(fallbackUrl);
                        if (fbResp.ok) {
                            const fbData = await fbResp.json();
                            if (fbData.features && fbData.features.length > 0) {
                                const place = fbData.features[0].properties;
                                results.hotel = {
                                    name: place.name || 'Local Hotel',
                                    address: place.address_line2 || place.street || 'Address not available',
                                    category: place.categories?.[0] || 'Hotel'
                                };
                            }
                        } else {
                            let fbBody = '';
                            try { fbBody = await fbResp.text(); } catch (e) { fbBody = '<unreadable>'; }
                            console.error('Fallback hotel fetch also failed:', fbResp.status, fbResp.statusText, fbBody);
                        }
                    } catch (fbErr) {
                        console.error('Fallback hotel fetch error:', fbErr);
                    }
                }
            } catch (e) {
                console.log('Could not fetch hotel:', e);
            }

            return results;
        } catch (error) {
            console.error(`Error fetching places for ${cityName}:`, error);
            return {};
        }
    }

    // Display places in the UI
    static async displayPlaces(cityName, lat, lon, elementId = 'placesInfo') {
        const placesElement = document.getElementById(elementId);
        
        if (!placesElement) {
            console.warn('Places element not found:', elementId);
            return;
        }

        try {
            const places = await this.fetchPlaces(cityName, lat, lon);
            
            let html = '';
            
            if (places.restaurant) {
                html += `
                    <div class="place-item">
                        <h4> Featured Restaurant</h4>
                        <p><strong>${places.restaurant.name}</strong></p>
                        <p>${places.restaurant.address}</p>
                    </div>
                `;
            }
            
            if (places.hotel) {
                html += `
                    <div class="place-item">
                        <h4> Featured Hotel</h4>
                        <p><strong>${places.hotel.name}</strong></p>
                        <p>${places.hotel.address}</p>
                    </div>
                `;
            }
            
            if (!places.restaurant && !places.hotel) {
                html = '<p>Popular places information not available</p>';
            }
            
            placesElement.innerHTML = html;
            
        } catch (error) {
            console.error('Error loading places:', error);
            placesElement.innerHTML = '<p>Could not load popular places</p>';
        }
    }
}

export { Places };