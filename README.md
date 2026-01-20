# Strapi Plugin MapBox

A Strapi plugin that adds a custom MapBox field to your content types. Select locations on an interactive map with search functionality, and store coordinates, zoom level, and address data.

## Features

- Interactive MapBox map field for Strapi content types
- Location search with autocomplete
- Click or drag marker to set location
- Stores longitude, latitude, zoom, pitch, bearing, and address
- Debug mode for viewing raw JSON data
- Fullscreen, navigation, and geolocation controls

## Requirements

- Strapi v5.x
- MapBox account with access token

## Installation

### From npm

```bash
npm install strapi-plugin-map-box
# or
yarn add strapi-plugin-map-box
```

### For local development

```bash
# Clone the plugin
git clone https://github.com/PaulBratslavsky/strapi-plugin-map-box.git

# Install dependencies
cd strapi-plugin-map-box
yarn install

# Build the plugin
yarn build
```

## Configuration

### 1. Add plugin configuration

Create or update `config/plugins.ts` in your Strapi project:

```typescript
export default () => ({
  'map-box': {
    enabled: true,
    config: {
      public: {
        accessToken: process.env.MAPBOX_ACCESS_TOKEN,
        debugMode: process.env.MAPBOX_DEBUG_MODE === 'true',
      },
    },
  },
});
```

### 2. Add environment variables

Add to your `.env` file:

```env
MAPBOX_ACCESS_TOKEN=pk.your_mapbox_public_token_here
MAPBOX_DEBUG_MODE=false
```

Get your access token from [MapBox Account](https://account.mapbox.com/access-tokens/).

### 3. Update Content Security Policy

Update `config/middlewares.ts` to allow MapBox resources:

```typescript
export default [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'script-src': ["'self'", "'unsafe-inline'", 'blob:'],
          'worker-src': ["'self'", 'blob:'],
          'connect-src': ["'self'", 'https:', 'blob:', 'https://api.mapbox.com', 'https://events.mapbox.com'],
          'img-src': ["'self'", 'data:', 'blob:', 'https://api.mapbox.com', 'https://*.mapbox.com'],
        },
      },
    },
  },
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];
```

### 4. Rebuild Strapi

```bash
yarn build
yarn develop
```

## Usage

### Adding the field to a content type

1. Go to **Content-Type Builder** in Strapi admin
2. Select or create a content type
3. Click **Add another field**
4. Select **Custom** tab
5. Choose **MapBox** field
6. Configure field name and settings
7. Save the content type

### Data structure

The MapBox field stores the following JSON structure:

```json
{
  "longitude": -122.4194,
  "latitude": 37.7749,
  "zoom": 13,
  "pitch": 0,
  "bearing": 0,
  "address": "San Francisco, CA, USA"
}
```

### API response

When fetching content via the API, the map data is returned as a JSON object:

```bash
GET /api/locations
```

```json
{
  "data": [
    {
      "id": 1,
      "documentId": "abc123",
      "mapData": {
        "longitude": -122.4194,
        "latitude": 37.7749,
        "zoom": 13,
        "pitch": 0,
        "bearing": 0,
        "address": "San Francisco, CA, USA"
      }
    }
  ]
}
```

## Local Development

### Link to a Strapi project

Using the resolve path in your Strapi project's `config/plugins.ts`:

```typescript
export default () => ({
  'map-box': {
    enabled: true,
    resolve: '../path-to/strapi-plugin-map-box',
    config: {
      public: {
        accessToken: process.env.MAPBOX_ACCESS_TOKEN,
        debugMode: true,
      },
    },
  },
});
```

### Watch mode

```bash
yarn watch
```

## Frontend Integration

### React / Next.js

```bash
npm install react-map-gl mapbox-gl
```

```tsx
import Map, { Marker } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

function LocationMap({ location }) {
  return (
    <Map
      initialViewState={{
        longitude: location.longitude,
        latitude: location.latitude,
        zoom: location.zoom,
        pitch: location.pitch,
        bearing: location.bearing,
      }}
      mapStyle="mapbox://styles/mapbox/streets-v12"
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
    >
      <Marker
        longitude={location.longitude}
        latitude={location.latitude}
        color="#4945ff"
      />
    </Map>
  );
}
```

### React Native (Expo)

```bash
npx expo install @rnmapbox/maps
```

```tsx
import Mapbox, { Camera, MapView, PointAnnotation } from '@rnmapbox/maps';

Mapbox.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN);

function LocationMap({ location }) {
  return (
    <MapView style={{ flex: 1 }}>
      <Camera
        centerCoordinate={[location.longitude, location.latitude]}
        zoomLevel={location.zoom}
        pitch={location.pitch}
        heading={location.bearing}
      />
      <PointAnnotation
        id="marker"
        coordinate={[location.longitude, location.latitude]}
      />
    </MapView>
  );
}
```

## TypeScript

```typescript
type MapLocation = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  address?: string;
};
```

## License

MIT

## Author

Paul Bratslavsky ([@PaulBratslavsky](https://github.com/PaulBratslavsky))
