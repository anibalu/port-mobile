import {ConnectionType} from '../Connections/interfaces';
import {handshakeActionsB1} from '../DirectChats/handshake';
import {handshakeActionsG1} from '../Groups/handshake';
import {BundleReadResponse, ConnectionBundle} from './interfaces';

/**
 * Check if bundle data string is of correct format and return parsed Direct connection bundle object.
 * @param {string} rawData - bundle data string that needs to be parsed and checked.
 * @throws {Error} - If bundle data format is incorrect.
 * @returns {ConnectionBundle} - successfully parsed bundle data.
 */
export function checkConnectionBundleDataFormat(rawData: string) {
  const bundle: ConnectionBundle = JSON.parse(rawData);
  if (bundle.org !== 'numberless.tech') {
    throw new Error('Organisation data incorrect');
  }
  if (
    !(
      bundle.connectionType === ConnectionType.direct ||
      bundle.connectionType === ConnectionType.group ||
      bundle.connectionType === ConnectionType.superport
    )
  ) {
    throw new Error('Bundle type not supported');
  }
  if (typeof bundle.data === 'undefined') {
    throw new Error('bundle data not present');
  }
  return bundle;
}

export async function readConnectionBundle(
  rawData: string,
): Promise<BundleReadResponse> {
  try {
    const bundle = checkConnectionBundleDataFormat(rawData);
    switch (bundle.connectionType) {
      case ConnectionType.direct:
        return await handshakeActionsB1(bundle);
      case ConnectionType.group:
        // add group handshake action
        return await handshakeActionsG1(bundle);
      case ConnectionType.superport:
        if (bundle.data.superportType === 'direct') {
          return await handshakeActionsB1(bundle);
        }
        // add superport handshake action
        return BundleReadResponse.formatError;
      default:
        throw new Error('Bundle connection type error');
    }
  } catch (error) {
    console.log('Error reading bundle: ', error);
    return BundleReadResponse.formatError;
  }
}

export async function processConnectionBundle(
  bundle: ConnectionBundle,
  name: string,
): Promise<BundleReadResponse> {
  try {
    switch (bundle.connectionType) {
      case ConnectionType.direct:
        return await handshakeActionsB1(bundle, name);
      case ConnectionType.group:
        // add group handshake action
        console.log('group handshake invoked');
        return await handshakeActionsG1(bundle);
      case ConnectionType.superport:
        if (bundle.data.superportType === 'direct') {
          return await handshakeActionsB1(bundle, name);
        }
        // add superport handshake action
        return BundleReadResponse.formatError;
      default:
        throw new Error('Bundle connection type error');
    }
  } catch (error) {
    console.log('Error reading bundle: ', error);
    return BundleReadResponse.formatError;
  }
}
