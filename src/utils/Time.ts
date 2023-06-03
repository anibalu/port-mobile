export default function getTimeStamp(ISOTime: string | undefined) {
  if (!getTimeStamp) {
    return '';
  }
  const datetime = new Date(ISOTime);
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  if (datetime < midnight) {
    // This happened before today in current timezone
    return datetime.toLocaleDateString();
  } else {
    return datetime.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
