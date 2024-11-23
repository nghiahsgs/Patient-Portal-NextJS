import { format, zonedTimeToUtc } from 'date-fns-tz';

export const TIME_ZONE = process.env.TIME_ZONE || 'America/New_York';

export const formatDate = (date: string | Date, formatStr: string = 'MMM dd, yyyy') => {
  const zonedDate = zonedTimeToUtc(new Date(date), TIME_ZONE);
  return format(zonedDate, formatStr, { timeZone: TIME_ZONE });
};

export const formatTime = (time: string | Date) => {
  const zonedTime = zonedTimeToUtc(new Date(time), TIME_ZONE);
  return format(zonedTime, 'HH:mm', { timeZone: TIME_ZONE });
};

export const formatDateTime = (date: string | Date) => {
  const zonedDate = zonedTimeToUtc(new Date(date), TIME_ZONE);
  return format(zonedDate, 'MMM dd, yyyy HH:mm', { timeZone: TIME_ZONE });
};

export const formatTimeRange = (startTime: string | Date, endTime: string | Date) => {
  const zonedStartTime = zonedTimeToUtc(new Date(startTime), TIME_ZONE);
  const zonedEndTime = zonedTimeToUtc(new Date(endTime), TIME_ZONE);
  
  return `${format(zonedStartTime, 'HH:mm', { timeZone: TIME_ZONE })} - ${format(zonedEndTime, 'HH:mm', { timeZone: TIME_ZONE })}`;
};