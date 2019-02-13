import * as Constants from './constants';
import * as Types from '../types';
import { createGoogleMap } from './create-google-map';
import { createHereMap } from './create-here-map';
import * as Util from './util';
import { Tests1 } from './integration-tests-1';
import { Tests2 } from './integration-tests-2';
import { Tests3 } from './integration-tests-3';
import { Tests4 } from './integration-tests-4';
import { Tests5 } from './integration-tests-5';

export const Tests = {
  ...Tests1,
  ...Tests2,
  ...Tests3,
  ...Tests4,
  ...Tests5
};
