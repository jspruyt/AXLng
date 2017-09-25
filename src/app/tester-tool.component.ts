import { Component, OnInit, Input } from '@angular/core';

import { AxlService } from './axl.service';
import { PercentService } from './percent.service';


@Component({
  selector: 'tester-tool',
  templateUrl: 'tester-tool.component.html'
})

export class TesterToolComponent implements OnInit {
  output: string;
  @Input() field1: string;
  @Input() field2: string;

  constructor(
    private axl: AxlService,
    private percent: PercentService
  ) { }

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
        this.output = result.text();
      }, (errorMsg: string) => {
        this.output = errorMsg;
      })
  }

  getPhoneAxl() {
    const request = {
      name: 'csfaperez'
    };

    this.axl.callMethod('getPhone', request)
      .subscribe(result => {
        this.output = result.text();
      }, (errorMsg: string) => {
        this.output = errorMsg;
      })
  }

  parseTemplate() {
    this.output = this.percent.parse(this.field1, JSON.parse(this.field2));
  }

}
