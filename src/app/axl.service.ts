import { Injectable, OnInit } from '@angular/core';
import { SOAPService, Client } from 'ngx-soap';
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
import { SoapRequest } from './model';


@Injectable()
export class AxlService implements OnInit {

  private opt = { forceSoap12Headers: true };
  private headers: Headers;
  private wsdlUrl = '/assets/wsdl/CUCM/11.0/AXLAPI.wsdl';
  private axlUrl = 'https://cucm1.dcloud.cisco.com:8443/axl/';
  private user = 'AXLAdmin';
  private password = '12345';
  private client: Client;

  constructor(
    private http: Http,
    private soap: SOAPService,
    private wsdl: WsdlCombineService,
  ) { }

  ngOnInit() {
    this.wsdl.getEmbeddedWsdl('/assets/wsdl/CUCM/11.0/AXLAPI.wsdl')
      .subscribe(response => {
        if (response) {
          const opt = {
            forceSoap12Headers: true
          }
          this.soap.createClient(response, opt).then((client: Client) => {
            this.client = client;
            console.log(client);
          });
        }
      });
  }

  private addAuth(headers: any): Headers {
    headers = new Headers(headers);
    const hash = this.user + ':' + this.password;
    return headers.append('Authorization', 'Basic ' + Base64.encode(hash));
  }

  callMethod(method: string, requestObject: any): Observable<any> {
    return this.getSoapRequest(method, requestObject, this.client)
      .mergeMap((soapRequest: SoapRequest) => {
        return this.http.post(soapRequest.wsurl, soapRequest.xml, { headers: this.addAuth(soapRequest.headers) })
        .map(response => this.client.parseResponseBody(response.text()))
        .catch((error: any) => {
          console.log(`Error occured: ${error}`);
          return Observable.throw('Error while connecting to AXL server');
        });;
      })

  }

  getSoapRequest(method: string, request: any, client: Client): Observable<SoapRequest> {
    const getSoapAsObservable: Observable<SoapRequest> = Observable.create(function (observer) {
      (client as any).listProcessNode(request, (err, wsurl: string, headers: any, xml: string) => {
        let soapRequest = new SoapRequest();
        soapRequest.err = err;
        soapRequest.wsurl = wsurl;
        soapRequest.headers = headers;
        soapRequest.xml = xml;
        observer.next(soapRequest);
        observer.complete();
      });
    });
    return getSoapAsObservable;
  }



  // testConnection(): Observable<string> {
  //   const request = {
  //     searchCriteria: [{ name: '%' }],
  //     returnedTags: [{ name: '' }]
  //   };

  //   let responseText = 'nothing yet';

  //   return

  //   (this.client as any).listProcessNode(request, (err, wsurl: string, headers: any, xml: string) => {
  //       // (this.client as any)[this.method](request, (err, wsurl: string, headers: any, xml: string) => {
  //       wsurl = this.axlUrl;
  //       console.log('sending this xml');
  //       console.log(xml);
  //       return this.http.post(wsurl, xml, { headers: this.addAuth(headers) })
  //         .subscribe(
  //         response => {
  //           responseText = response.text();
  //           console.log('received response');
  //           console.log(responseText.substring(0, 200));
  //         });
  //     },
  //     err => {
  //       console.log("Error calling ws", err);
  //     }
  //     );
  // }
}


