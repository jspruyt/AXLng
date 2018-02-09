import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';


@Injectable()
export class WsdlService {

    private cache: string[]

    constructor(
        private http: Http,
    ) {
        this.cache = [];
    }

    public getWsdl(url: string, overrideCache = false): Observable<string> {
        if ((url in this.cache) && !overrideCache) {
            console.log('retrieving wsdl from cache for url: ' + url);
            return Observable.of(this.cache[url]);
        } else {
            console.log('retrieving file from url: ' + url);
            return this.http.get(url)
                .map(response => {
                    this.cache[url] = response.text() as string;
                    return this.cache[url];
                })
                .catch((error: any) => {
                    console.log(`Error occured: ${error}`);
                    return Observable.throw('cannot fetch wsdl');
                })
        }
    }
}
