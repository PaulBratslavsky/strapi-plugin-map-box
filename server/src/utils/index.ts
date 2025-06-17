import { config } from '../../../types';

export function getPluginConfig(name: string) {
  const config = strapi.plugin('strapi-plugin-map-box').config<config['public']>(name);
  return config;
}

