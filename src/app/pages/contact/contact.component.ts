import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { SafeUrlPipe } from '../../core/pipes/safe-url.pipe';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    SafeUrlPipe,
    PartnerSliderComponent,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  constructor(
    private _DataService: DataService,
    private toaster: ToastrService
  ) {}

  countryList: any[] = [];
  phoneNumber: any;
  userEmail: any;
  userAddress: any;
  userLocation: any;

  ngOnInit(): void {
    this.getCountries();
    this.getSettings();
  }

  contactForm: FormGroup = new FormGroup({
    name: new FormControl(''),
    email: new FormControl(''),
    phone: new FormControl(''),
    country: new FormControl(''),
    subject: new FormControl(''),
    message: new FormControl(''),
  });

  getContactData(): void {
    // console.log(this.contactForm.value);

    this._DataService.contactData(this.contactForm.value).subscribe({
      next: (response) => {
        console.log(response);
        this.toaster.success(response.message);
      },
      error: (err) => {
        // console.log(err.error);
        this.toaster.error(err.error.message);
      },
    });
    this.contactForm.reset();
  }

  getCountries() {
    this._DataService.getCountries().subscribe({
      next: (response) => {
        console.log(response.data);
        this.countryList = response.data;
      },
    });
  }

  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        // console.log(res.data);

        const contactPhone = res.data.find(
          (item: any) => item.option_key === 'CONTACT_PHONE_NUMBER'
        );
        this.phoneNumber = contactPhone?.option_value[0];

        const contactEmail = res.data.find(
          (item: any) => item.option_key === 'email_address'
        );
        this.userEmail = contactEmail?.option_value[0];

        const contactaddress = res.data.find(
          (item: any) => item.option_key === 'address'
        );
        this.userAddress = contactaddress?.option_value[0];

        const contactMap = res.data.find(
          (item: any) => item.option_key === 'company_location_url'
        );
        this.userLocation = contactMap?.option_value[0];
        // console.log(this.userLocation);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }
}
