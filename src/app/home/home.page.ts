import { Component, AfterContentInit, OnInit, ViewChild } from '@angular/core';
import { LoadingService } from '../service/loading.service';
import { TravelService } from '../service/rakuten/travel.service';
import { $ } from 'protractor';

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
  address: string;

  latLng: any = new google.maps.LatLng({lat:35.681236, lng: 139.767125});
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

        google.maps.event.addListener(marker, 'click', ((event) => {
          let address = this.address === undefined ? this.latLng : this.address;
          this.addRoute(address, latlng, marker, hotels[i]);
        }));

        this.markers[i] = marker;
      }
    }, error => {

    });

    this.loading.dismiss();
  }

  addRoute(origin, destination, marker, hotel, travelMode='WALKING') {
    let directionsDisplay = this.directionsDisplay;
    
    this.directionsService.route({
          origin: origin,
          destination: destination,
          travelMode: travelMode, // DRIVING, BICYCLING, TRANSIT, WALKING
    }, function (response, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            directionsDisplay.setDirections(response);

            let infoWindowContent = '<div id="content" style="height:100px;">'+
            '<h4><a href="'+hotel.hotel[0].hotelBasicInfo.hotelInformationUrl+'">'+hotel.hotel[0].hotelBasicInfo.hotelName+'</a></h4>' +
            '<p>ホテルまでの距離：'+response.routes[0].legs[0].distance.text+'</p>' +
            '<h5>ルート</h5>';
            let steps = response.routes[0].legs[0].steps;
            let cnt = steps.length;
            for(let i=0; i<cnt; i++) {
              infoWindowContent += '<p>'+steps[i].instructions+'</p>';
            }            
            infoWindowContent += '</div>';

            let infoWindow = new google.maps.InfoWindow({
              content: infoWindowContent
            });
    
            infoWindow.open(this.map, marker);
        } else {
            window.alert('ルートが取得できませんでした。');
            //window.alert('Directions request failed due to ' + status);
        }
    });
  }

  onSearch() {
    this.geocoder.geocode({'address': this.address, 'region': 'ja'}, ((results, status) => {
      if(status == google.maps.GeocoderStatus.OK) {
        this.map.setCenter(results[0].geometry.location);
        this.showMarkers();
      }
    }));
  }
}
