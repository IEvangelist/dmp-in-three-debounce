import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConferenceService } from './conference.service';
import { Conferences, Conference } from './conferences';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {

    public isLoading = false;
    public filter: string;

    public get filteredConferences(): Conferences {
        return this.conferences
            && this.conferences.filter(conf => this.searchConference(conf, this.filter));
    }

    private conferences: Conferences = [];
    private filterUpdated: Subject<string> = new Subject<string>();
    private subscription: Subscription = null;

    constructor(private readonly conferenceService: ConferenceService) {
        this.subscription =
            this.filterUpdated
                .asObservable()
                .pipe(debounceTime(350))
                .pipe(distinctUntilChanged())
                .subscribe((filter: string) => {
                    this.filter = filter;
                });
    }

    async ngOnInit() {
        try {
            this.isLoading = true;

            this.conferences =
                await this.conferenceService
                    .getConferences();
        } catch (e) {
            console.error(e);
        } finally {
            this.isLoading = false;
        }
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private searchConference(conference: Conference, filter: string): boolean {
        if (!conference) return false;
        if (!filter) return true;

        const lowerCaseSearch = filter.toLowerCase();
        return conference.name.toLowerCase().indexOf(lowerCaseSearch) > -1;
    }

    public onFilterApplied(filter: string) {
        this.filterUpdated.next(filter);
    }

    onClearSearch() {
        this.filter = '';
    }

    containsDetails(conf: Conference): boolean {
        return conf && !!(conf.description || conf.date || conf.price || conf.type);
    }

    getConfDetails(conf: Conference): string {
        if (!conf) return '';

        let details = '';

        if (conf.description) {
            details += `Description: ${conf.description}\n`;
        }
        if (conf.date) {
            if (!conf.date.end || conf.date.start === conf.date.end) {
                details += `Date: ${conf.date.start}\n`;
            } else {
                details += `Date: ${conf.date.start} - ${conf.date.end}\n`;
            }
        }
        if (conf.price) {
            details += `Price: ${conf.price.low}-${conf.price.high} (${conf.price.currency})`;
        }

        return details;
    }
}