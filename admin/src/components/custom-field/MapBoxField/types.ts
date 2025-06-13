export type MapBoxValue = {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  address: string;
}


export interface ViewState {
  longitude: number;
  latitude: number;
  zoom: number;
  pitch: number;
  bearing: number;
  padding?: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export const DEFAULT_VIEW_STATE: ViewState = {
  longitude: -122.4194,
  latitude: 37.7749,
  zoom: 13,
  pitch: 0,
  bearing: 0,
  padding: {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0
  }
};