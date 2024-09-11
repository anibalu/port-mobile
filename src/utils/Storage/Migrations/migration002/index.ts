import addDefaultEntries from './addDefaultEntries';
import connections from './connections';
import contactSharing from './contactSharing';
import cryptoData from './cryptoData';
import folders from './folders';
import lineMessages from './lineMessages';
import lines from './lines';
import media from './media';
import permissions from './permissions';
import ports from './ports';
import reactions from './reactions';

/**
 * Migration 002, changes:
 * - Adding the media table
 * - Good from version 1.3.x
 */
export default async function migration002() {
  // Old migration 000
  await permissions();
  await folders();
  await addDefaultEntries();
  // Old migration 001
  await connections();
  await lineMessages();
  await cryptoData();
  await lines();
  await ports();
  await contactSharing();
  await reactions();
  // Latest migration 002
  await media();
}
