import type { Core } from '@strapi/strapi';
import { getPluginConfig } from '../utils';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async locationSearch(ctx) {
    // Extract query from URL path
    const query = ctx.params.query;
    console.log('Query from URL:', query);

    const result = await strapi
      .plugin('strapi-plugin-map-box')
      .service('service')
      .locationSearch(query);

    ctx.body = result;
  },

  async getSettings(ctx) {
    const result = getPluginConfig('public')
    console.log('result from getSettings', result);
    ctx.body = result;
  },
});

export default controller;
