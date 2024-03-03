import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import DayOfWeek, { WeekOfMonth } from './days-weeks.interface';
import { CommonModule } from '@angular/common';
import { Observable, Subject, Subscription } from 'rxjs';

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
  @Input() startDate?: Date;

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
  private readonly subscribe$ = new Subscription();
  ngOnDestroy(): void {
    this.subscribe$.unsubscribe();
  }
  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.dirtyInput = false;
    console.log('On Init');
    this.subscribe$.add(
      this.setDate?.subscribe((value) => {
        this.startDate = this.tryParseDate(value);
        this.generateDate();
        this.cdr.detectChanges();

        console.log('setDate', value);
      })
    );

    //if (!this.startDate) this.startDate = new Date();
  }

  tryParseDate(date: Date) {
    const newdate = new Date(date);
    console.log('tryParseDate', newdate.getTime());

    if (!isNaN(newdate.getTime())) {
      //newdate.setHours(0, 0, 0, 0);
      //setTimeout(() => {
      this.dirtyInput = false;
      this.currentMonth = newdate.getMonth() || 0;
      this.cdr.detectChanges();
      console.log('ok', this.dirtyInput);
      //});

      return newdate;
    } else {
      //setTimeout(() => {
      this.dirtyInput = true;

      this.cdr.detectChanges();
      console.log('bad', this.dirtyInput);
      //});
    }
    return undefined;
  }

  private calculateDaysCountInMonth(date: Date): number {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return d.getDate();
  }

  generateDate() {
    this.weeks = [];
    const firstDay = new Date(this.startDate!).getDay();
    const prevMonth = this.calculateDaysCountInMonth(
      new Date(this.startDate!.getFullYear(), this.startDate!.getMonth() - 1, 0)
    );
    const currentMonth = this.calculateDaysCountInMonth(this.startDate!);
    console.log('generateDate', this.startDate, firstDay);

    for (let i = 0; i < 6; i++) {
      const week = <WeekOfMonth>{
        weekNumber: i,
        days: [],
      };

      for (let j = 0; j < 7; j++) {
        let disable = false;
        let dateDay = i * 7 + j - firstDay + 1;
        if (dateDay < 1) {
          dateDay = prevMonth + dateDay;
          disable = true;
        } else if (dateDay > currentMonth) {
          dateDay = dateDay - currentMonth;
          disable = true;
        }
        const today = this.startDate === new Date() ? true : false;
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
        };
        week.days.push(day);
      }
      this.weeks.push(week);
    }
    console.log(this.weeks);
  }
}
