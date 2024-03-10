export default interface DayOfWeek {
  day: number;
  selected: boolean;
  disabled: boolean;
  today: boolean;
  holiday: boolean;
  date: Date;
}

export interface WeekOfMonth {
  weekNumber: number;
  days: DayOfWeek[];
}
