import {DEFAULT_NAME} from '@configs/constants';

import * as storage from '@utils/Storage/contacts';
import {
  ContactEntry,
  ContactInfo,
  ContactUpdate,
} from '@utils/Storage/DBCalls/contacts';

type AcceptedContactUpdate = Omit<ContactUpdate, 'name'>;

class Contact {
  private pairHash: string;
  private contactInfo: ContactInfo;

  /**
   * This class is used to manage a contact.
   * @param pairHash - pairHash associated with the contact.
   * @param contactInfo - info associated with the contact.
   */
  constructor(pairHash: string, contactInfo: ContactInfo) {
    this.pairHash = pairHash;
    this.contactInfo = contactInfo;
  }

  /**
   * Create a contact class for the provided pairHash.
   * @param pairHash - pairHash identifying the contact.
   * @returns - contact class
   */
  static async load(pairHash: string): Promise<Contact> {
    return new Contact(pairHash, await storage.getContact(pairHash));
  }

  /**
   * Add a new contact and return its contact class.
   * If the contact already exists, the add fails silently and creates the existing contact's class.
   * @param contact - contact info being added
   * @returns - contact class
   */
  static async add(contact: ContactEntry): Promise<Contact> {
    await storage.addContact(contact);
    return new Contact(
      contact.pairHash,
      await storage.getContact(contact.pairHash),
    );
  }

  /**
   * Deletes a contact if the contact has no associated direct chat or group relationships.
   */
  static async delete(pairHash: string): Promise<boolean> {
    const didDeleteContact = await storage.deleteContact(pairHash);
    return didDeleteContact;
  }

  /**
   * get the pairHash associated with the contact.
   * @returns - pairHash associated with the contact.
   */
  public async getPairHash(): Promise<string> {
    return this.pairHash;
  }

  /**
   * get the contact info associated with the contact.
   * @returns - contact info associated with the contact
   */
  public async getContactInfo(): Promise<ContactInfo> {
    return this.contactInfo;
  }

  /**
   * Add a contact name if one does not already exist.
   * If the name that already exists is the default name, we update it with this new name.
   * @param name - name to be added to contact.
   */
  public async addContactName(name: string) {
    if (!this.contactInfo.name || this.contactInfo.name === DEFAULT_NAME) {
      await storage.updateContact(this.pairHash, {
        name: name,
      });
      this.contactInfo = await storage.getContact(this.pairHash);
    }
  }

  /**
   * Overwrite contact name with this name.
   * @param name - name to be updated.
   */
  public async overwriteContactName(name: string) {
    await storage.updateContact(this.pairHash, {
      name: name,
    });
    this.contactInfo = await storage.getContact(this.pairHash);
  }

  /**
   * Updates contact info.
   * Certain attributes like contact name are exempt from this update.
   * The exempt attributes like contact name have their own add and update methods.
   * @param update
   */
  public async updateContact(update: AcceptedContactUpdate) {
    await storage.updateContact(this.pairHash, update);
    this.contactInfo = await storage.getContact(this.pairHash);
  }
}

export default Contact;
