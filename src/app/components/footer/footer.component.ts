import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SocialComponent } from '../social/social.component';
import { DataService } from '../../core/services/data.service';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, SocialComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  constructor(private _DataService: DataService) {}

  phoneNumber: any;
  userEmail: any;
  userAddress: any;
  userLocation: any;

  ngOnInit(): void {
    this.getSettings();
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
