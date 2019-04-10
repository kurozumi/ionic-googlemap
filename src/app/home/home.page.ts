import { Component, AfterContentInit, OnInit, ViewChild } from '@angular/core';
import { LoadingService } from '../service/loading.service';
import { TravelService } from '../service/rakuten/travel.service';

declare var google;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit, AfterContentInit {
  map: any;
  zoom: number = 14;
  markers: string[] = [];

  latLng: any = new google.maps.LatLng({lat:35.709438, lng: 139.731364});
  geocoder:any = new google.maps.Geocoder();
  directionsService:any = new google.maps.DirectionsService();
  directionsDisplay:any = new google.maps.DirectionsRenderer();

  @ViewChild("mapElement") mapElement;

  constructor(
    public loading: LoadingService,
    public travel: TravelService
  ) {

  }

  ngOnInit(): void {
  }

  ngAfterContentInit(): void {
    let mapOptions = {
      zoom: this.zoom,
      center: this.latLng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
      disableDefaultUI: false,
      mapTypeControl: false,
      clickableIcons: false,
      mapTypeControlOptions: {mapTypeIds: [
              'orignalType',
              google.maps.MapTypeId.ROADMAP
          ]} //表示するマップタイプ
    };

    this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);

    this.showMarkers();
    this.directionsDisplay.setMap(this.map);

    google.maps.event.addDomListener(this.map, 'dragend', (() => {
      this.showMarkers();
    }));
  }

  showMarkers() {
    this.loading.present();

    this.travel.getHotels(this.map.getCenter().lat(), this.map.getCenter().lng()).subscribe(data => {
      let hotels = data.hotels;
      for(let i = 0; i < hotels.length; i++) {
        let latlng = new google.maps.LatLng(
          hotels[i].hotel[0].hotelBasicInfo.latitude,
          hotels[i].hotel[0].hotelBasicInfo.longitude
        )

        let marker = new google.maps.Marker({
          position: latlng,
          title: hotels[i].hotel[0].hotelBasicInfo.hotelName,
          map: this.map
        });
        
        this.addRouteListener(marker, latlng);
        this.markers[i] = marker;
      }
    }, error => {

    });

    this.loading.dismiss();
  }

  addRouteListener(marker, latlng) {
    google.maps.event.addListener(marker, 'click', ((event) => {
      this.getRoute(this.map.getCenter(), latlng);
    }));
  }

  getRoute(origin, destination, travelMode='WALKING') {
    let directionsDisplay = this.directionsDisplay;
    let map = directionsDisplay.getMap();
    
    this.directionsService.route({
          origin: origin,
          destination: destination,
          travelMode: travelMode, // DRIVING, BICYCLING, TRANSIT, WALKING
    }, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);
        } else {
            window.alert('ルートが取得できませんでした。');
            //window.alert('Directions request failed due to ' + status);
        }
    });
  }

  onSearch(event: any) {
    let address = event.target.value;
    this.geocoder.geocode({'address': address, 'region': 'ja'}, ((results, status) => {
      if(status == google.maps.GeocoderStatus.OK) {
        this.map.setCenter(results[0].geometry.location);
        this.showMarkers();
      }
    }));
  }
}
