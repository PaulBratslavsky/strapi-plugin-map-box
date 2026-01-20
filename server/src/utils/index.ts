import type { Core } from '@strapi/strapi';

export interface PluginConfig {
  accessToken: string;
  debugMode: boolean;
}

export function getPluginConfig(strapi: Core.Strapi, name: string): PluginConfig {
  const config = strapi.plugin('map-box').config(name) as PluginConfig;
  return config;
}

