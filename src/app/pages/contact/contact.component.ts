import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { SafeUrlPipe } from '../../core/pipes/safe-url.pipe';
import { PartnerSliderComponent } from '../../components/partner-slider/partner-slider.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    RouterLink,
    ReactiveFormsModule,
    CommonModule,
    SafeUrlPipe,
    PartnerSliderComponent,
    TranslateModule,
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
  whatsappNumber: any;
  site_url: any;
  openTime: any;

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
        console.log('settings data', res.data);

        const contactPhone = res.data.find(
          (item: any) => item.option_key === 'primary_phone'
        );
        this.phoneNumber = contactPhone?.option_value[0];

        const whatsappNumber = res.data.find(
          (item: any) => item.option_key === 'WHATSAPP_PHONE_NUMBER'
        );
        this.whatsappNumber = whatsappNumber?.option_value[0];

        const contactEmail = res.data.find(
          (item: any) => item.option_key === 'notification_emails'
        );
        this.userEmail = contactEmail?.option_value[0];

        const contactaddress = res.data.find(
          (item: any) => item.option_key === 'address'
        );
        this.userAddress = contactaddress?.option_value[0];

        const urlSite = res.data.find(
          (item: any) => item.option_key === 'site_url'
        );
        this.site_url =
          urlSite?.option_value[0] || 'https://www.goldenoceantrvl.com';

        const openTime = res.data.find(
          (item: any) => item.option_key === 'open_time'
        );
        this.openTime =
          openTime?.option_value[0] || 'Mon - Sat (10.00AM - 05.30PM)';

        const contactMap = res.data.find(
          (item: any) => item.option_key === 'company_location_url'
        );
        const locationUrl = contactMap?.option_value[0];
        this.userLocation = this.isValidGoogleMapLink(locationUrl)
          ? locationUrl
          : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3127.790432704427!2d31.247525999999997!3d29.970205300000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145847655238678d%3A0x97e9238e398fe44a!2sGolden%20Ocean%20Travel%20Service%20%22GOTS%22!5e1!3m2!1sen!2seg!4v1764502029465!5m2!1sen!2seg';
        console.log(this.userLocation);
      },
      error: (err) => {
        // console.log(err);
      },
    });
  }

  isValidGoogleMapLink(url: string): boolean {
    if (!url) return false;

    // Check if the URL contains Google Maps domains
    const googleMapPatterns = [
      'maps.google.com',
      'www.google.com/maps',
      'google.com/maps',
    ];

    return googleMapPatterns.some((pattern) =>
      url.toLowerCase().includes(pattern)
    );
  }
}

// static settings data for testing
// const staticSettings = [

//   {
//     option_key: 'company_location_url',
//     option_value: [
//       'https://www.google.com/maps/place/Golden+Ocean+%26+Golden+Ocean+Tourism/@30.0666351,31.224163,17z/data=!3m1!4b1!4m6!3m5!1s0x14583fa60b21be71:0x8c9ad674cfb9e417!8m2!3d30.066631!4d31.2263517!16s%2Fg%2F11c400zkgw?entry=ttu&g_ep=EgoyMDI1MTEzMi4wIKXMDSoASAFQAw%3D%3D',
//     ],
//   },
//   {
//     option_key: 'address',
//     option_value: ['123 Main St, Anytown, USA'],
//   },
//   {
//     option_key: 'email_address',
//     option_value: ['info@goldenocean.com'],
//   },
//   {
//     option_key: 'CONTACT_PHONE_NUMBER',
//     option_value: ['+1234567890'],
//   },
//   {
//     option_key: 'WHATSAPP_PHONE_NUMBER',
//     option_value: ['+201000000000'],
//   },
//   {
//     option_key: 'site_title',
//     option_value: ['Golden Ocean & Golden Ocean Tourism'],
//   },
//   {
//     option_key: 'logo',
//     option_value: [
//       'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
//     ],
//   },
//   {
//     option_key: 'social_links',
//     option_value: [
//       {
//         name: 'Facebook',
//         url: 'https://www.facebook.com/goldenocean',
//       },
//       {
//         name: 'Twitter',
//         url: 'https://www.twitter.com/goldenocean',
//       },
//       {
//         name: 'Instagram',
//         url: 'https://www.instagram.com/goldenocean',
//       },
//       {
//         name: 'LinkedIn',
//         url: 'https://www.linkedin.com/company/goldenocean',
//       },
//       {
//         name: 'YouTube',
//         url: 'https://www.youtube.com/channel/UC_x5XG1OV2P6BVIhjj9pi-g',
//       },
//       {
//         name: 'Pinterest',
//         url: 'https://www.pinterest.com/goldenocean',
//       },
//     ],
//   },
//   {
//     option_key: 'open_time',
//     option_value: ['Monday - Friday: 9:00 AM - 5:00 PM'],
//   },
//   {
//     option_key: 'site_url',
//     option_value: ['https://www.goldenoceantrvl.com'],
//   },
// ];

