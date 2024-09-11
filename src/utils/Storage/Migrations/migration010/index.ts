import {clearVestigialGroupTables} from './clearVestigialGroupTables';
import {createGroupsTable} from './createGroupsTable';
import groupMessages from './groupMessages';
import {setUpGroupMembers} from './setUpGroupMembers';

export default async function migration010() {
  await clearVestigialGroupTables();
  await createGroupsTable();
  await setUpGroupMembers();
  await groupMessages();
}
