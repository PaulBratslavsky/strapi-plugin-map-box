export default [
  {
    method: 'GET',
    path: '/location-search/:query',
    handler: 'controller.locationSearch',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
  {
    method: 'GET',
    path: '/get-settings',
    handler: 'controller.getSettings',
    config: {
      policies: ['admin::isAuthenticatedAdmin'],
    },
  },
];
