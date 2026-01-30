import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ElementRef,
  ViewChild,
  AfterViewInit,
  ChangeDetectionStrategy,
  inject,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-location-map',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
      <div #mapContainer class="w-full h-48 bg-gray-100"></div>
      <a 
        [href]="googleMapsUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="flex items-center justify-center gap-2 w-full py-2.5 bg-brand-50 text-brand-600 text-sm font-medium hover:bg-brand-100 transition-colors"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
        </svg>
        View on Google Maps
      </a>
    </div>
  `,
})
export class LocationMapComponent implements AfterViewInit, OnChanges {
  @Input() latitude!: string;
  @Input() longitude!: string;
  @ViewChild('mapContainer') mapContainer!: ElementRef<HTMLDivElement>;

  private platformId = inject(PLATFORM_ID);
  private map: any = null;
  private marker: any = null;
  private L: any = null;

  get googleMapsUrl(): string {
    return `https://www.google.com/maps?q=${this.latitude},${this.longitude}`;
  }

  async ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      await this.initMap();
    }
  }

  async ngOnChanges(changes: SimpleChanges) {
    if ((changes['latitude'] || changes['longitude']) && this.map) {
      this.updateMapPosition();
    }
  }

  private async initMap() {
    if (!this.latitude || !this.longitude) return;

    // Dynamically import Leaflet (client-side only)
    const L = await import('leaflet');
    this.L = L.default || L;

    // Fix Leaflet's default icon path issue in bundled environments
    delete (this.L.Icon.Default.prototype as any)._getIconUrl;
    this.L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
      iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
      shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    });

    const lat = parseFloat(this.latitude);
    const lng = parseFloat(this.longitude);

    this.map = this.L.map(this.mapContainer.nativeElement, {
      zoomControl: true,
      scrollWheelZoom: false,
    }).setView([lat, lng], 15);

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
    }).addTo(this.map);

    this.marker = this.L.marker([lat, lng]).addTo(this.map);
    this.marker.bindPopup('Submission Location').openPopup();

    // Force map to recalculate size after render
    setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private updateMapPosition() {
    if (!this.L || !this.map || !this.latitude || !this.longitude) return;

    const lat = parseFloat(this.latitude);
    const lng = parseFloat(this.longitude);

    this.map.setView([lat, lng], 15);
    if (this.marker) {
      this.marker.setLatLng([lat, lng]);
    }
  }
}
