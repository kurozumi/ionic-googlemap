import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TravelService {

  applicationId: string = '1013629018051216306';
  affiliateId: string = '0406f0c4.c103f48c.0406f0c7.ac5602c3';

  constructor(public http: HttpClient) { }

  getHotels(lat, lng) {
    let httpParams = new HttpParams()
      .set('applicationId', this.applicationId)
      .set('affiliateId', this.affiliateId)
      .set('format', 'json')
      .set('latitude', lat)
      .set('longitude', lng)
      .set('datumType', '1');

    return this.http.get<{
      hotels: any
    }>('https://app.rakuten.co.jp/services/api/Travel/SimpleHotelSearch/20131024', {
      params: httpParams,
      responseType: 'json'
    });
  }
}
