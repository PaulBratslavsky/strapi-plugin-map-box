import { MapBoxValue } from './types';
import { Field, JSONInput } from '@strapi/design-system';

import Map, {
  FullscreenControl,
  GeolocateControl,
  Marker,
  NavigationControl,
} from 'react-map-gl/mapbox';

import 'mapbox-gl/dist/mapbox-gl.css';
import { useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';
import { MapSearch } from './MapSearch';

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

// #endregion

export function MapBoxField({ name, onChange, value, intlLabel, required }: MapBoxFieldProps) {
  const { get } = useFetchClient();
  const { config, isLoading, error } = useMapBoxSettings();
  const { viewState, markerPosition, setViewState, setMarkerPosition } = useMapLocationHook(value);

  const { accessToken, debugMode } = config || {};

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchError, setSearchError] = useState<string | null>(null);

  const updateMarkerPosition = (lng: number, lat: number, address?: string) => {
    setMarkerPosition({ longitude: lng, latitude: lat });

    // Update the JSON value with all necessary data
    const newValue = {
      longitude: lng,
      latitude: lat,
      address: address || 'Selected location',
      zoom: viewState.zoom,
      pitch: viewState.pitch,
      bearing: viewState.bearing,
    };

    onChange({ target: { name, value: newValue, type: 'json' } });
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      setSearchError(null);
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      const url = `/map-box/location-search/${encodedQuery}`;
      const { data } = await get(url);

      setSearchResults(data);

      if (data.features && data.features[0]) {
        const [longitude, latitude] = data.features[0].center;
        // Update both the view and marker position
        setViewState((prev) => ({
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
          onSearch={handleSearch}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          handleKeyDown={handleKeyDown}
        />
        <Map
          {...viewState}
          onMove={handleMapMove}
          onClick={handleMapClick}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          // mapStyle="mapbox://styles/mapbox/light-v11"
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
