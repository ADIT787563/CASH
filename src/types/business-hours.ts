
export type DayOfWeek = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun';

export const DAYS_OF_WEEK: DayOfWeek[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

export const DAY_LABELS: Record<DayOfWeek, string> = {
    mon: 'Monday',
    tue: 'Tuesday',
    wed: 'Wednesday',
    thu: 'Thursday',
    fri: 'Friday',
    sat: 'Saturday',
    sun: 'Sunday',
};

export interface Shift {
    id: string; // Unique ID for keying in UI
    start: string; // HH:MM 24-hour format
    end: string;   // HH:MM 24-hour format
}

export interface DaySchedule {
    isOpen: boolean;
    shifts: Shift[];
}

// Map of day -> schedule
export type WeeklyHours = Record<DayOfWeek, DaySchedule>;

export interface BusinessHoursConfig {
    timezone: string;
    hours: WeeklyHours;
}

// --- Validation Helpers ---

/**
 * Converts "HH:MM" string to minutes from midnight (0-1439)
 */
export function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Validates a single shift:
 * 1. Start < End
 * 2. Min duration (e.g. 15 mins)
 */
export function validateShift(shift: Shift): string | null {
    const startMins = timeToMinutes(shift.start);
    const endMins = timeToMinutes(shift.end);

    if (startMins >= endMins) {
        return "End time must be after start time";
    }

    // Optional: Enforce min duration
    if (endMins - startMins < 15) {
        return "Shift must be at least 15 minutes";
    }

    return null;
}

/**
 * Checked if two shifts overlap
 */
export function doShiftsOverlap(shiftA: Shift, shiftB: Shift): boolean {
    const startA = timeToMinutes(shiftA.start);
    const endA = timeToMinutes(shiftA.end);
    const startB = timeToMinutes(shiftB.start);
    const endB = timeToMinutes(shiftB.end);

    return startA < endB && startB < endA;
}

/**
 * Validates all shifts for a day
 */
export function validateDaySchedule(shifts: Shift[]): string | null {
    // Check individual shifts
    for (const shift of shifts) {
        const error = validateShift(shift);
        if (error) return error;
    }

    // Check overlaps
    for (let i = 0; i < shifts.length; i++) {
        for (let j = i + 1; j < shifts.length; j++) {
            if (doShiftsOverlap(shifts[i], shifts[j])) {
                return "Shifts cannot overlap";
            }
        }
    }

    return null;
}

// --- Defaults ---

export const DEFAULT_SHIFT: Shift = { id: 'default', start: '09:00', end: '17:00' };

export const DEFAULT_WEEKLY_HOURS: WeeklyHours = {
    mon: { isOpen: true, shifts: [{ ...DEFAULT_SHIFT, id: 'mon-1' }] },
    tue: { isOpen: true, shifts: [{ ...DEFAULT_SHIFT, id: 'tue-1' }] },
    wed: { isOpen: true, shifts: [{ ...DEFAULT_SHIFT, id: 'wed-1' }] },
    thu: { isOpen: true, shifts: [{ ...DEFAULT_SHIFT, id: 'thu-1' }] },
    fri: { isOpen: true, shifts: [{ ...DEFAULT_SHIFT, id: 'fri-1' }] },
    sat: { isOpen: true, shifts: [{ ...DEFAULT_SHIFT, id: 'sat-1' }] },
    sun: { isOpen: true, shifts: [{ ...DEFAULT_SHIFT, id: 'sun-1' }] },
};
