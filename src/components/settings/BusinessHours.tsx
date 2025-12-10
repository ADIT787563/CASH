
"use client";

import { useState, useEffect } from "react";
import {
    Clock,
    Plus,
    Trash2,
    Copy,
    AlertCircle,
    CheckCircle2,
    Calendar
} from "lucide-react";
import {
    BusinessHoursConfig,
    WeeklyHours,
    DayOfWeek,
    DAYS_OF_WEEK,
    DAY_LABELS,
    Shift,
    DEFAULT_SHIFT,
    validateDaySchedule,
    DEFAULT_WEEKLY_HOURS
} from "@/types/business-hours";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BusinessHoursProps {
    initialData?: string; // JSON string from DB
    onChange: (data: string) => void;
    disabled?: boolean;
}

export function BusinessHours({ initialData, onChange, disabled }: BusinessHoursProps) {
    const [hours, setHours] = useState<WeeklyHours>(DEFAULT_WEEKLY_HOURS);
    const [timezone, setTimezone] = useState("Asia/Kolkata"); // Default, could be prop
    const [errors, setErrors] = useState<Record<DayOfWeek, string | null>>({
        mon: null, tue: null, wed: null, thu: null, fri: null, sat: null, sun: null
    });

    // Load initial data
    useEffect(() => {
        if (initialData) {
            try {
                const parsed = JSON.parse(initialData) as BusinessHoursConfig;
                if (parsed.hours) setHours(parsed.hours);
                if (parsed.timezone) setTimezone(parsed.timezone);
            } catch (e) {
                console.error("Failed to parse business hours", e);
            }
        }
    }, [initialData]);

    // Propagate changes
    useEffect(() => {
        const config: BusinessHoursConfig = { timezone, hours };
        onChange(JSON.stringify(config));
    }, [hours, timezone, onChange]);

    const handleToggleDay = (day: DayOfWeek) => {
        setHours(prev => {
            const isOpen = !prev[day].isOpen;
            const shifts = isOpen && prev[day].shifts.length === 0
                ? [{ ...DEFAULT_SHIFT, id: crypto.randomUUID() }]
                : prev[day].shifts;

            return {
                ...prev,
                [day]: { ...prev[day], isOpen, shifts }
            };
        });
    };

    const handleAddShift = (day: DayOfWeek) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                shifts: [...prev[day].shifts, { ...DEFAULT_SHIFT, id: crypto.randomUUID() }]
            }
        }));
    };

    const handleRemoveShift = (day: DayOfWeek, shiftId: string) => {
        setHours(prev => ({
            ...prev,
            [day]: {
                ...prev[day],
                shifts: prev[day].shifts.filter(s => s.id !== shiftId)
            }
        }));
    };

    const handleShiftChange = (day: DayOfWeek, shiftId: string, field: 'start' | 'end', value: string) => {
        setHours(prev => {
            const newShifts = prev[day].shifts.map(s =>
                s.id === shiftId ? { ...s, [field]: value } : s
            );

            // Inline validation
            const error = validateDaySchedule(newShifts);
            setErrors(e => ({ ...e, [day]: error }));

            return {
                ...prev,
                [day]: { ...prev[day], shifts: newShifts }
            };
        });
    };

    const copyToWeekdays = () => {
        // Copy Monday's schedule to Tue-Fri
        setHours(prev => ({
            ...prev,
            tue: { ...prev.mon, shifts: prev.mon.shifts.map(s => ({ ...s, id: crypto.randomUUID() })) },
            wed: { ...prev.mon, shifts: prev.mon.shifts.map(s => ({ ...s, id: crypto.randomUUID() })) },
            thu: { ...prev.mon, shifts: prev.mon.shifts.map(s => ({ ...s, id: crypto.randomUUID() })) },
            fri: { ...prev.mon, shifts: prev.mon.shifts.map(s => ({ ...s, id: crypto.randomUUID() })) },
        }));
        toast.success("Monday's schedule applied to Tue-Fri");
    };

    return (
        <div className="space-y-6">
            {/* Header / Global Controls */}
            {/* Header / Global Controls removed as per request */}

            {/* Days List */}
            <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                    const schedule = hours[day];
                    const error = errors[day];

                    return (
                        <div
                            key={day}
                            className={cn(
                                "group p-4 rounded-xl border transition-all duration-200",
                                schedule.isOpen ? "bg-background border-border shadow-sm" : "bg-muted/20 border-transparent opacity-80"
                            )}
                        >
                            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">

                                {/* Day Switch */}
                                <label className="w-32 flex-shrink-0 flex items-center gap-3 cursor-pointer">
                                    <div className="relative inline-flex items-center">
                                        <input
                                            type="checkbox"
                                            className="sr-only peer"
                                            checked={schedule.isOpen}
                                            onChange={() => handleToggleDay(day)}
                                            disabled={disabled}
                                            aria-label={`Toggle ${DAY_LABELS[day]}`}
                                        />
                                        <div className="w-11 h-6 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                    </div>
                                    <span className={cn("font-medium", schedule.isOpen ? "text-foreground" : "text-muted-foreground")}>
                                        {DAY_LABELS[day]}
                                    </span>
                                </label>

                                {/* Shifts or Closed Label */}
                                <div className="flex-1 w-full sm:w-auto">
                                    {!schedule.isOpen ? (
                                        <span className="text-sm text-muted-foreground font-medium italic px-2">Closed</span>
                                    ) : (
                                        <div className="space-y-2">
                                            {schedule.shifts.map((shift, index) => (
                                                <div key={shift.id} className="flex items-center gap-2 flex-wrap">
                                                    <div className="flex items-center gap-2 bg-muted/30 p-1.5 rounded-lg border border-border/50">
                                                        <input
                                                            type="time"
                                                            value={shift.start}
                                                            onChange={(e) => handleShiftChange(day, shift.id, 'start', e.target.value)}
                                                            disabled={disabled}
                                                            className="bg-transparent text-sm font-medium focus:outline-none w-24 p-1 text-center dark:[color-scheme:dark]"
                                                            aria-label={`Start time for ${DAY_LABELS[day]}`}
                                                        />
                                                        <span className="text-muted-foreground text-xs">to</span>
                                                        <input
                                                            type="time"
                                                            value={shift.end}
                                                            onChange={(e) => handleShiftChange(day, shift.id, 'end', e.target.value)}
                                                            disabled={disabled}
                                                            className="bg-transparent text-sm font-medium focus:outline-none w-24 p-1 text-center dark:[color-scheme:dark]"
                                                            aria-label={`End time for ${DAY_LABELS[day]}`}
                                                        />
                                                    </div>

                                                    {/* Remove Shift Button (only if >1 shift) */}
                                                    {schedule.shifts.length > 1 && (
                                                        <button
                                                            onClick={() => handleRemoveShift(day, shift.id)}
                                                            disabled={disabled}
                                                            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                                                            title={`Remove shift from ${DAY_LABELS[day]}`}
                                                            aria-label={`Remove shift from ${DAY_LABELS[day]}`}
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    )}
                                                </div>
                                            ))}

                                            {/* Add Shift Button */}
                                            {/* Add Shift Button Removed */}
                                        </div>
                                    )}
                                </div>

                                {/* Validation Error */}
                                {schedule.isOpen && error && (
                                    <div className="text-xs text-destructive flex items-center gap-1 animate-in fade-in slide-in-from-left-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        {error}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
