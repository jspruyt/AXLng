import { Injectable, OnInit } from '@angular/core';
import { SOAPService, Client, Operation } from 'ngx-soap';
import { Http, Headers } from '@angular/http';
import { Base64 } from 'js-base64';
import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/throw';


import { WsdlCombineService } from './wsdl-combine.service';
import { SoapRequest } from './axl.model';
import { AxlResult } from './model';



@Injectable()
export class AxlService {

    private opt = { forceSoap12Headers: true };
    private headers: Headers;
    private wsdlUrl = '/assets/wsdl/CUCM/11.0/AXLAPI.wsdl';
    // private axlUrl = 'https://ucm1.dcloud.cisco.com:8443/axl/';
    private axlUrl = 'https://10.170.126.10:8443/axl/';
    // private user = 'AXLAdmin';
    private user = 'AXLJOSP';
    // private password = '12345';
    private password = 'D1data123';
    private client: Client;

    constructor(
        private http: Http,
        private soap: SOAPService,
        private wsdl: WsdlCombineService,
    ) { }

    init(): Observable<boolean> {
        return this.wsdl.getEmbeddedWsdl('/assets/wsdl/CUCM/11.0/AXLAPI.wsdl')
            .mergeMap(response => {
                if (response) {
                    const opt = {
                        forceSoap12Headers: true
                    }

                    return Observable.fromPromise(this.soap.createClient(response, opt))
                        .map((client: Client) => {
                            this.client = client;
                            console.log(client);
                            return true;
                        });
                }
            });
    }


    private addAuth(headers: any): Headers {
        headers = new Headers(headers);
        const hash = this.user + ':' + this.password;
        return headers.append('Authorization', 'Basic ' + Base64.encode(hash));
    }

    callOperation(operation: string, args: any): Observable<any> {
        if (operation && args) {
            return this.getSoapRequest(operation, args, this.client)
                .mergeMap(request => {
                    return this.http.post(this.axlUrl, request.xml, { headers: this.addAuth(request.headers) })
                        .map(response => {
                            const returnObject = this.client.parseResponseBody(response.text());
                            const soapResponse = returnObject.Body[operation + 'Response'];
                            const axlResult = new AxlResult(true, operation, JSON.stringify(soapResponse, null, 2));
                            return axlResult;
                        })
                        .catch((error: any) => {
                            console.log('error on POST:');
                            console.log(error);
                            const axlResult = new AxlResult(false, operation, this.getHttpError(error), JSON.stringify(args, null, 2));
                            return Observable.of(axlResult);
                        });
                })
                .catch((error: any) => {
                    console.log('error on getSoap:');
                    console.log(error);
                    const axlResult = new AxlResult(false, operation, 'SOAP Request cannot be created', args);
                    return Observable.of(axlResult);
                });
        } else {
            return Observable.throw(new AxlResult(false, operation, 'invalid request', args));
        }
    }

    getHttpError(error: any): string {
        console.log('Error occured:');
        console.log(JSON.stringify(error, null, 2));
        // return Observable.throw(error);
        switch (error.status) {
            case 401:
                return '401 - Unauthorized';
            case 500:
                try {
                    this.client.parseResponseBody(error.text());
                } catch (soapError) {
                    const soapFault = soapError.root.Envelope.Body.Fault.faultstring;
                    return soapFault;
                }
                break;
            case 0:
                return 'Connection to AXL Server cannot be established';
            default:
                return 'Error while connecting to AXL Server';
        }
    }

    parseResponse(response: any): string {
        return 'pass';
    }



    getSoapRequest(operationName: string, args: any, client: Client): Observable<Operation> {
        if (client.hasOwnProperty(operationName) && typeof client[operationName] === 'function') {
            const clientObservable = Observable.fromPromise(client.operation(operationName, args));
            return clientObservable;
        } else {
            return Observable.throw(new Error('Cannot create Soap Operation'));
        }
    }
}
