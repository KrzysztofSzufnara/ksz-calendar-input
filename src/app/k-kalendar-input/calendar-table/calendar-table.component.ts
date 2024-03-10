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
  selectDay(day: DayOfWeek) {
    console.log('Day selected', day.date);
    this.dateSelected.emit(day.date);
  }
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
    console.log('currentDate', currentDate);

    if (prevMonthDate === 0) {
      yearDiff = 1;
      prevMonthDate = 12;
    }
    //console.log('generate date', prevYear, prevMonthDate);

    const prevMonth = this.calculateDaysCountInMonth(
      new Date(this.currentYear - yearDiff, prevMonthDate, 0)
    );
    const currentMonthDaysCount = this.calculateDaysCountInMonth(
      this.inputDate!
    );
    //console.log('generateDate', this.startDate, firstDay);

    for (let i = 0; i < 6; i++) {
      const week = <WeekOfMonth>{
        weekNumber: i,
        days: [],
      };
      let month = this.currentMonth;
      for (let j = 0; j < 7; j++) {
        let yearModifier = 0;
        let disable = false;
        let dateDay = i * 7 + j - firstDay + 1;
        if (dateDay < 1) {
          dateDay = prevMonth + dateDay;
          disable = true;
          month = this.currentMonth - 1;
        } else if (dateDay > currentMonthDaysCount) {
          dateDay = dateDay - currentMonthDaysCount;
          disable = true;
          month = this.currentMonth + 1;
        }

        const date = new Date(this.currentYear, month, dateDay);
        const today =
          DateHelper.localToUtc(date).toISOString().slice(0, 10) === currentDate
            ? true
            : false;

        // const DayOfWeek = new Date(
        //   this.startDate!.getFullYear(),
        //   this.startDate!.getMonth(),
        //   dateDay
        // ).getDay();
        // const holiday = DayOfWeek === 6 || DayOfWeek === 0 ? true : false;
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
    console.log(this.weeks);
  }
}
