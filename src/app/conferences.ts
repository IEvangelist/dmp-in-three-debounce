export type Conferences = Conference[];

export interface Conference {
    type?: string | null;
    name: string;
    url: string;
    location: Location;
    date: Date;
    tags?: (string)[] | null;
    description?: string | null;
    price?: Price | null;
  }
  export interface Location {
    city: string;
    country: string;
  }
  export interface Date {
    start: string;
    end: string;
  }
  export interface Price {
    currency: string;
    high: number;
    low: number;
  }  