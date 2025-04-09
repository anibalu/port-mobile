import {addPermissionIdToMyPorts} from './addPermissionIdToMyPorts';
import {
  addPairHashToConnectionsTable,
  addPseudoPairHashEntries,
  addRoutingIdToConnectionsTable,
  setupRoutingIdAndPairHashValues,
} from './alterConnectionsTable';
import {
  addContactPortTickets,
  addContactPorts,
  addTicketColumnToReadPortTable,
} from './contactPorts';
import {setupContactsTable} from './contacts';
import deleteOlderContactSharing from './deleteOlderContactSharing';
import {sendAndRequestContactPortsFromExistingChats} from './sendAndRequestContactPortsFromExistingChats';

export async function migration009() {
  await setupContactsTable();
  await addRoutingIdToConnectionsTable();
  await addPairHashToConnectionsTable();
  await setupRoutingIdAndPairHashValues();
  await addPseudoPairHashEntries();
  await deleteOlderContactSharing();
  await addPermissionIdToMyPorts();
  await addContactPorts();
  await addContactPortTickets();
  await addTicketColumnToReadPortTable();
  await sendAndRequestContactPortsFromExistingChats();
}
