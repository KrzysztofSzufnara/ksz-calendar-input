export default interface DayOfWeek {
  day: number;
  selected: boolean;
  disabled: boolean;
  today: boolean;
  holiday: boolean;
}

export interface WeekOfMonth {
  weekNumber: number;
  days: DayOfWeek[];
}
