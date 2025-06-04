import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IntegralRequest {
  function_string: string;
  start_x: number;
  end_x: number;
}

export interface IntegralResponse {
  latex_expression: string;
  area: number;
  function_points: {x: number, y: number}[];
  error?: string;
}

@Injectable({
  providedIn: 'root'
})
export class IntegralService {
  private apiUrl = 'https://area-py-backend.onrender.com/';

  constructor(private http: HttpClient) { }

  testConnection(): Observable<any> {
    return this.http.get(`${this.apiUrl}/test`);
  }

  calculateIntegral(request: IntegralRequest): Observable<IntegralResponse> {
    return this.http.post<IntegralResponse>(`${this.apiUrl}/calculate-integral`, request);
  }
} 
