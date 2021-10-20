import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Car } from '../interfaces/car';

@Injectable({
  providedIn: 'root'
})
export class CarService {
  private apiUrl = "api/cars/";
  constructor(private httpClient: HttpClient) { }

  getCars(): Observable<Car[]> {
    return this.httpClient.get<Car[]>(this.apiUrl);
  }

  isLicenseUnique(licenceNumber: string): Observable<boolean> {
    return this.httpClient.get<Car[]>(this.apiUrl+`?licenceNumber=${licenceNumber}`).pipe(
      map(data => {
        if(data.length === 0)
          return true;

        return false;
      })
    );
  }

  getOwnerCars(ownerId: number): Observable<Car[]> {
    return this.httpClient.get<Car[]>(this.apiUrl + `?ownerId=${ownerId}`);
  }

  addCar(car: Car): Observable<Car> {
    return this.httpClient.post<Car>(this.apiUrl, car);
  }

  deleteCar(id: number) {
    return this.httpClient.delete<number>(this.apiUrl + id);
  }

  updateCar(car: Car): Observable<Car> {
    return this.httpClient.put<Car>(this.apiUrl, car);
  }
}
