import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocialComponent } from '../social/social.component';
import { DataService } from '../../core/services/data.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, SocialComponent, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  constructor(private _DataService: DataService) {}

  phoneNumber: any;
  userEmail: any;
  userAddress: any;
  userLocation: any;
  footerLogo: any;

  ngOnInit(): void {
    this.getSettings();
  }

  getSettings(): void {
    this._DataService.getSetting().subscribe({
      next: (res) => {
        // console.log(res.data);

        const fLogo = res.data.find(
          (item: any) => item.option_key === 'footer_logo'
        );
        this.footerLogo = fLogo?.option_value[0];

        const contactPhone = res.data.find(
          (item: any) => item.option_key === 'primary_phone'
        );
        this.phoneNumber = contactPhone?.option_value[0];

        const contactEmail = res.data.find(
          (item: any) => item.option_key === 'notification_emails'
        );
        this.userEmail = contactEmail?.option_value[0];

        const contactaddress = res.data.find(
          (item: any) => item.option_key === 'address'
        );
        this.userAddress = contactaddress?.option_value[0];

        const contactMap = res.data.find(
          (item: any) => item.option_key === 'company_location_url'
        );
        const locationUrl = contactMap?.option_value[0];
        this.userLocation = this.isValidGoogleMapLink(locationUrl)
          ? locationUrl
          : 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3127.790432704427!2d31.247525999999997!3d29.970205300000003!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x145847655238678d%3A0x97e9238e398fe44a!2sGolden%20Ocean%20Travel%20Service%20%22GOTS%22!5e1!3m2!1sen!2seg!4v1764502029465!5m2!1sen!2seg';

        // console.log(this.userLocation);
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
