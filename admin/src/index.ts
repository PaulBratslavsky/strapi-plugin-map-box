import { getTranslation } from './utils/getTranslation';
import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PinMap } from '@strapi/icons';
import { MapBoxField } from './components/custom-field/MapBoxField/index';

export default {
  register(app: any) {
    
    app.customFields.register({
      name: 'map-box',
      type: 'json',
      icon: PinMap,
      intlLabel: {
        id: 'custom.fields.map-box.label',
        defaultMessage: 'Map Box',
      },
      intlDescription: {
        id: 'custom.fields.map-box.description',
        defaultMessage: 'Enter geographic coordinates',
      },
      components: {
        Input: () => ({ default: MapBoxField as React.ComponentType }) as any,
      },
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
