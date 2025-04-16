import { addPermissionsIdToContactPorts } from "./addPermissionsIdToContactPorts";
import { addPermissionsIdToReadPorts } from "./addPermissionsIdToReadPorts";

export default async function migration014() {
  await addPermissionsIdToReadPorts();  
  await addPermissionsIdToContactPorts();
}
