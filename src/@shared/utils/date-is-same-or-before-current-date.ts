import dayjs from 'dayjs';

export function dateIsSameOrBeforeCurrentDate(date: Date): boolean {
    const currentDate = dayjs();
    return currentDate.isBefore(date, 'day') || currentDate.isSame(date, 'day');
}
