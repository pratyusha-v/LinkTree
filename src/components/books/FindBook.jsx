import { useState } from 'react';
import { FiMapPin, FiBook, FiShoppingBag, FiExternalLink, FiSearch } from 'react-icons/fi';
import '../../styles/FindBook.css';

export default function FindBook() {
  const [zipcode, setZipcode] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchLocations = async (e) => {
    e.preventDefault();
    
    // Validate zipcode
    if (!/^\d{5}$/.test(zipcode)) {
      setError('Please enter a valid 5-digit US zipcode');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    try {
      // Geocode zipcode to lat/long using Nominatim (OpenStreetMap)
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?postalcode=${zipcode}&country=US&format=json&limit=1`
      );
      const geoData = await geoResponse.json();

      if (!geoData || geoData.length === 0) {
        setError('Zipcode not found. Please try another.');
        setLoading(false);
        return;
      }

      const { lat, lon, display_name } = geoData[0];

      // Search for libraries and bookstores using Overpass API
      const radius = 5000; // 5km radius
      const overpassQuery = `
        [out:json];
        (
          node["amenity"="library"](around:${radius},${lat},${lon});
          way["amenity"="library"](around:${radius},${lat},${lon});
          node["shop"="books"](around:${radius},${lat},${lon});
          way["shop"="books"](around:${radius},${lat},${lon});
        );
        out body;
        >;
        out skel qt;
      `;

      const overpassResponse = await fetch(
        'https://overpass-api.de/api/interpreter',
        {
          method: 'POST',
          body: overpassQuery,
        }
      );

      const overpassData = await overpassResponse.json();
      
      // Process results
      const libraries = [];
      const bookstores = [];

      overpassData.elements.forEach((element) => {
        // Skip if no name and no tags (like nodes that are part of ways)
        if (!element.tags || (!element.tags.name && !element.tags.amenity && !element.tags.shop)) {
          return;
        }

        const name = element.tags?.name || element.tags?.brand || 'Unnamed location';
        
        // Build address from various fields
        const addressParts = [];
        if (element.tags?.['addr:housenumber'] || element.tags?.['addr:street']) {
          const street = [element.tags?.['addr:housenumber'], element.tags?.['addr:street']]
            .filter(Boolean)
            .join(' ');
          if (street) addressParts.push(street);
        }
        if (element.tags?.['addr:city']) addressParts.push(element.tags['addr:city']);
        if (element.tags?.['addr:state']) addressParts.push(element.tags['addr:state']);
        if (element.tags?.['addr:postcode']) addressParts.push(element.tags['addr:postcode']);
        
        // Fallback to display_name parts if no structured address
        let address = addressParts.length > 0 ? addressParts.join(', ') : '';
        if (!address && display_name) {
          // Use city/state from the geocoded location as fallback
          const locationParts = display_name.split(',').slice(0, 3).join(',');
          address = `Near ${locationParts}`;
        }
        if (!address) address = 'Address not available';

        const location = {
          name,
          address,
          lat: element.lat || element.center?.lat,
          lon: element.lon || element.center?.lon,
          phone: element.tags?.phone || element.tags?.['contact:phone'],
          website: element.tags?.website || element.tags?.['contact:website'],
        };

        // Skip if no coordinates
        if (!location.lat || !location.lon) return;

        if (element.tags?.amenity === 'library') {
          libraries.push(location);
        } else if (element.tags?.shop === 'books') {
          bookstores.push(location);
        }
      });

      setResults({
        libraries: libraries.slice(0, 5),
        bookstores: bookstores.slice(0, 5),
        zipcode,
      });
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search locations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getDirectionsUrl = (lat, lon) => {
    return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
  };

  return (
    <div className="find-book-section">
      <div className="find-book-header">
        <h2 className="section-title">
          <FiBook size={24} />
          Find a Book
        </h2>
        <p className="section-subtitle">
          Discover local libraries and bookstores near you
        </p>
      </div>

      <form onSubmit={searchLocations} className="zipcode-form">
        <div className="zipcode-input-wrapper">
          <FiMapPin className="input-icon" />
          <input
            type="text"
            placeholder="Enter US Zipcode (e.g., 90210)"
            value={zipcode}
            onChange={(e) => setZipcode(e.target.value)}
            maxLength={5}
            className="zipcode-input"
          />
          <button type="submit" className="search-button" disabled={loading}>
            {loading ? (
              <div className="spinner-small"></div>
            ) : (
              <FiSearch size={20} />
            )}
          </button>
        </div>
        {error && <p className="error-message">{error}</p>}
      </form>

      {results && (
        <div className="results-container">
          <div className="results-header">
            <FiMapPin size={18} />
            <span>Results for {results.zipcode}</span>
          </div>

          <div className="results-grid">
            {/* Libraries */}
            <div className="result-category">
              <div className="category-header">
                <FiBook size={20} />
                <h3>Libraries ({results.libraries.length})</h3>
              </div>
              {results.libraries.length === 0 ? (
                <p className="no-results">No libraries found nearby</p>
              ) : (
                <div className="location-list">
                  {results.libraries.map((lib, idx) => (
                    <div key={idx} className="location-card">
                      <h4>{lib.name}</h4>
                      <p className="location-address">{lib.address}</p>
                      {lib.phone && (
                        <p className="location-phone">📞 {lib.phone}</p>
                      )}
                      <div className="location-actions">
                        {lib.website && (
                          <a
                            href={lib.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="location-link"
                          >
                            <FiExternalLink size={14} />
                            Website
                          </a>
                        )}
                        <a
                          href={getDirectionsUrl(lib.lat, lib.lon)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="location-link"
                        >
                          <FiMapPin size={14} />
                          Directions
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bookstores */}
            <div className="result-category">
              <div className="category-header">
                <FiShoppingBag size={20} />
                <h3>Bookstores ({results.bookstores.length})</h3>
              </div>
              {results.bookstores.length === 0 ? (
                <p className="no-results">No bookstores found nearby</p>
              ) : (
                <div className="location-list">
                  {results.bookstores.map((store, idx) => (
                    <div key={idx} className="location-card">
                      <h4>{store.name}</h4>
                      <p className="location-address">{store.address}</p>
                      {store.phone && (
                        <p className="location-phone">📞 {store.phone}</p>
                      )}
                      <div className="location-actions">
                        {store.website && (
                          <a
                            href={store.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="location-link"
                          >
                            <FiExternalLink size={14} />
                            Website
                          </a>
                        )}
                        <a
                          href={getDirectionsUrl(store.lat, store.lon)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="location-link"
                        >
                          <FiMapPin size={14} />
                          Directions
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
