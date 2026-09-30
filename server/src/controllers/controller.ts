import type { Core } from '@strapi/strapi';
import { getPluginConfig, PLUGIN_ID } from '../utils';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async locationSearch(ctx) {
    // Extract query from URL path
    const query = ctx.params.query;

    const result = await strapi
      .plugin(PLUGIN_ID)
      .service('service')
      .locationSearch(query);

    ctx.body = result;
  },

  async getSettings(ctx) {
    const config = getPluginConfig(strapi, 'public');
    ctx.body = config;
  },
});

export default controller;
