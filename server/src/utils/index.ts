import type { Core } from '@strapi/strapi';

/** Must match `strapi.name` in package.json and the admin's PLUGIN_ID (admin/src/pluginId.ts). */
export const PLUGIN_ID = 'map-box';

export interface PluginConfig {
  accessToken: string;
  debugMode: boolean;
}

export function getPluginConfig(strapi: Core.Strapi, name: string): PluginConfig {
  const config = strapi.plugin(PLUGIN_ID).config(name) as PluginConfig;
  return config;
}

