import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  forwardRef,
  inject,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormGroup,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { BehaviorSubject, Subject, debounceTime, noop, tap } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CalendarTableComponent } from './calendar-table/calendar-table.component';
import { DateHelper } from './helpers/date.helper';

@Component({
  selector: 'app-k-kalendar-input',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    CalendarTableComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './k-kalendar-input.component.html',
  styleUrl: './k-kalendar-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => KKalendarInputComponent),
      multi: true,
    },
  ],
})
export class KKalendarInputComponent implements ControlValueAccessor, OnInit {
  // @Input() fieldName?: string;
  //public value!: string;

  @Input() label: string = '';
  @Input() type = 'text';
  @Output() valueChange = new EventEmitter<string>();

  showCalendar = false;
  //@Input() parentForm?: FormGroup;
  // @Input() fieldName?: string;

  //public value!: string;
  formControl: FormControl = new FormControl<string>('');
  destroyRef: DestroyRef = inject(DestroyRef);

  // get formField(): FormControl {
  //   return this.parentForm?.get(this.fieldName!) as FormControl;
  // }

  constructor() {
    this.inputDate$ = new BehaviorSubject<string>('');
  }
  inputDate$?: BehaviorSubject<string>;
  public changed: (value: string) => void = () => {};

  public onChange(event: Event): void {
    const val: string = (event.target as HTMLInputElement).value;

    this.changed(val);
  }

  onTouch: () => void = noop;

  registerOnChange(fn: (value: string) => void): void {
    this.changed = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    isDisabled ? this.formControl.disable() : this.formControl.enable();
  }

  // writeValue(value: string): void {
  //   this.value = value;
  // }
  writeValue(value: string): void {
    this.formControl.setValue(value, { emitEvent: false });
  }

  openCalendar() {
    this.showCalendar = !this.showCalendar;
  }

  setDate(date: Date) {
    //console.log('emit date', new Date(date.setUTCHours(0, 0, 0, 0)));
    const now_utc = DateHelper.localToUtc(date);

    console.log('utc date', new Date(now_utc));

    const dateString = now_utc.toISOString().slice(0, 10);
    this.valueChange.emit(dateString);
    console.log('dateString', dateString);

    this.formControl.setValue(dateString, { emitEvent: true });
    this.showCalendar = false;
  }

  ngOnInit(): void {
    this.formControl.valueChanges
      .pipe(
        debounceTime(200),
        tap((value) => {
          this.inputDate$?.next(value);
          this.changed(value), console.log(value);
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();
  }
}
