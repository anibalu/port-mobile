import {messageMediaColumn} from './messageMediaColumn';
export async function migration005() {
  await messageMediaColumn();
}
