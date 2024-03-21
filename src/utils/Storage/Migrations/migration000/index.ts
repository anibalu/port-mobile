import addDefaultEntries from './addDefaultEntries';
import folders from './folders';
import permissions from './permissions';

/**
 * Migration 0010, setting up the initial folders and permissions table
 * Good from version 1.0.x
 */
export default async function migration000() {
  await permissions();
  await folders();
  await addDefaultEntries();
}