const staticSettings: any[] = [
  {
    id: 12,
    option_key: 'social_links',
    option_value: [
      {
        type: 'facebook',
        url: 'https://www.facebook.com/GotsEG/',
      },
      {
        type: 'linked-in',
        url: 'https://www.linkedin.com/company/golden-ocean-travel-service-%E2%80%9Cgots%E2%80%9D',
      },
      {
        type: 'instagram',
        url: 'https://www.instagram.com/golden_ocean_trvl/',
      },
      {
        type: 'google-plus',
        url: 'https://share.google/2ulXzPWRyg5qkE10i',
      },
      {
        type: 'youtube',
        url: 'https://www.youtube.com/@GoldenOceanTravelServiceGOTS',
      },
    ],
    created_at: '2025-09-25T08:34:38.000000Z',
    updated_at: '2025-10-12T09:41:54.000000Z',
  },
  {
    id: 13,
    option_key: 'notification_emails',
    option_value: ['ahmednasr2589@gmail.com'],
    created_at: '2025-09-25T08:34:38.000000Z',
    updated_at: '2025-09-25T08:34:38.000000Z',
  },
  {
    id: 14,
    option_key: 'site_title',
    option_value: ['Golden Ocean Travel Service'],
    created_at: '2025-10-12T08:55:48.000000Z',
    updated_at: '2025-10-12T08:55:48.000000Z',
  },
  {
    id: 15,
    option_key: 'company_team',
    option_value: [],
    created_at: '2025-10-12T08:55:48.000000Z',
    updated_at: '2025-10-12T08:55:48.000000Z',
  },
  {
    id: 16,
    option_key: 'tiny_editor',
    option_value: [],
    created_at: '2025-10-12T08:55:48.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 17,
    option_key: 'logo',
    option_value: [
      'https://backend-goldenoceans.perfectsolutions4u.com/storage/media/mm/print logo.pdf (1).png',
    ],
    created_at: '2025-10-12T08:55:48.000000Z',
    updated_at: '2025-10-12T09:30:21.000000Z',
  },
  {
    id: 18,
    option_key: 'queue_monitor_ui',
    option_value: [],
    created_at: '2025-10-12T08:55:48.000000Z',
    updated_at: '2025-10-12T08:55:48.000000Z',
  },
  {
    id: 19,
    option_key: 'company_location_url',
    option_value: [],
    created_at: '2025-10-12T08:55:48.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 20,
    option_key: 'whatsapp_phone_number',
    option_value: ['0225262091'],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 21,
    option_key: 'address',
    option_value: ['0225262091'],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 22,
    option_key: 'primary_phone',
    option_value: ['0225262091'],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 23,
    option_key: 'contact_email',
    option_value: ['0225262091'],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 24,
    option_key: 'footer_text',
    option_value: ['0225262091'],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 25,
    option_key: 'footer_logo',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 26,
    option_key: 'favicon',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 27,
    option_key: 'custom_css',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 28,
    option_key: 'home_first_section_tours',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 29,
    option_key: 'home_second_section_tours',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 30,
    option_key: 'about_us',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 31,
    option_key: 'terms_and_conditions',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 32,
    option_key: 'privacy',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 33,
    option_key: 'banner_title',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 34,
    option_key: 'banner_description',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 35,
    option_key: 'banner_target_url',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 36,
    option_key: 'banner_extra',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 37,
    option_key: 'gallery',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 38,
    option_key: 'banner_gallery',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 39,
    option_key: 'our_group',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
  {
    id: 40,
    option_key: 'banner_image',
    option_value: [],
    created_at: '2025-11-30T11:55:47.000000Z',
    updated_at: '2025-11-30T11:55:47.000000Z',
  },
];
