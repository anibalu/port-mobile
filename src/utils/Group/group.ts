// Irfan/sumaanta coordinate here;
interface groupData {
  groupId: string;
  admin: boolean;
  members: string[];
  name: string;
  groupLinks?: string[];
  description?: string;
}

interface bundle {
  org: string;
  type: string;
  groupLink: string;
  name: string;
  description?: string;
}

/**
 * a helper to load a Group's details.
 * @param groupId load up a group from file
 * @returns groupData
 */

async function loadGroup(groupId: string) {
  // TODO sumaanta;
  const groupData: groupData;
  console.log(groupId);
  return groupData;
}

/**
 * Store any changes that you make to a group here. May involve an insert or an update.
 */
async function dump(groupId: string, data: groupData) {
  // TODO, sumaanta, fill this one out
  console.log(groupId, data);
}

/**
 * Crate a new group.
 * @param name the name of the group
 * @param description an optional description for the group
 * @param pathToPicture an optional pathToPicture for the group
 */
export async function create(
  name: string,
  description?: string,
  pathToPicture?: string,
) {
  console.log(name, description, pathToPicture);
  // TODO: make the request to the backend to create a group and retrieve the groupId
  // TODO: sumaanta, your work goes here
  const groupId = 'Get from server';
  const admin = true;
  console.log(admin);
  const data: groupData;

  await dump(groupId, data);
}

/**
 * Join a group with given a bundle
 * @param bundle a bundle that can be used to join a group
 */
export async function join(bundle: bundle) {
  // TODO make the server call to join the group
  // TODO irfan, your work goes here
  console.log(bundle);
  const groupId = 'get from server';
  const data: groupData;
  await dump(groupId, data);
}

/**
 * Get a bundle that can be shared with someone who wants to join a group
 * @param groupId the group's id
 * @returns a bundle that can be shared
 */
export async function getBundle(groupId: string) {
  // Get a link from my cache
  const group = await loadGroup(groupId);
  if (!group.groupLinks) {
    return {}; // Likely never had any group links
  }

  if (group.groupLinks.length === 0) {
    try {
      // TODO get more group links if you can
      // Irfan
      group.groupLinks = ['We have no more group links']; // TODO delete this line
    } catch {
      return {}; // We're out of group links, alert the user that they're all out
    }
  }
  const groupLink = group.groupLinks.pop() || "We didn't get a link";
  dump(groupId, group);
  const bundle: bundle = {
    org: 'port.numberless.tech',
    type: 'groupBundle',
    name: group.name,
    groupLink,
  };
  if (group.groupLinks.length < 5) {
    getMoreLinks(groupId); // Don't await, let this run in the background. Fail silently
  }
  return bundle;
}

/**
 * private helper to get more links to stask them.
 * @param groupId the group's id
 */
async function getMoreLinks(groupId: string) {
  const group = await loadGroup(groupId);
  // TODO post request to get more bundles
  // TODO irfan, your work goes here. Remember to fail silently.
  dump(groupId, group);
}

/**
 * The entrypoint to send a message to a group
 * @param message the message to send to the group
 * @param groupId the group's id
 */
export async function sendMessage(groupId: string, message: object) {
  // TODO shantanav
  console.log(groupId, message);
}

/**
 * The entrypoint to process a message to this group recieved from the server
 * @param message The message the server forwarded to you
 * @param groupId the group's id
 */
export async function recieveMessage(groupId: string, message: object) {
  // TODO shantanav
  console.log(groupId, message);
}

/**
 * Get an iterator for messages in a group
 */
export async function getMessages(groupId: string) {
  console.log(groupId);
  return [];
}
