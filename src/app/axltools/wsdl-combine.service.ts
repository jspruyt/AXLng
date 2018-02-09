import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';

import { WsdlService } from '../axltools/wsdl.service';


@Injectable()
export class WsdlCombineService {

    constructor(
        private http: Http,
        private wsdl: WsdlService,
    ) { }

    getEmbeddedWsdl(url: string): Observable<string> {
        return this.wsdl.getWsdl(url)
            .mergeMap((wsdlResponse: string) => {
                if (wsdlResponse) {
                    const parser = new DOMParser;
                    const wsdlDoc = parser.parseFromString(wsdlResponse, 'text/xml');
                    const importNodes = wsdlDoc.getElementsByTagName('import');
                    for (let ix = 0; ix < importNodes.length; ix++) {
                        const importNode = importNodes[ix];
                        const schemaLocation = importNode.getAttribute('location');
                        if (schemaLocation.endsWith('.xsd')) {
                            return this.wsdl.getWsdl(this.getBasePath(url) + '/' + schemaLocation)
                                .map(schemaResponse => {
                                    const schemaDoc = parser.parseFromString(schemaResponse, 'text/xml');
                                    const schemaNode = schemaDoc.getElementsByTagName('xsd:schema')[0];
                                    const typeNode = wsdlDoc.createElement('types');
                                    typeNode.appendChild(schemaNode);
                                    importNode.parentNode.replaceChild(typeNode, importNode);
                                    return new XMLSerializer().serializeToString(wsdlDoc);
                                });
                        }
                    }
                }
            })
            .catch((error: any) => {
                console.log(`Error occured: ${error}`);
                return Observable.throw('cannot embed wsdl');
            });
    }

    private getBasePath(url: string): string {
        const parts: string[] = url.split('/');
        parts.pop();
        return parts.join('/');
    }
}
