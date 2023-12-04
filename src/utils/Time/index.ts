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

/**
 * converts an ISO timestamp into a user-readable timestamp string, used for chattiles exclusively.
 * @param {string|undefined} ISOTime - ISO timestamp or undefined
 * @returns {string} - user-readable timestamp string
 */
export function getChatTileTimestamp(ISOTime: string | undefined): string {
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
    //Comparing dates, if today's message we send the time, else a DD/MM/YY object
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (today > date) {
      console.log('Is older messages');
      const options: Intl.DateTimeFormatOptions = {
        day: 'numeric', // Day of the month
        month: 'numeric', // Full month name
        year: 'numeric', // Four-digit year
      };
      formattedTime = date.toLocaleDateString('en-US', options);
      return formattedTime;
    }
    formattedTime = formattedTime
      .replace(/\bam\b/i, 'AM')
      .replace(/\bpm\b/i, 'PM');
    return formattedTime;
  } catch (error) {
    return '';
  }
}

export function checkDateBoundary(
  ISOTimeString1: string | null,
  ISOTimeString2: string | null,
): boolean {
  try {
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
  } catch (error) {
    console.log('Check date boundary error: ', error);
    return false;
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

//create a function to take in an ISO timestamp string like the first function in this module and return a date string to display in your component.
export function getTimeAndDateStamp(isoString: string | undefined): string {
  if (!isoString) {
    return '';
  }
  const inputDate = new Date(isoString);
  const currentDate = new Date();

  // Format options for the date and time
  const options = {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  };
  if (inputDate.toDateString() === currentDate.toDateString()) {
    // Format time only for today
    return `Today, ${inputDate.toLocaleTimeString('en-US', options)}`;
  } else if (
    inputDate.toDateString() ===
    currentDate.setDate(currentDate.getDate() - 1).toDateString()
  ) {
    // Format time only for yesterday
    return `Yesterday, ${inputDate.toLocaleTimeString('en-US', options)}`;
  } else {
    // Format date and time for other dates
    const formattedDate = inputDate.toLocaleDateString('en-US');
    const formattedTime = inputDate.toLocaleTimeString('en-US', options);
    return `${formattedTime}, ${formattedDate}`;
  }
}

export function getDateStamp(isoString: string | undefined): string {
  if (!isoString) {
    return '';
  }
  const inputDate = new Date(isoString);
  const currentDate = new Date();

  if (inputDate.toDateString() === currentDate.toDateString()) {
    // Format time only for today
    return 'Today';
  } else if (
    inputDate.toDateString() ===
    currentDate.setDate(currentDate.getDate() - 1).toDateString()
  ) {
    // Format time only for yesterday
    return 'Yesterday';
  } else {
    // Format date
    const formattedDate = inputDate.toLocaleDateString('en-US');
    return `${formattedDate}`;
  }
}
