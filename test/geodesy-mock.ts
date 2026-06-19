/**
 * @fileoverview Mock for geodesy module to avoid ES Module loading errors in Jest.
 */

export default class MockGeodesy {
  static parse() { return new MockGeodesy(); }
}
export class LatLon {}
