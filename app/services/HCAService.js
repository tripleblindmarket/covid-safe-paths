import Yaml from 'js-yaml';
import PushNotification from 'react-native-push-notification';
import RNFetchBlob from 'rn-fetch-blob';

import { AUTHORITIES_LIST_URL } from '../constants/authorities';
import {
  AUTHORITY_SOURCE_SETTINGS,
  HCA_AUTO_SUBSCRIPTION,
} from '../constants/storage';
import { GetStoreData, SetStoreData } from '../helpers/General';
import languages from '../locales/languages';
import { LocationData } from './LocationService';

/**
 * Singleton class to interact with health care authority data
 */
class HCAService {
  /**
   * Fetches the raw YAML file containing a list of all
   * of the registered Health Care Authorities.
   * Saves the response as a cached file for performance.
   * @returns {void}
   */
  async fetchAuthoritiesYaml() {
    return await RNFetchBlob.config({
      // store response data as a file for performance increase
      fileCache: true,
    }).fetch('GET', AUTHORITIES_LIST_URL, {
      //some headers ..
    });
  }

  /**
   * Fetches the list of all registed Health Care Authorities
   * @returns {Array} List of health care authorities from the global registry
   */
  async getAuthoritiesList() {
    let authorities = [];

    try {
      const result = await this.fetchAuthoritiesYaml();
      const list = await RNFetchBlob.fs.readFile(result.path(), 'utf8');
      authorities = Yaml.safeLoad(list).Authorities;
    } catch (err) {
      console.log(err);
    }

    return authorities;
  }

  /**
   * Get the list of Health Care Authorities that a user has saved
   * @returns {Array} List of health care authorities from storage
   */
  async getUserAuthorityList() {
    return await GetStoreData(AUTHORITY_SOURCE_SETTINGS, false);
  }

  /**
   * Checks if a user has saved any Health Care Authorities
   *
   * @returns {boolean}
   */
  async hasSavedAuthorities() {
    const authorities = await this.getUserAuthorityList();
    return authorities && authorities.length > 0;
  }

  /**
   * Prompt a user to add a new Health Care Authority. Includes information
   * on the number of Authorities in their current location.
   *
   * Redirects to the 'ChooseProviderScreen' is a user presses 'Yes'.
   *
   * @param {*} navigate - react-navigation function to change the current stack screen
   * @returns {void}
   */
  async pushAddNewAuthoritesFromLoc() {
    const authorities = await this.getAuthoritiesInCurrentLoc();
    const numAuthorities = authorities.length;

    PushNotification.localNotification({
      title: languages.t('label.authorities_new_in_area'),
      message: languages.t('label.authorities_num_in_area', { numAuthorities }),
    });
  }

  /**
   * Returns the `url` value for an authority
   * @param {*} authority
   * @returns {string}
   */
  getAuthorityUrl(authority) {
    const authorityName = Object.keys(authority)[0];
    const urlKey = authority[authorityName][0];
    return urlKey && urlKey['url'];
  }

  /**
   * Returns the `bounds` value for an authority
   * @param {*} authority
   * @returns {*} Object containing a `bounds` key.
   * A `bounds` contains a `ne` and `sw` object that each
   * have a valid GPS point containing `longitude` and `latitude` keys.
   */
  getAuthorityBounds(authority) {
    const authorityName = Object.keys(authority)[0];
    const boundsKey = authority[authorityName][1];
    return boundsKey && boundsKey['bounds'];
  }

  /**
   * Checks if a given point is inside the bounds of the given authority
   * @param {*} point Object containing a `latitude` and `longitude` field
   * @param {*} authority
   * @returns boolean
   */
  isPointInAuthorityBounds(point, authority) {
    const locHelper = new LocationData();
    const bounds = this.getAuthorityBounds(authority);

    if (bounds) {
      return locHelper.isPointInBoundingBox(point, bounds);
    } else {
      return false;
    }
  }

  /**
   * Iterates over the GPS regions for all Health Care Authorities
   * and returns a list of the authorities whose regions include
   * the current GPS location of the user.
   *
   * @returns {Array} List of health care authorities
   */
  async getAuthoritiesInCurrentLoc() {
    const mostRecentUserLoc = await new LocationData().getMostRecentUserLoc();
    const authorities = await this.getAuthoritiesList();

    return authorities.filter(authority =>
      this.isPointInAuthorityBounds(mostRecentUserLoc, authority),
    );
  }

  /**
   * Iterates over the full list of authorities and checks
   * if there is any GPS point in the user's full 28-day location history
   * that is within the bounds of the authority.
   *
   * @returns {Array} List of health care authorities
   */
  async getAuthoritiesFromUserLocHistory() {
    const locHelper = new LocationData();
    const locData = await locHelper.getLocationData();
    const authorities = await this.getAuthoritiesList();

    return authorities.filter(authority =>
      locData.some(point => this.isPointInAuthorityBounds(point, authority)),
    );
  }

  /**
   * Gets the most recent location of the user and returns a list of
   * all Healthcare Authorities whose bounds contain the user's current location,
   * filtering out any Authorities the user has already subscribed to.
   *
   * @returns {Array} - List of Healthcare Authorities
   */
  async getNewAuthoritiesInUserLoc() {
    const mostRecentUserLoc = await new LocationData().getMostRecentUserLoc();
    const authoritiesList = await this.getAuthoritiesList();
    const userAuthorities = await this.getUserAuthorityList();

    return authoritiesList.filter(
      authority =>
        this.isPointInAuthorityBounds(mostRecentUserLoc, authority) &&
        !userAuthorities.includes(authority),
    );
  }

  /**
   * Prompt a user to add a Health Authority if they are in the bounds
   * of a healthcare authority that they have not yet subscribed to.
   *
   * This will trigger a push notification.
   */
  async findNewAuthorities() {
    const newAuthorities = await this.getNewAuthoritiesInUserLoc();

    if (newAuthorities.length > 0) {
      this.pushAddNewAuthoritesFromLoc();
    }
  }

  /**
   * Checks if the user has explicitly approved or denied the auto subscribe
   * feature. When pulling from async storage, if the key has not yet been set,
   * the value will be null.
   *
   * @returns boolean
   */
  async hasUserSetSubscription() {
    const permission = await GetStoreData(HCA_AUTO_SUBSCRIPTION, true);

    if (permission === null) {
      return false;
    } else {
      return true;
    }
  }

  /**
   * Check if the user has opted in to auto subscribe to new Healthcare
   * Authorities in their area.
   *
   * @returns boolean (if value is set in storege)
   */
  async isAutosubscriptionEnabled() {
    return (await GetStoreData(HCA_AUTO_SUBSCRIPTION, true)) === 'true';
  }

  /**
   * Enable auto subscription to new Healthcare Authorities in the user's area.
   * @returns void
   */
  async enableAutoSubscription() {
    await SetStoreData(HCA_AUTO_SUBSCRIPTION, true);
  }

  /**
   * Disable auto subscription to new Healthcare Authorities in the user's area.
   * @returns void
   */
  async disableAutoSubscription() {
    await SetStoreData(HCA_AUTO_SUBSCRIPTION, false);
  }
}

export default new HCAService();
