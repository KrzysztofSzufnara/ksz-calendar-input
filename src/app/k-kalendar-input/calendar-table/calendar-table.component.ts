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
  weeks: WeekOfMonth[] = [];
  //  month = 3;
  dirtyInput: boolean | undefined;
  @Input() showWeeks: boolean = false;
  @Input() inputDate?: Date;

  @Output() dateSelected = new EventEmitter<Date>();
  @Input() setDate?: Observable<any>;
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
  ngOnDestroy(): void {
    this.subscribe$.unsubscribe();
  }
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.dirtyInput = false;
    //console.log('On Init');
    this.subscribe$.add(
      this.setDate?.subscribe((value) => {
        this.inputDate = this.tryParseDate(value);
        this.generateDate();
        this.cdr.detectChanges();

        //console.log('setDate', value);
      })
    );

    //if (!this.startDate) this.startDate = new Date();
  }

  tryParseDate(date: Date | null | undefined) {
    const newdate = date && new Date(date);
    if (!newdate) {
      console.warn(`tryParseDate: invalid date: ${date}`);
      return undefined;
    }
    if (isNaN(newdate.getTime())) {
      console.warn(`tryParseDate: invalid date: ${date}`);
      return undefined;
    }
    this.dirtyInput = false;
    this.currentMonth = newdate.getMonth() || 0;
    this.cdr.detectChanges();
    return newdate;
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
    const firstDay = new Date(
      this.inputDate!.getFullYear(),
      this.inputDate!.getMonth(),
      1
    ).getDay();

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

        const holiday = j == 0 || j == 6;
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
      this.weeks.push(week);
    }
    // console.log(this.weeks);
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
