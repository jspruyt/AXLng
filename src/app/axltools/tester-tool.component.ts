import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import * as yaml from 'js-yaml';
import * as csv from 'json-2-csv';

import { AxlService } from '../axltools/axl.service';
import { PercentService } from '../percent/percent.service';


@Component({
    selector: 'tester-tool',
    templateUrl: 'tester-tool.component.html'
})

export class TesterToolComponent implements OnInit {
    output: string;
    @Input() field1: string;
    @Input() field2: string;
    variables: string[];
    @Input() form: FormGroup;

    constructor(
        private axl: AxlService,
        private percent: PercentService
    ) { }

    ngOnInit() {
    //     this.axl.init().subscribe(success => {
    //         if (success) {
    //             console.log('AXL Client succesfully loaded');
    //         } else {
    //             console.log('AXL Client could not be loaded');
    //         }
    //     });
    //     this.field1 = `1. % display %
    // 2. %display | upper %
    // 3. %display | left  :   5  %
    // 4. %something|left  : -5 %
    // 5. %description|right:4%
    // 6. %display|right:-4%
    // 7. %last|right:-4|lower%
    // `;
    //     this.field2 = '{"display" : "Jonathan SPRUYT"}';
    }


    testConnectionAxl() {
        // const request = {
        //     searchCriteria: [{ name: '%' }],
        //     returnedTags: [{ name: '' }]
        // };
        // this.axl.callOperation('listProcessNode', request)
        //     .subscribe(result => {
        //         this.output = result.text();
        //     }, (errorMsg: string) => {
        //         this.output = errorMsg;
        //     })
    }

    getPhoneAxl() {
        // const request = {
        //     name: 'csfaperez'
        // };

        // this.axl.callOperation('getPhone', request)
        //     .subscribe(result => {
        //         this.output = result.text();
        //     }, (errorMsg: string) => {
        //         this.output = errorMsg;
        //     })
    }

    parseTemplate() {
        // this.output = this.percent.parse(this.field1, JSON.parse(this.field2));
    }

    getVariables() {
        // this.variables = this.percent.listVariables(this.field1);
        // const group: any = {};
        // this.variables.forEach(variable => {
        //     group[variable] = new FormControl('');
        // });
        // this.form = new FormGroup(group);
    }

    onSubmit() {
        // this.output = JSON.stringify(this.form.value);
    }

    testYaml() {
        // let yamlObj = '';
        // const yamlDoc: any = yaml.safeLoadAll(this.percent.parse(this.field1, JSON.parse(this.field2)), function (doc) {
        //     yamlObj += JSON.stringify(doc, null, 2);
        // });
        // this.output = yamlObj;
    }

    testCSV() {
        // const csvDoc = 'userid,dn,location\njosp,3099,BXL\nmct,4915,CH';
        // let outString = '';
        // csv.csv2json(csvDoc, (err, arr) => {
        //     if (err) {
        //         console.log(err);
        //     } else {
        //         arr.forEach(element => {
        //             outString += JSON.stringify(element, null, 2);
        //         });
        //     }
        //     this.output = outString;
        // })
    }

}
