import { HttpClient,HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map} from "rxjs/operators";
import { pipe, Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  API_PIPE = `${environment.API_URL}`;

  httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    }),
  };

  constructor(private http:HttpClient) { }

  order(data: any): Observable<any> {
    return this.http
      .post(this.API_PIPE+'orders', data, this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  register(data: any): Observable<any> {
    return this.http
      .post(this.API_PIPE + 'foodsignup', JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }

  login(data: any): Observable<any> {
    return this.http
      .post(this.API_PIPE + 'foodlogin', JSON.stringify(data), this.httpOptions)
      .pipe(catchError(this.errorHandler));
  }
  
  errorHandler(error: any) {
    let errorCode = '';
    let errorMessage = '';
    errorCode = `${error.status}`;
    errorMessage = `Message: ${error.error.masseage}`;
    console.log(errorMessage);
    return throwError(errorCode);
  }
 
}
