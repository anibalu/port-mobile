import {ARTIFICIAL_LOADER_INTERVAL} from '../../configs/constants';
import {expiryDuration, expiryOptionsTypes} from './interfaces';

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
export function getReadableTimestamp(
  ISOTime: string | undefined | null,
): string {
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

/**
 * Creates an ISO time stamp of current time.
 * @returns {string} - ISO time stamp as a string
 */
export function generateISOTimeStamp() {
  const now: Date = new Date();
  return now.toISOString();
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

export function getExpiryTimestamp(
  currentTimestamp: string,
  expiry: expiryOptionsTypes,
): string | null {
  const date = new Date(currentTimestamp);
  const addTime = expiryDuration[expiry];
  if (addTime) {
    date.setTime(date.getTime() + addTime);
    return date.toISOString();
  }
  return null;
}

export function hasExpired(expiryTimestamp: string | null): boolean {
  try {
    if (!expiryTimestamp) {
      return false;
    }
    const timeStamp: Date = new Date(expiryTimestamp);
    const now: Date = new Date();
    const timeDiff = timeStamp.getTime() - now.getTime();
    if (timeDiff > 0) {
      return false;
    } else {
      return true;
    }
  } catch (error) {
    console.log('Error checking time stamp validity: ', error);
    return true;
  }
}

export function getExpiryTag(expiryTimestamp: string | null): string {
  if (!expiryTimestamp) {
    return 'Does not expire';
  } else {
    try {
      const currentTime = new Date();
      const expiryTime = new Date(expiryTimestamp);
      const timeDifference = expiryTime.getTime() - currentTime.getTime();
      return formatTimeUntilExpiry(timeDifference);
    } catch (error) {
      return 'unknown expiry';
    }
  }
}

function formatTimeUntilExpiry(difference: number): string {
  const seconds = Math.floor(difference / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `Expires in ${days} day${days > 1 ? 's' : ''}`;
  } else if (hours > 0) {
    return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
  } else if (minutes > 0) {
    return `Expires in ${minutes} minute${minutes > 1 ? 's' : ''}`;
  } else {
    return 'Expires in a minute';
  }
}

export function checkTimeout(
  timestamp: string | null | undefined,
  acceptedDuration: number,
): boolean {
  try {
    if (!timestamp) {
      console.log('NoTimestampToCheckTimeout: return expired');
      return false;
    }
    const timeStamp: Date = new Date(timestamp);
    const now: Date = new Date();
    const timeDiff = now.getTime() - timeStamp.getTime();
    if (timeDiff <= acceptedDuration) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    console.log('error checking timeout: ', error);
    return false;
  }
}

export function generateExpiresOnISOTimestamp(
  timeDiffMilliseconds: number | null,
): string | null {
  if (timeDiffMilliseconds === 0 || timeDiffMilliseconds === null) {
    return null; //no expiry
  }
  const currentTime = Date.now(); // Current time in milliseconds
  const expiresTime = new Date(currentTime + timeDiffMilliseconds); // Expiration time as a Date object
  return expiresTime.toISOString(); // Convert to ISO string
}
