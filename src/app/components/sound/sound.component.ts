import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  Component,
  Inject,
  OnInit,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';

@Component({
  selector: 'app-sound',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sound.component.html',
  styleUrls: ['./sound.component.scss'], // <- plural
})
export class SoundComponent implements OnInit, OnDestroy {
  status = 'Waiting for mouse movement...';
  disableButton = false;
  started = false;

  private audio?: HTMLAudioElement;
  private mouseMoveHandler = this.onFirstMouseMove.bind(this);
  private readonly isBrowser: boolean;

  constructor(@Inject(PLATFORM_ID) platformId: object) {
    this.isBrowser = isPlatformBrowser(platformId);

    // Only touch browser APIs in the browser
    if (this.isBrowser) {
      this.audio = new Audio('assets/sound/welcome-traveler.mp3'); // rooted path
      this.audio.preload = 'auto';
      this.audio.addEventListener('ended', () => {
        this.status = 'Audio finished playing.';
        this.disableButton = true;
      });
    }
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      window.addEventListener('mousemove', this.mouseMoveHandler, {
        once: true,
      });
    }
  }

  ngOnDestroy(): void {
    if (this.isBrowser) {
      window.removeEventListener('mousemove', this.mouseMoveHandler);
      this.audio?.pause();
      this.audio = undefined;
    }
  }

  private onFirstMouseMove(): void {
    if (!this.started) {
      this.started = true;
      this.status = 'Starting in 2 seconds...';
      setTimeout(() => this.playOnce(), 100);
    }
  }

  private playOnce(): void {
    if (!this.audio) return; // not in browser
    this.audio
      .play()
      .then(() => (this.status = 'Playing audio...'))
      .catch((err) => {
        // Browsers may block autoplay; allow manual play
        this.status = `Failed to play audio: ${
          err?.message ?? 'autoplay blocked'
        }. Tap the button.`;
        this.disableButton = false;
      });
  }

  // Manual play button handler
  playAudio(): void {
    if (!this.disableButton) this.playOnce();
  }
}
