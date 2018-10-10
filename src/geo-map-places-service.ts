import * as Types from './types';
import { GeoMapPlacesServiceHere } from './geo-map-places-service-here';
import { GeoMapPlacesServiceGoogle } from './geo-map-places-service-google';
import { GeoMap } from './geo-map';

export type GeoMapPlacesServiceCreateInit =
  | GeoMapPlacesServiceInitGoogle
  | GeoMapPlacesServiceInitHere;

export interface GeoMapPlacesServiceInitGoogle {
  api: Types.GoogleApi;
  type: Types.GeoMapProvider.Google;
  map: GeoMap;
}

export interface GeoMapPlacesServiceInitHere {
  api: Types.HereApi;
  platform: H.service.Platform;
  type: Types.GeoMapProvider.Here;
  map: GeoMap;
}

export interface GeoMapPlacesServiceInit {
  type: Types.GeoMapProvider;
  implementation: Types.GeoMapPlacesServiceImplementation;
}

export interface GeoMapPlacesResult {
  name: string;
  placeId: string;
  location: {
    lat: number;
    lng: number;
  };
}

export class GeoMapPlacesService {
  private implementation: Types.GeoMapPlacesServiceImplementation;

  public static create(
    init: GeoMapPlacesServiceCreateInit
  ): GeoMapPlacesService {
    if (init.type === Types.GeoMapProvider.Here) {
      const hereApi = init.api as Types.HereApi;

      return new GeoMapPlacesService({
        type: init.type,
        implementation: GeoMapPlacesServiceHere.create({
          api: hereApi,
          platform: init.platform
        })
      });
    }

    const googleApi = init.api as Types.GoogleApi;

    return new GeoMapPlacesService({
      type: init.type,
      implementation: GeoMapPlacesServiceGoogle.create({
        api: googleApi,
        map: init.map
      })
    });
  }

  private constructor(init: GeoMapPlacesServiceInit) {
    this.implementation = init.implementation;
  }

  public async get(id: string): Promise<Types.Result<Types.GeoPlace>> {
    return this.implementation.get(id);
  }

  public async search(needle: string): Promise<GeoMapPlacesResult[]> {
    return this.implementation.search(needle);
  }
}
