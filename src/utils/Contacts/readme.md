# Port contacts

Port contacts are a fundamental concept on the Port app. They are crucial to:
1. Ensure only one direct chat can exist between 2 Port users.
2. Track groups in common with other users.
3. Allow blocking of another Port user (this means another Port user is prevented from forming direct chats with you over ports, superports and contactports).

Port contacts work because of Port pairHashes. pairHashes are the hashed output of 2 users' userIds concatenated together. pairHashes are produced by the server (since only the server has access to userIds) and sent to the client whenever a relationship forms between 2 Port users. This relationship can be a group in common or a direct chat. Since pairHashes are unique to a pair of users, they are used to identify a contact. Thus, a port contact is:
1. A pairHash used to identify a contact.
2. Information the client has associated with the contact (like name, profile picture, etc.).

The contacts table stored on a user's device currently tracks the following information for a contact:
1. pairHash - used as unique id for the contact.
2. name - name of the contact if a name was assigned.
3. displayPic - display picture shared by the contact if one was shared.
4. notes - any optional notes attached to the contact.
5. connectedOn - when the relationship with the contact started.
6. connectionSource - describes how the direct chat with the contact got formed. If there is no direct chat with the contact, this field stores no information.

An interface describing this more clearly can be found in @utils/Storage/DBCalls/contacts.ts/ContactEntry .

The Contact class (@utils/Contacts/Contact.ts) is used to handle information retrieval and updates to contacts.