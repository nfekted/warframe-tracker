import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ApiService {

    constructor(private http: HttpClient) { }

    url: string = "http://localhost:5000/";

    teste(): Observable<any> {
        return this.http.get(this.url, { responseType: 'text' });
    }

    getMasteryRank(): Observable<any> {
        return this.http.get(`${this.url}mastery-rank`, { responseType: 'text' });
    }

}
