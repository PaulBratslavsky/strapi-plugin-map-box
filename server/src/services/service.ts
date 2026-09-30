import type { Core } from '@strapi/strapi';
import { getPluginConfig } from '../utils';

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
      const pluginSettings = getPluginConfig(strapi, 'public');

      if (!pluginSettings.accessToken) {
        return {
          error:
            'MapBox access token is not configured. Please add your access token in the plugin settings.',
          features: [],
        };
      }

      const MAPBOX_ACCESS_TOKEN = pluginSettings.accessToken;
      if (pluginSettings.debugMode) strapi.log.debug(`[map-box] location search: ${query}`);

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = (await response.json()) as MapboxResponse;
      return data;
    } catch (error) {
      strapi.log.error(`[map-box] location search failed: ${error instanceof Error ? error.message : error}`);
      return {
        error: error instanceof Error ? error.message : 'An error occurred',
        features: [],
      };
    }
  },
});

export default service;
