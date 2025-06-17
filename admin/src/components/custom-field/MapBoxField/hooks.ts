import { type MapBoxValue, type ViewState, DEFAULT_VIEW_STATE } from './types';

import { useEffect, useState } from 'react';
import { useFetchClient } from '@strapi/strapi/admin';

type config = {
  accessToken: string;
  debugMode: boolean;
};

export const useMapBoxSettings = () => {
  const { get } = useFetchClient();
  const [config, setConfig] = useState<config | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoading(true);
        const { data } = await get('/strapi-plugin-map-box/get-settings');
        console.log('data from getSettings', data);
        setConfig(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch MapBox settings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return { config, isLoading, error };
};

export const useMapLocationHook = (initialValue?: MapBoxValue) => {
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);
  const [markerPosition, setMarkerPosition] = useState({
    longitude: DEFAULT_VIEW_STATE.longitude,
    latitude: DEFAULT_VIEW_STATE.latitude,
  });

  useEffect(() => {
    if (initialValue) {
      console.log('Initializing from previous value:', initialValue);
      const previousValue = initialValue as MapBoxValue;

      setViewState((prev) => ({
        ...prev,
        longitude: previousValue.longitude,
        latitude: previousValue.latitude,
        zoom: previousValue.zoom,
        pitch: previousValue.pitch,
        bearing: previousValue.bearing,
      }));

      setMarkerPosition({
        longitude: previousValue.longitude,
        latitude: previousValue.latitude,
      });
    }
  }, []);

  return { viewState, setViewState, markerPosition, setMarkerPosition };
};

export const useLocationService = () => {
  const { get } = useFetchClient();
  const [searchError, setSearchError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<any>(null);

  const searchLocation = async (query: string) => {
    try {
      setSearchError(null);
      const encodedQuery = encodeURIComponent(query.trim());
      const { data } = await get(`/strapi-plugin-map-box/location-search/${encodedQuery}`);
      setSearchResults(data);
      return data;
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : 'An error occurred');
      return null;
    }
  };

  return { searchLocation, searchError, searchResults };
};
