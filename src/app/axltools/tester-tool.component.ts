import { Component, OnInit, Input } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as yaml from 'js-yaml';
import * as csv from 'json-2-csv';
import * as xml from 'xml2js';

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
    indentLevel: number;
    wsdlJson: any;

    constructor(
        private axl: AxlService,
        private percent: PercentService,
        private http: Http,
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
        this.field2 = 'addDevicePool';
        this.indentLevel = 0;
    }

    getLocation() {
        const request = {
            name: this.field1,
            returnedTags: [{
                name: '',
                betweenLocations: {
                    betweenLocation: {
                        locationName: '',
                        videoBandwidth: ''
                    }
                },
            }]
        };
        this.axl.callOperation('getLocation', request)
            .subscribe(result => {
                this.output = result.payload;
            });
    }

    getOperation() {
        const xsdUrl = `/assets/wsdl/CUCM/11.0/AXLSoap.xsd`;
        console.log('fetching: ' + xsdUrl);
        this.http.get(xsdUrl)
            .subscribe(response => {
                const xmlContent = response.text();
                xml.parseString(xmlContent, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        this.wsdlJson = result;
                        const operationType = this.analyseOperation(this.field2);
                        const cType = this.analyseType(operationType);

                        // this.output = result;
                    }
                });
            }, error => {
                console.log('could not fetch ' + xsdUrl);
            })
    }

    analyseOperation(operationName: string): string {
        console.log(this.wsdlJson['xsd:schema']['xsd:element']);
        const elementArray = this.wsdlJson['xsd:schema']['xsd:element'] as Array<any>;
        const operation = elementArray.filter(element => element.$.name === operationName);
        this.output = 'operation: ' + operation[0].$.name as string;
        this.output += '\n';
        this.output += 'arguments:';

        let operationType = operation[0]['$'].type as string;
        operationType = operationType.replace('axlapi:', '');

        return operationType;
    }

    analyseType(typeName: string) {
        const complexTypeArray = this.wsdlJson['xsd:schema']['xsd:complexType'] as Array<any>;
        const simpleTypeArray = this.wsdlJson['xsd:schema']['xsd:simpleType'] as Array<any>;

        const typeArray = complexTypeArray.concat(simpleTypeArray);

        const typeObject = typeArray.filter(type => type.$.name === typeName)[0];
        if (typeObject) {
            console.log(typeObject);
            this.analyseChild(typeObject);
        }
    }

    analyseChild(obj: any, parent?: string) {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                switch (prop) {
                    case '$':
                        switch (parent) {
                            case 'xsd:element':
                                if (obj.$.hasOwnProperty('name')) {
                                    this.output += this.getIndent() + obj.$.name + ': ';
                                }
                                if (obj.$.hasOwnProperty('default')) {
                                    this.output += obj.$.default;
                                }
                                if (obj.$.hasOwnProperty('minOccurs')) {
                                    if (obj.$.minOccurs === '0') {
                                        this.output += ' #optional';
                                    }
                                }
                                if (obj.$.hasOwnProperty('type')) {
                                    let typeName = obj.$.type as string;

                                    if (typeName.startsWith('axlapi:')) {
                                        typeName = typeName.replace('axlapi:', '');
                                        this.output += ' #type: ' + typeName;
                                        this.analyseType(typeName);
                                    } else {
                                        typeName = typeName.split(':')[1];
                                        this.output += ' #type: ' + typeName;
                                    }
                                }
                                break;

                            case 'xsd:maxLength':
                                if (obj.$.hasOwnProperty('value')) {
                                    this.output += ' #maxlength: ' + obj.$.value;
                                }
                                break;

                            case 'xsd:enumeration':
                                if (obj.$.hasOwnProperty('value')) {
                                    if (obj.$.value) {
                                        this.output += obj.$.value + ', ';
                                    }
                                }
                                break;
                        }
                        break;
                    case 'xsd:simpleType':
                    case 'xsd:union':
                    case 'xsd:restriction':
                    case 'xsd:complexType':
                    case 'xsd:complexContent':
                    case 'xsd:extension':
                    case 'xsd:annotation':
                    case 'xsd:maxLength':
                    case 'xsd:sequence':
                        if (Array.isArray(obj[prop])) {
                            obj[prop].forEach(node => {
                                this.analyseChild(node, prop);
                            });
                        };
                        break;
                    case 'xsd:choice':
                        if (Array.isArray(obj[prop])) {
                            obj[prop].forEach(node => {
                                this.output += this.getIndent() + '#beginchoice\n';
                                this.analyseChild(node, prop);
                                this.output += this.getIndent() + '#endchoice\n';
                            });
                        };
                        break;
                    case 'xsd:element':
                        this.indentLevel++;
                        if (Array.isArray(obj[prop])) {
                            obj[prop].forEach(node => {
                                this.output += '\n';
                                this.analyseChild(node, prop);
                            });
                        };
                        this.indentLevel--;
                        break;

                    case 'xsd:documentation':
                        if (Array.isArray(obj[prop])) {
                            this.output += ' #documentation: ' + obj[prop][0];
                        }
                        break;

                    case 'xsd:enumeration':
                        this.output += ' #options: '
                        if (Array.isArray(obj[prop])) {
                            obj[prop].forEach(node => {
                                this.analyseChild(node, prop);
                            });
                        };
                        break;
                }
            }
        }
    }

    getIndent(): string {
        let indent = '';
        for (let i = 0; i < this.indentLevel; i++) {
            indent += '  ';
        }
        return indent;
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
