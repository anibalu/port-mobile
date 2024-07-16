import {deleteUnsent} from './deleteUnsent';
import {messageMediaColumn} from './messageMediaColumn';
import templates from './templates';

export async function migration005() {
  await messageMediaColumn();
  await templates();
  await deleteUnsent();
}
