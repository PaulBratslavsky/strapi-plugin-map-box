import type { Core } from '@strapi/strapi';

export interface MapboxFeature {
  id: string;
  type: string;
  place_type: string[];
  relevance: number;
  properties: {
    mapbox_id: string;
    wikidata?: string;
  };
  text: string;
  place_name: string;
  center: [number, number];
  geometry: {
    type: string;
    coordinates: [number, number];
  };
}

export interface MapboxResponse {
  type: string;
  query: string[];
  features: MapboxFeature[];
  attribution: string;
}

interface MapBoxConfig {
  accessToken: string;
}

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  async locationSearch(query: string) {
    try {
      const pluginSettings = (await strapi.config.get(
        'plugin::strapi-plugin-map-box'
      )) as MapBoxConfig;

      if (!pluginSettings?.accessToken) {
        return {
          error:
            'MapBox access token is not configured. Please add your access token in the plugin settings.',
          features: [],
        };
      }

      const MAPBOX_ACCESS_TOKEN = pluginSettings.accessToken;
      console.log('Searching for:', query);

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as MapboxResponse;
      return data;
    } catch (error) {
      console.error('Error searching location:', error);
      return {
        error: error instanceof Error ? error.message : 'An error occurred',
        features: [],
      };
    }
  },
});

export default service;
