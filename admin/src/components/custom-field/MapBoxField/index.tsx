import { MapBoxValue } from './types';
import { Field, JSONInput } from '@strapi/design-system';

import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  NavigationControl,
} from 'react-map-gl/mapbox';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { MapSearch, SearchResult } from './MapSearch';

import { useMapBoxSettings, useMapLocationHook } from './hooks';
import { DebugInfo } from './DebugInfo';

interface MapBoxFieldProps {
  name: string;
  onChange: (event: { target: { name: string; value: object; type: string } }) => void;
  value?: MapBoxValue;
  intlLabel?: {
    defaultMessage: string;
  };
  required?: boolean;
}

export function MapBoxField({ name, onChange, value, intlLabel, required }: MapBoxFieldProps) {
  const { get } = useFetchClient();
  const { config, isLoading, error } = useMapBoxSettings();
  const { viewState, markerPosition, setViewState, setMarkerPosition } = useMapLocationHook(value);

  const { accessToken, debugMode } = config || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const updateMarkerPosition = useCallback(
    (lng: number, lat: number, address?: string) => {
      setMarkerPosition({ longitude: lng, latitude: lat });

      const newValue = {
        longitude: lng,
        latitude: lat,
        address: address || 'Selected location',
        zoom: viewState.zoom,
        pitch: viewState.pitch,
        bearing: viewState.bearing,
      };

      onChange({ target: { name, value: newValue, type: 'json' } });
    },
    [name, onChange, setMarkerPosition, viewState.zoom, viewState.pitch, viewState.bearing]
  );

  // Debounced search as user types
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length <= 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setSearchError(null);
        const encodedQuery = encodeURIComponent(searchQuery.trim());
        const url = `/map-box/location-search/${encodedQuery}`;
        const { data } = await get(url);

        if (data.features) {
          setSearchResults(
            data.features.slice(0, 5).map((feature: any) => ({
              id: feature.id,
              place_name: feature.place_name,
              center: feature.center,
              place_type: feature.place_type,
            }))
          );
        } else if (data.error) {
          setSearchError(data.error);
          setSearchResults([]);
        } else {
          setSearchResults([]);
        }
      } catch (error) {
        console.error('Error searching location:', error);
        setSearchError(error instanceof Error ? error.message : 'An error occurred');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, get]);

  const handleSelectResult = useCallback(
    (result: SearchResult) => {
      const [longitude, latitude] = result.center;

      setViewState((prev) => ({
        ...prev,
        longitude,
        latitude,
        zoom: 14,
        transitionDuration: 1000,
      }));

      updateMarkerPosition(longitude, latitude, result.place_name);
      setSearchQuery(result.place_name.split(',')[0]);
      setSearchResults([]);
      setShowResults(false);
    },
    [setViewState, updateMarkerPosition]
  );

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
    setShowResults(false);
  }, []);

  const handleMapClick = (event: any) => {
    const { lngLat } = event;
    updateMarkerPosition(lngLat.lng, lngLat.lat);
  };

  const handleMapMove = (evt: any) => {
    setViewState(evt.viewState);
  };

  const handleMapMoveEnd = (evt: any) => {
    const { longitude, latitude, zoom, pitch, bearing } = evt.viewState;

    // Save the current view state including zoom level
    const newValue = {
      longitude: markerPosition.longitude,
      latitude: markerPosition.latitude,
      address: (value as MapBoxValue)?.address || 'Selected location',
      zoom,
      pitch,
      bearing,
    };

    onChange({ target: { name, value: newValue, type: 'json' } });
  };

  const handleMarkerDragEnd = (event: any) => {
    const { lngLat } = event;
    updateMarkerPosition(lngLat.lng, lngLat.lat);
  };

  const handlePositionChange = (input: string) => {
    try {
      const value = JSON.parse(input);
      setViewState((prev) => ({
        ...prev,
        longitude: value.longitude,
        latitude: value.latitude,
        zoom: value.zoom || prev.zoom,
        pitch: value.pitch || prev.pitch,
        bearing: value.bearing || prev.bearing,
      }));
      setMarkerPosition({
        longitude: value.longitude,
        latitude: value.latitude,
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
    address: (value as MapBoxValue)?.address || 'Selected location',
  };

  const strValue = JSON.stringify(value || finalValue, null, 2);

  if (!accessToken || isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <div style={{ position: 'relative', height: '500px', width: '100%' }}>
        <MapSearch
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          onSelectResult={handleSelectResult}
          onClear={handleClearSearch}
          showResults={showResults}
          setShowResults={setShowResults}
        />
        <Map
          {...viewState}
          onMove={handleMapMove}
          onMoveEnd={handleMapMoveEnd}
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
            color="#4945ff"
            draggable
            onDragEnd={handleMarkerDragEnd}
          />
        </Map>
      </div>
      {debugMode && (
        <Field.Root name={name} required={required}>
          <Field.Label>{intlLabel?.defaultMessage ?? 'Location'}</Field.Label>
          <JSONInput value={strValue} onChange={handlePositionChange}></JSONInput>
          <Field.Error />
          <Field.Hint />
        </Field.Root>
      )}

      {debugMode && (
        <DebugInfo
          viewState={viewState}
          searchResults={searchResults}
          searchError={searchError}
          markerPosition={markerPosition}
          searchQuery={searchQuery}
          value={value}
        />
      )}
    </div>
  );
}
