import {ARTIFICIAL_LOADER_INTERVAL} from '../../configs/constants';

/**
 * converts an ISO timestamp into a user-readable timestamp string.
 * @param {string|undefined} ISOTime - ISO timestamp or undefined
 * @returns {string} - user-readable timestamp string
 */
export function getTimeStamp(ISOTime: string | undefined): string {
  if (!ISOTime) {
    return '';
  }
  try {
    // Format the time in 12-hour format with AM/PM
    const date = new Date(ISOTime);
    let formattedTime = date.toLocaleTimeString([], {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
    formattedTime = formattedTime
      .replace(/\bam\b/i, 'AM')
      .replace(/\bpm\b/i, 'PM');
    return formattedTime;
  } catch (error) {
    return '';
  }
}

export function checkDateBoundary(
  ISOTimeString1: string | undefined,
  ISOTimeString2: string | undefined,
) {
  if (!ISOTimeString1 || !ISOTimeString2) {
    return false;
  } else {
    const date1 = new Date(ISOTimeString1);
    const date2 = new Date(ISOTimeString2);

    // Compare the year, month, and day components of the dates.
    return (
      date1.getFullYear() !== date2.getFullYear() ||
      date1.getMonth() !== date2.getMonth() ||
      date1.getDate() !== date2.getDate()
    );
  }
}

/**
 * converts an ISO timestamp into a user-readable date boundary string.
 * @param {string|undefined} ISOTime - ISO timestamp or undefined
 * @returns {string} - user-readable date boundary string
 */
export function createDateBoundaryStamp(isoString: string | undefined): string {
  if (isoString === undefined) {
    return '';
  }
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long', // Full weekday name
    day: 'numeric', // Day of the month
    month: 'long', // Full month name
    year: 'numeric', // Four-digit year
  };

  const date = new Date(isoString);
  const formattedDate = date.toLocaleDateString('en-US', options);

  return formattedDate;
}

export function generateId() {
  const date = new Date();
  return date.getTime().toString();
}

/**
 * Creates an ISO time stamp of current time.
 * @returns {string} - ISO time stamp as a string
 */
export function generateISOTimeStamp() {
  const now: Date = new Date();
  return now.toISOString();
}

export function timeStringToObject(timestamp: string) {
  const timeObj = new Date(timestamp);
  return timeObj;
}

//if you want to add artificial wait anywhere
export const wait = async (delay: number = ARTIFICIAL_LOADER_INTERVAL) => {
  return new Promise(resolve => setTimeout(resolve, delay));
};
