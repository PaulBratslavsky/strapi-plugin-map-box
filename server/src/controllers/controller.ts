import type { Core } from '@strapi/strapi';

const controller = ({ strapi }: { strapi: Core.Strapi }) => ({
  async locationSearch(ctx) {
    console.log("********** FROM CONTROLLER ***********");
    console.log('ctx', ctx);
    console.log("*********** FROM CONTROLLER ***********");

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
    const result = await strapi.config.get('plugin::strapi-plugin-map-box');
    ctx.body = result;
  },
});

export default controller;
