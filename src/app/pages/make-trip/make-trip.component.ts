import { Component, OnInit, inject } from '@angular/core';
import {
  FormBuilder,
  Validators,
  FormControl,
  FormGroup,
  FormArray,
} from '@angular/forms';
import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { MaketripService } from '../../core/services/maketrip.service';
import { BookingService } from '../../core/services/booking.service';
import { ToastrService } from 'ngx-toastr';
import { MatStepperModule } from '@angular/material/stepper';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import {
  MatFormFieldControl,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-make-trip',
  standalone: true,
  imports: [
    MatStepperModule,
    MatRadioModule,
    MatSelectModule,
    MatSliderModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
  templateUrl: './make-trip.component.html',
  styleUrl: './make-trip.component.scss',
})
export class MakeTripComponent implements OnInit {
  constructor(
    private _MaketripService: MaketripService,
    private _BookingService: BookingService,
    private toaster: ToastrService
  ) {}

  firstFormGroup!: FormGroup;
  secondFormGroup!: FormGroup;
  submitFormGroup!: FormGroup;

  monthList = [
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

  makeTripForm: any = {};
  countriesList: any[] = [];
  destinationList: any[] = [];
  minBudget: number = 0;
  maxBudget: number = 0;

  ngOnInit() {
    this.showCountries();

    this._MaketripService.getDestination().subscribe({
      next: (response) => {
        this.destinationList = response.data.data;
        // console.log(this.destinationList);
      },
      error: (err) => {
        // console.log(err.error.message);
      },
    });

    this.firstFormGroup = new FormGroup({
      destination: new FormControl(''),
    });

    this.secondFormGroup = new FormGroup({
      type: new FormControl('exact_time'),
      start_date: new FormControl(''),
      end_date: new FormControl(''),
      month: new FormControl(),
      days: new FormControl(''),
    });

    this.submitFormGroup = new FormGroup({
      first_name: new FormControl(''),
      last_name: new FormControl(''),
      email: new FormControl(''),
      nationality: new FormControl(''),
      phone_number: new FormControl(''),
      adults: new FormControl(0),
      children: new FormControl(0),
      infants: new FormControl(0),
      additional_notes: new FormControl(''),
      min_person_budget: new FormControl(5000),
      max_person_budget: new FormControl(20000),
      flight_offer: new FormControl(0),
    });

    this.onBudgetChange();
  }

  increment(type: string) {
    let currentValue = this.submitFormGroup.get(type)?.value || 0;
    if (currentValue < 12) {
      this.submitFormGroup.get(type)?.setValue(currentValue + 1);
    }
  }

  decrement(type: string) {
    let currentValue = this.submitFormGroup.get(type)?.value || 0;
    if (currentValue > 0) {
      this.submitFormGroup.get(type)?.setValue(currentValue - 1);
    }
  }

  submitForm() {
    if (this.submitFormGroup.status == 'VALID') {
      this.makeTripForm = {
        ...this.firstFormGroup.value,
        ...this.secondFormGroup.value,
        ...this.submitFormGroup.value,
      };

      this._MaketripService.sendDataTrip(this.makeTripForm).subscribe({
        next: (response) => {
          this.toaster.success(response.message);
        },
        error: (err) => {
          this.toaster.error(err.error.message);
        },
      });
    }
  }

  onBudgetChange() {
    this.minBudget = this.submitFormGroup.get('min_person_budget')?.value;
    this.maxBudget = this.submitFormGroup.get('max_person_budget')?.value;
  }

  isDateTypeSelected(value: string): boolean {
    return this.secondFormGroup.get('type')?.value === value;
  }

  onToursChange(event: any) {
    this.firstFormGroup.patchValue({ destination: event.target.value });
  }

  showCountries(): void {
    this._BookingService.getCountries().subscribe({
      next: (response) => {
        this.countriesList = response.data;
      },
    });
  }
}
