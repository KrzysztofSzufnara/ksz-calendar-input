import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import DayOfWeek, { WeekOfMonth } from './days-weeks.interface';
import { CommonModule } from '@angular/common';
import { Observable, Subject, Subscription } from 'rxjs';
import { DateHelper } from '../helpers/date.helper';

@Component({
  selector: 'app-calendar-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-table.component.html',
  styleUrl: './calendar-table.component.scss',
  //changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarTableComponent implements OnInit, OnDestroy {
  //  month = 3;
  // Inputs
  @Input() showWeeks: boolean = false;
  @Input() inputDate?: Date;

  @Input() setDate?: Observable<any>;
  @Input() firstDayOfWeek: number = 0;
  @Input() showBar = false;
  @Input()
  emptyDateBehavior: 'today' | 'year' = 'today';

  // Outputs
  @Output() dateSelected = new EventEmitter<Date | undefined>();

  // Private
  dirtyInput: boolean | undefined;
  weeks: WeekOfMonth[] = [];

  currentMonth: number = 0;
  monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  dayNames = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  currentYear = 0;

  mode: 'day' | 'month' | 'year' = 'day';
  years: number[] = [];

  private readonly subscribe$ = new Subscription();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.dirtyInput = false;
    this.subscribe$.add(
      this.setDate?.subscribe((value) => {
        this.inputDate = this.tryParseDate(value);

        //TODO: fix - remove this from here
        if (this.inputDate === undefined) {
          if (this.emptyDateBehavior === 'year') {
            this.currentYear = new Date().getFullYear();
            this.enterYearSelector();
            this.mode = 'year';
          } else {
            this.inputDate = new Date();
          }
        }
        //TODO: fix - remove this from here

        this.generateDate();
        this.cdr.detectChanges();
      })
    );
    if (this.firstDayOfWeek > 6) this.firstDayOfWeek = 0;

    if (this.firstDayOfWeek !== 0) {
      this.rollDayNames();
    }
    //if (!this.startDate) this.startDate = new Date();
  }
  ngOnDestroy(): void {
    this.subscribe$.unsubscribe();
  }

  tryParseDate(date: Date | null | undefined): Date | undefined {
    const parsedDate = date && new Date(date);
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      //this.dirtyInput = true;
      return undefined;
    }
    this.dirtyInput = false;
    this.currentMonth = parsedDate.getMonth();
    this.cdr.detectChanges();
    return parsedDate;
  }

  private calculateDaysCountInMonth(date: Date): number {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return d.getDate();
  }

  generateDate() {
    console.log('generateDate', this.inputDate);
    if (this.tryParseDate(this.inputDate!) === undefined) {
      return;
    }

    this.weeks = [];
    const firstDay =
      new Date(
        this.inputDate!.getFullYear(),
        this.inputDate!.getMonth(),
        1
      ).getDay() - this.firstDayOfWeek;
    const weekendDayOne = 7 - this.firstDayOfWeek;
    const weekendDayTwo = 6 - this.firstDayOfWeek;

    let prevMonthDate = this.inputDate!.getMonth();
    this.currentYear = this.inputDate!.getFullYear();
    let yearDiff = 0;
    const currentDate = DateHelper.localToUtc(new Date())
      .toISOString()
      .slice(0, 10);
    //console.log('currentDate', currentDate);

    if (prevMonthDate === 0) {
      yearDiff = 1;
      prevMonthDate = 12;
    }
    //console.log('generate date', yearDiff, prevMonthDate);

    const prevMonth = this.calculateDaysCountInMonth(
      new Date(this.currentYear - yearDiff, prevMonthDate, 0)
    );
    const currentMonthDaysCount = this.calculateDaysCountInMonth(
      this.inputDate!
    );
    //console.log('generateDate', this.startDate, firstDay);
    //todo: policzyć startowy tydzień

    for (let i = 0; i < 6; i++) {
      //let weekNum = weekNumber + i;

      const week = <WeekOfMonth>{
        weekNumber: i,
        days: [],
      };

      for (let j = 0; j < 7; j++) {
        let month = this.currentMonth;
        let yearModifier = 0;
        let disable = false;
        let dateDay = i * 7 + j - firstDay + 1;
        if (dateDay < 1) {
          dateDay = prevMonth + dateDay;
          disable = true;
          month = this.currentMonth - 1;
          if (month < 0) {
            month = 11;
            yearModifier = -1;
          }
        } else if (dateDay > currentMonthDaysCount) {
          dateDay = dateDay - currentMonthDaysCount;
          disable = true;
          month = this.currentMonth + 1;
          if (month > 11) {
            month = 0;
            yearModifier = 1;
          }
        }

        const date = new Date(this.currentYear + yearModifier, month, dateDay);
        const today =
          DateHelper.localToUtc(date).toISOString().slice(0, 10) === currentDate
            ? true
            : false;

        const holiday = j == weekendDayOne || j == weekendDayTwo;
        //|| j == 6;
        const day = <DayOfWeek>{
          day: dateDay,
          holiday: holiday && !disable,
          selected: false,
          disabled: disable,
          today: today,
          date: date,
        };
        week.days.push(day);
      }
      week.weekNumber = this.getWeekNumber(week.days[0].date);
      this.weeks.push(week);
    }
    // console.log(this.weeks);
  }

  rollDayNames() {
    const len = this.dayNames.length;
    this.dayNames.push(
      ...this.dayNames.splice(0, ((this.firstDayOfWeek % len) + len) % len)
    );
  }
  getWeekNumber(date: Date): number {
    const tempDate = new Date(date.valueOf());
    const dayNum = (date.getDay() + 6) % 7;
    tempDate.setDate(tempDate.getDate() - dayNum + 3);
    const firstThursday = tempDate.valueOf();
    tempDate.setMonth(0, 1);
    if (tempDate.getDay() !== 4) {
      tempDate.setMonth(0, 1 + ((4 - tempDate.getDay() + 7) % 7));
    }
    return 1 + Math.ceil((firstThursday - tempDate.valueOf()) / 604800000); // 604800000 = number of milliseconds in a week
  }
  clear() {
    this.inputDate = undefined;
    this.dateSelected.emit(this.inputDate);
  }
  setToday() {
    this.inputDate = new Date();
    this.generateDate();
    this.dateSelected.emit(this.inputDate);
  }
  nextMonth() {
    let month = this.currentMonth;
    month++;
    if (month > 11) {
      month = 0;
      this.currentYear++;
    }
    this.currentMonth = month;
    this.inputDate = new Date(this.currentYear, month, 1);
    this.generateDate();
  }
  prevMonth() {
    let month = this.currentMonth;
    month--;
    if (month < 0) {
      month = 11;
      this.currentYear--;
    }
    this.currentMonth = month;
    this.inputDate = new Date(this.currentYear, month, 1);
    this.generateDate();
  }
  selectDay(day: DayOfWeek) {
    console.log('Day selected', day.date);
    this.dateSelected.emit(day.date);
  }

  enterMonthSelector() {
    this.mode = 'month';
  }
  enterYearSelector() {
    this.years = [];
    for (let i = -3; i < 4; i++) {
      this.years.push(this.currentYear + i);
    }
    this.mode = 'year';
  }
  selectMonth(month: number) {
    this.currentMonth = month;
    this.inputDate = new Date(this.currentYear, this.currentMonth, 1);
    this.generateDate();
    this.mode = 'day';
  }

  selectYear(index: number) {
    this.currentYear = this.years[index];
    this.mode = 'month';
  }

  changeYears(num: number) {
    this.years.forEach((year, index) => {
      this.years[index] = year + num;
    });
    console.log('changeYears', this.years);
  }
}
