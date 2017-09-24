import { Component, OnInit, Input } from '@angular/core';

import { AxlService } from './axl.service';


@Component({
    selector: 'tester-tool',
    templateUrl: 'tester-tool.component.html'
})

export class TesterToolComponent implements OnInit {
    test: string;
    @Input() field1: string;
    @Input() field2: string;

    constructor(
        private axl: AxlService
    ) {}

    ngOnInit() {
        this.axl.ngOnInit();
     }


    testConnectionAxl() {
        const request = {
          searchCriteria: [{ name: '%' }],
          returnedTags: [{ name: '' }]
        };
        this.axl.callMethod('listProcessNode', request)
          .subscribe(result => {
            this.test = result.text();
          }, (errorMsg: string) => {
            this.test = errorMsg;
          })
      }

      getPhoneAxl() {
        const request = {
          name: 'csfaperez'
        };

        this.axl.callMethod('getPhone', request)
          .subscribe(result => {
            this.test = result.text();
          }, (errorMsg: string) => {
            this.test = errorMsg;
          })
      }

}
