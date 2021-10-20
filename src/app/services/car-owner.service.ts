import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Owner } from '../interfaces/owner';

@Injectable({
  providedIn: 'root'
})
export class CarOwnerService {
  private apiUrl = "api/owners/";
  constructor(private httpClient: HttpClient) { }

  getOwners(): Observable<Owner[]> {
    return this.httpClient.get<Owner[]>(this.apiUrl);
  }

  getOwner(id: number): Observable<Owner> {
    return this.httpClient.get<Owner>(this.apiUrl + id);
  }

  addOwner(owner: Owner): Observable<Owner> {
    return this.httpClient.post<Owner>(this.apiUrl, owner);
  }

  deleteOwner(id: number) {
    return this.httpClient.delete<number>(this.apiUrl + id);
  }

  updateOwner(owner: Owner): Observable<Owner> {
    return this.httpClient.put<Owner>(this.apiUrl, owner);
  }
}
