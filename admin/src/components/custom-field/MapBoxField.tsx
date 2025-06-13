import { useEffect } from 'react';
import { Field, JSONInput } from '@strapi/design-system';
import Map, { FullscreenControl, GeolocateControl, Marker, NavigationControl } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';


// #region Types and Styles
interface MapBoxValue {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  address: string;
}

interface MapBoxFieldProps {
  name: string;
  onChange: (event: { target: { name: string; value: object; type: string } }) => void;
  value?: MapBoxValue;
  intlLabel?: {
    defaultMessage: string;
  };
  required?: boolean;
}

interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  padding: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

const DEFAULT_VIEW_STATE: ViewState = {
  longitude: -122.4194,
  latitude: 37.7749,
  zoom: 13,
  pitch: 0,
  bearing: 0,
  padding: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
};
// #endregion


export function MapBoxField({ name, onChange, value, intlLabel, required }: MapBoxFieldProps) {
  const { get } = useFetchClient();
  
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);
  const [markerPosition, setMarkerPosition] = useState({
    longitude: DEFAULT_VIEW_STATE.longitude,
    latitude: DEFAULT_VIEW_STATE.latitude
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Initialize from previous value if it exists
  useEffect(() => {
    if (value) {
      console.log('Initializing from previous value:', value);
      const previousValue = value as MapBoxValue;
      
      setViewState(prev => ({
        ...prev,
        longitude: previousValue.longitude,
        latitude: previousValue.latitude,
        zoom: previousValue.zoom,
        pitch: previousValue.pitch,
        bearing: previousValue.bearing
      }));

      setMarkerPosition({
        longitude: previousValue.longitude,
        latitude: previousValue.latitude
      });
    }
  }, [value]);

  useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await get('/strapi-plugin-map-box/get-settings');
      console.log('Settings:', data);
      setAccessToken(data.accessToken);
    };
    fetchSettings();
  }, []);

  const updateMarkerPosition = (lng: number, lat: number, address?: string) => {
    setMarkerPosition({ longitude: lng, latitude: lat });
    
    // Update the JSON value with all necessary data
    const newValue = {
      longitude: lng,
      latitude: lat,
      address: address || 'Selected location',
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing
    };
    
    console.log('Updating JSON value:', newValue);
    onChange({ target: { name, value: newValue, type: 'json' } });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchError(null);
      console.log('Searching for:', searchQuery);
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      console.log('Encoded query:', encodedQuery);
      const url = `/strapi-plugin-map-box/location-search/${encodedQuery}`;
      console.log('Request URL:', url);
      
      const { data } = await get(url);
      console.log('Response data:', data);

      setSearchResults(data);
      
      if (data.features && data.features[0]) {
        const [longitude, latitude] = data.features[0].center;
        // Update both the view and marker position
        setViewState(prev => ({
          ...prev,
          longitude,
          latitude,
          zoom: 14,
          transitionDuration: 1000,
        }));
        updateMarkerPosition(longitude, latitude, data.features[0].place_name);
      } else if (data.error) {
        setSearchError(data.error);
      } else {
        setSearchError('No results found');
      }
    } catch (error) {
      console.error('Error searching location:', error);
      setSearchError(error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleMapClick = (event: any) => {
    const { lngLat } = event;
    updateMarkerPosition(lngLat.lng, lngLat.lat);
  };

  const handleMapMove = (evt: any) => {
    setViewState(evt.viewState);
  };

  const handleMarkerDragEnd = (event: any) => {
    const { lngLat } = event;
    updateMarkerPosition(lngLat.lng, lngLat.lat);
  };

  const handlePositionChange = (input: string) => {
    try {
      const value = JSON.parse(input);
      setViewState(prev => ({
        ...prev,
        longitude: value.longitude,
        latitude: value.latitude,
        zoom: value.zoom || prev.zoom,
        pitch: value.pitch || prev.pitch,
        bearing: value.bearing || prev.bearing
      }));
      setMarkerPosition({
        longitude: value.longitude,
        latitude: value.latitude
      });
      onChange({ target: { name, value, type: 'json' } });
    } catch {
      // Handle invalid JSON
    }
  };

  // Construct the final JSON value to be saved
  const finalValue: MapBoxValue = {
    longitude: markerPosition.longitude,
    latitude: markerPosition.latitude,
    zoom: viewState.zoom,
    pitch: viewState.pitch,
    bearing: viewState.bearing,
    address: (value as MapBoxValue)?.address || 'Selected location'
  };

  const strValue = JSON.stringify(value || finalValue, null, 2);

  if (!accessToken) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ position: 'relative', height: '500px', width: '100%' }}>
        <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                console.log('Input changed:', e.target.value);
                setSearchQuery(e.target.value);
              }}
              onKeyDown={handleKeyDown}
              placeholder="Search for a location..."
              style={{
                padding: '8px 12px',
                borderRadius: '4px',
                border: '1px solid #ccc',
                width: '250px',
                fontSize: '14px'
              }}
            />
            <button
              type="button"
              onClick={handleSearch}
              style={{
                padding: '8px 16px',
                backgroundColor: '#4945ff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Search
            </button>
          </div>
        </div>
        <Map
          {...viewState}
          onMove={handleMapMove}
          onClick={handleMapClick}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          mapboxAccessToken={accessToken}
          attributionControl={false}
          style={{ height: '100%', width: '100%' }}
        >
          <FullscreenControl />
          <NavigationControl />
          <GeolocateControl />
          <Marker 
            longitude={markerPosition.longitude} 
            latitude={markerPosition.latitude} 
            color="#ff5200"
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        </Map>
      </div>
      <Field.Root name={name} required={required}>
        <Field.Label>{intlLabel?.defaultMessage ?? 'Location'}</Field.Label>
        <JSONInput value={strValue} onChange={handlePositionChange}></JSONInput>
        <Field.Error />
        <Field.Hint />
      </Field.Root>
      <div style={{ marginTop: '20px' }}>
        <h4>Debug Information:</h4>
        <div style={{ marginBottom: '10px' }}>
          <strong>Search Results:</strong>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {searchResults ? JSON.stringify(searchResults, null, 2) : 'No search results yet'}
          </pre>
        </div>
        {searchError && (
          <div style={{ color: 'red', marginBottom: '10px' }}>
            <strong>Error:</strong> {searchError}
          </div>
        )}
        <div>
          <strong>Current View State:</strong>
          <pre style={{ 
            background: '#f5f5f5', 
            padding: '10px', 
            borderRadius: '4px',
            maxHeight: '200px',
            overflow: 'auto'
          }}>
            {JSON.stringify(viewState, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
