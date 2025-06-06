import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) { }

    teste(): Observable<any> {
        return this.http.get("http://localhost:5000/", { responseType: 'text' });
    }

}
