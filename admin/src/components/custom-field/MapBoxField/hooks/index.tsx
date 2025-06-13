import { useFetchClient } from "@strapi/strapi/admin";
import { useEffect, useState } from "react";
import { ViewState } from "react-map-gl/mapbox";

interface MapBoxValue {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
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

export const useMapLocationHook = (initialValue?: MapBoxValue) => {
  const [viewState, setViewState] = useState<ViewState>(DEFAULT_VIEW_STATE);
  const [markerPosition, setMarkerPosition] = useState({
    longitude: DEFAULT_VIEW_STATE.longitude,
    latitude: DEFAULT_VIEW_STATE.latitude
  });

  useEffect(() => {
    if (initialValue) {
      const previousValue = initialValue;
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
  }, [initialValue]);

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