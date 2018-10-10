import * as Test from './test';
import * as Types from './types';
import * as simulant from 'jsdom-simulant';

test('GOOGLE map search result', async () => {
  const googlePlaces = await Test.createGoogleMapPlacesImplementation({
    mock: false,
    mount: { center: Test.Constants.S2_HAM, type: Types.GeoMapType.Hybrid }
  });

  expect(await googlePlaces.map.search('sinnerschrader')).toHaveLength(2);
});
