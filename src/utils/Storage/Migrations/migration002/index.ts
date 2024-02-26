import groupMessages from './groupMessages';
import media from './media';

/**
 * Migration 002, changes:
 * - Adding the media table
 * - Good from version 1.3.x
 */
export default async function migration002() {
  await media();
  await groupMessages();
}
