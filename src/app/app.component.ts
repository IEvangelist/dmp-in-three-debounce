import { Component, ElementRef, ViewChild, OnInit } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConferenceService } from './conference.service';
import { Conferences, Conference } from './conferences';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

    @ViewChild("filterInput") private input: ElementRef;

    public isLoading = false;
    public filter: string;

    public get filteredConferences(): Conferences {
        return this.conferences
            && this.conferences.filter(conf => this.searchConference(conf, this.filter));
    }

    private conferences: Conferences = [];
    private filterUpdated: Subject<string> = new Subject<string>();
    private subscription = new Subscription();

    constructor(private readonly conferenceService: ConferenceService) {
        this.subscription.add(
            this.filterUpdated
                .asObservable()
                .pipe(debounceTime(350))
                .pipe(distinctUntilChanged())
                .subscribe((filter: string) => {
                    this.filter = filter;
                }));
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

    private searchConference(conference: Conference, filter: string): boolean {
        if (!conference) return false;
        if (!filter) return true;

        const lowerCaseSearch = filter.toLowerCase();
        return conference.name.toLowerCase().indexOf(lowerCaseSearch) > -1;
    }

    public onFilter(filter: string) {
        this.filterUpdated.next(filter);
    }

    onClearSearch() {
        if (this.input && this.input.nativeElement) {
            if (this.input.nativeElement.value === "") {
                return;
            }
            this.onFilter(this.input.nativeElement.value = "");
        }
    }

    containsDetails(conf: Conference): boolean {
        return conf && !!(conf.description || conf.date || conf.price || conf.tags || conf.type);
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
        if (conf.tags) {
            details += `Tags: ${conf.tags.join(', ')}\n`;
        }
        if (conf.price) {
            details += `Price: ${conf.price.low}-${conf.price.high} (${conf.price.currency})`;
        }

        return details;
    }

    capitalize(str: string): string {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}