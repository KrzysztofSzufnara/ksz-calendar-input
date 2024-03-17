import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { KKalendarInputComponent } from './k-kalendar-input/k-kalendar-input.component';
import {
  Form,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-root',
  providers: [KKalendarInputComponent],
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    KKalendarInputComponent,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  ngOnInit(): void {
    this.form.get('data')?.setValue('2024-03-10');
  }
  title = 'ksz-calendar-input';
  form = new FormGroup({
    //todo: change to Date()
    data: new FormControl(''),
  });

  onSubmit() {
    //alert('Alert: ' + this.form.getRawValue());
    console.log(this.form.getRawValue());
  }
}
