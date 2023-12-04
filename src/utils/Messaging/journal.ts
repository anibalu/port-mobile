/**
 * @deprecated
 * This entire util got deprecated after introducing local databases
 */
import {JournaledMessageParams} from './interfaces';
import store from '../../store/appStore';
import {addToJournal, overwriteJournal, readJournal} from '../Storage/journal';

/**
 * saves a message to journal
 */
export async function saveToJournal(message: JournaledMessageParams) {
  //save to cache
  store.dispatch({
    type: 'ADD_TO_JOURNAL',
    payload: message,
  });
  //save to storage
  await addToJournal(message, true);
  console.log('message journaled');
}

/**
 * Loads saved journal to store.
 */
export async function loadJournalToStore() {
  const journaledMessages = await readJournal(true);
  store.dispatch({
    type: 'UPDATE_JOURNAL',
    payload: journaledMessages,
  });
}

/**
 * updates new journal to store.
 */
export async function updateJournal(
  journaledMessages: JournaledMessageParams[],
) {
  store.dispatch({
    type: 'UPDATE_JOURNAL',
    payload: journaledMessages,
  });
  await overwriteJournal(journaledMessages, true);
}

/**
 * gets journal.
 */
export async function getJournal() {
  const entireState = store.getState();
  let journaledMessages: JournaledMessageParams[] =
    entireState.journaledMessages.journal;
  if (journaledMessages.length === 0) {
    journaledMessages = await readJournal(true);
    if (journaledMessages.length > 0) {
      store.dispatch({
        type: 'UPDATE_JOURNAL',
        payload: journaledMessages,
      });
    }
  }
  return journaledMessages;
}
