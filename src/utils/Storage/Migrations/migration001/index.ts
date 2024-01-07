import connections from './connections';
import cryptoData from './cryptoData';
import lineMessages from './lineMessages';
import groups from './groups';
import permissions from './permissions';
import lines from './lines';
import ports from './ports';
import contactSharing from './contactaSharing';
/**
 * Migration 001, setting up the initial version of our app storage
 * Good from version 1.0.x
 */
export default async function migration001() {
  await connections();
  await lineMessages();
  await cryptoData();
  await groups();
  await permissions();
  await lines();
  await ports();
  await contactSharing();
}
