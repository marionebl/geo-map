import * as Types from './types';
import * as Util from './util';
import * as CountryCodes from './country-codes';

export class GeoMapPlacesServiceGoogle
  implements Types.GeoMapPlacesServiceImplementation {
  private readonly api: Types.GoogleApi;

  public static create(init: {
    api: Types.GoogleApi;
  }): GeoMapPlacesServiceGoogle {
    return new GeoMapPlacesServiceGoogle(init);
  }

  private constructor(init: { api: Types.GoogleApi }) {
    this.api = init.api;
  }

  public async get(
    placeId: string
  ): Promise<Types.Result<Types.GeoMapPlaceDetails>> {
    return new Promise<Types.Result<Types.GeoMapPlaceDetails>>(resolve => {
      const container = document.createElement('div');
      const service = new this.api.places.PlacesService(container);

      service.getDetails(
        {
          placeId,
          fields: [
            'address_components',
            'formatted_address',
            'geometry',
            'icon',
            'name',
            'permanently_closed',
            'place_id',
            'type',
            'formatted_phone_number',
            'opening_hours',
            'website'
          ]
        },
        result => {
          if (!result || result === null) {
            return resolve({
              type: Types.ResultType.Failure,
              error: new Error(
                `Could not fetch place data for place id ${placeId}`
              )
            });
          }

          const get = Util.getAddressComponent(result.address_components);
          const countryCode = get('country', {
            variant: Util.AddressComponentVariant.Short
          });

          resolve({
            type: Types.ResultType.Success,
            payload: {
              provider: Types.GeoMapProvider.Google,
              id: result.place_id,
              name: result.name,
              address: {
                country: get('country'),
                countryCode: CountryCodes.alphaTwo[countryCode],
                county: get('administrative_area_level_2'),
                district: get('sublocality_level_1'),
                state: get('administrative_area_level_1'),
                postalCode: get('postal_code'),
                locality: get('locality'),
                route: get('route'),
                streetNumber: get('street_number')
              },
              formattedAddress: result.formatted_address,
              location: result.geometry.location.toJSON(),
              icon: result.icon,
              permanentlyClosed: result.permanently_closed,
              type: result.types,
              formattedPhoneNumber: result.formatted_phone_number,
              website: result.website
            }
          });
        }
      );
    });
  }

  public async search(
    needle: string,
    center: Types.GeoPoint,
    radius: number
  ): Promise<Types.Result<Types.GeoMapPlace[]>> {
    const container = document.createElement('div');
    const service = new this.api.places.PlacesService(container);

    const request: google.maps.places.TextSearchRequest = {
      query: needle,
      location: center,
      radius
    };

    return new Promise<Types.Result<Types.GeoMapPlace[]>>(resolve => {
      try {
        service.textSearch(request, (results, status) => {
          if (status === this.api.places.PlacesServiceStatus.OK) {
            return resolve({
              type: Types.ResultType.Success,
              payload: results.map(result => this.convertResult(result))
            });
          } else if (
            status === this.api.places.PlacesServiceStatus.ZERO_RESULTS ||
            status === this.api.places.PlacesServiceStatus.NOT_FOUND
          ) {
            return resolve({
              type: Types.ResultType.Success,
              payload: []
            });
          }
          return resolve({
            type: Types.ResultType.Failure,
            error: new Error('Query status ' + status)
          });
        });
      } catch (error) {
        return resolve({
          type: Types.ResultType.Failure,
          error
        });
      }
    });
  }

  private convertResult(
    result: google.maps.places.PlaceResult
  ): Types.GeoMapPlace {
    return {
      provider: Types.GeoMapProvider.Google,
      id: result.place_id,
      name: result.name,
      formattedAddress: result.formatted_address,
      location: result.geometry.location.toJSON()
    };
  }

  public distanceBetween(
    from: Types.GeoPoint,
    to: Types.GeoPoint,
    radius?: number
  ): number {
    return this.api.geometry.spherical.computeDistanceBetween(
      new this.api.LatLng(from.lat, from.lng),
      new this.api.LatLng(to.lat, to.lng),
      radius
    );
  }
}
