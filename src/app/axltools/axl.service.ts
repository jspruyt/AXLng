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

    private username: string;
    private password: string;
    private axlUrl: string;
    public initialized = false;
    private client: Client;

    constructor(
        private http: Http,
        private soap: SOAPService,
        private wsdl: WsdlCombineService,
    ) { }

    init(version: string, hostname: string, username: string, password: string): Observable<boolean> {
        this.username = username;
        this.password = password;

        this.axlUrl = `https://${hostname}:8443/axl/`;
        const wsdlUrl = `/assets/wsdl/CUCM/${version}/AXLAPI.wsdl`;

        return this.wsdl.getEmbeddedWsdl(wsdlUrl)
            .mergeMap(response => {
                if (response) {
                    const opt = {
                        forceSoap12Headers: true
                    }

                    return Observable.fromPromise(this.soap.createClient(response, opt))
                        .map((client: Client) => {
                            this.client = client;
                            console.log(client);
                            this.initialized = true;
                            return true;
                        });
                }
            });
    }


    private addAuth(headers: any): Headers {
        const authHeaders = new Headers(headers)
        const hash = this.username + ':' + this.password;
        authHeaders.append('Authorization', 'Basic ' + Base64.encode(hash));
        return authHeaders;
    }

    callOperation(operation: string, args: any): Observable<any> {
        const logInfo = args.hasOwnProperty('loginfo') ? ': ' + args.loginfo : '';
        const title = operation + logInfo;
        if (operation && args) {
            return this.getSoapRequest(operation, args, this.client)
                .mergeMap(request => {
                    return this.http.post(this.axlUrl, request.xml, { headers: this.addAuth(request.headers) })
                        .map(response => {
                            const returnObject = this.client.parseResponseBody(response.text());
                            const soapResponse = returnObject.Body[operation + 'Response'];
                            const axlResult = new AxlResult(true, title, 'Operation succesful', JSON.stringify(soapResponse, null, 2));
                            return axlResult;
                        })
                        .catch((error: any) => {
                            console.log('error on POST:');
                            console.log(error);
                            const axlResult = new AxlResult(false, title, this.getHttpError(error), JSON.stringify(args, null, 2));
                            return Observable.of(axlResult);
                        });
                })
                .catch((error: any) => {
                    console.log('error on getSoap:');
                    console.log(error);
                    const axlResult = new AxlResult(false, title, 'SOAP Request cannot be created', args);
                    return Observable.of(axlResult);
                });
        } else {
            return Observable.throw(new AxlResult(false, title, 'invalid request', args));
        }
    }

    testConnection(): Observable<boolean> {
        const request = {
            searchCriteria: [{ name: '%' }],
            returnedTags: [{ name: '' }]
        };
        return this.callOperation('listProcessNode', request)
            .map(result => result.successful);
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
            case 599:
                return 'AXL API version not supported';
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
