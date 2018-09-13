import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { delay, retry } from 'rxjs/operators';
import { Conferences } from './conferences';

@Injectable({
  providedIn: 'root'
})
export class ConferenceService {

  // Borrowing an existing list of conferences...
  private readonly url = 'https://raw.githubusercontent.com/hugorut/conferences/master/list.json';

  constructor(private readonly http: HttpClient) { }

  public getConferences(): Promise<Conferences> {
    return this.http
               .get<Conferences>(this.url)
               .pipe(delay(750)) // emulate longer API call invocation
               .pipe(retry(3))
               .toPromise();
  }
}