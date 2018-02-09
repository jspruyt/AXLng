import { Component, OnInit, Input } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import * as xml from 'xml2js';
import { getComponent } from '@angular/core/src/linker/component_factory_resolver';

import { SchemaNode, SchemaAttribute } from '../axltools/model';
import { WsdlService } from '../axltools/wsdl.service';


@Component({
    selector: 'schema-tool',
    templateUrl: 'schema-tool.component.html'
})

export class SchemaToolComponent implements OnInit {
    operationName: string;
    operationList: string[];
    wsdlJson: any;
    indentLevel: number;
    output: string;
    blueprintSchema: SchemaNode[];

    constructor(
        private http: Http,
        private wsdl: WsdlService,
    ) { }

    ngOnInit() {
        this.indentLevel = 0;
        this.blueprintSchema = [];
        this.output = '';
        this.getOperations();
    }

    getOperations() {
        const wsdlUrl = `/assets/wsdl/CUCM/11.0/AXLAPI.wsdl`;
        this.wsdl.getWsdl(wsdlUrl)
            .subscribe(xmlContent => {
                xml.parseString(xmlContent, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        this.operationList = [];
                        this.wsdlJson = result;
                        this.wsdlJson.definitions.portType[0].operation.forEach(operation => {
                            this.operationList.push(operation.$.name);
                            this.operationList.sort((a, b) => {
                                return a.localeCompare(b);
                            })
                            this.operationName = 'addConferenceBridge';
                        });
                    }
                });
            }, error => {
                console.log('could not fetch ' + wsdlUrl);
            })
    }

    getOperation() {
        this.output = '';
        this.blueprintSchema = [];
        const xsdUrl = `/assets/wsdl/CUCM/11.0/AXLSoap.xsd`;
        this.wsdl.getWsdl(xsdUrl)
            .subscribe(xmlContent => {
                xml.parseString(xmlContent, (err, result) => {
                    if (err) {
                        console.log(err);
                    } else {
                        this.wsdlJson = result;
                        this.analyseOperation(this.operationName);
                        // const cType = this.analyseType(operationType);
                        this.blueprintSchema.forEach(node => {
                            this.output += node.print();
                        });
                        // this.output = result;
                    }
                });
            }, error => {
                console.log('could not fetch ' + xsdUrl);
            })
    }

    analyseOperation(operationName: string) {
        const elementArray = this.wsdlJson['xsd:schema']['xsd:element'] as Array<any>;
        const operation = elementArray.filter(element => element.$.name === operationName);

        const operationNode = new SchemaNode('operation', operation[0].$.name, false, [], []);
        this.blueprintSchema.push(operationNode);


        // this.output = 'operation: ' + operation[0].$.name as string;
        // this.output += '\n';
        // this.output += 'arguments:';

        let operationType = operation[0]['$'].type as string;
        operationType = operationType.replace('axlapi:', '');

        const argumentNode = new SchemaNode('arguments', '', false, [], []);
        const typeSchemaArray = [];
        this.analyseType(operationType, argumentNode);
        this.blueprintSchema.push(argumentNode);
    }

    analyseType(typeName: string, activeNode?: SchemaNode) {
        const complexTypeArray = this.wsdlJson['xsd:schema']['xsd:complexType'] as Array<any>;
        const simpleTypeArray = this.wsdlJson['xsd:schema']['xsd:simpleType'] as Array<any>;

        const typeArray = complexTypeArray.concat(simpleTypeArray);

        const typeObject = typeArray.filter(type => type.$.name === typeName)[0];
        if (typeObject) {
            this.analyseChild(typeObject, activeNode);
        } else {
            return null;
        }
    }

    analyseChild(obj: any, activeNode?: SchemaNode, parent?: string) {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                let childNode = new SchemaNode('', '', false, [], []);
                switch (prop) {
                    case '$':
                        switch (parent) {
                            case 'xsd:element':
                                if (obj.$.hasOwnProperty('name')) {
                                    activeNode.label = obj.$.name;
                                    // this.output += this.getIndent() + obj.$.name + ': ';
                                }
                                if (obj.$.hasOwnProperty('default')) {
                                    activeNode.value = obj.$.default;
                                }
                                if (obj.$.hasOwnProperty('minOccurs')) {
                                    if (obj.$.minOccurs === '0') {
                                        activeNode.optional = true;
                                    }
                                }
                                if (obj.$.hasOwnProperty('type')) {
                                    let typeName = obj.$.type as string;

                                    if (typeName.startsWith('axlapi:')) {
                                        typeName = typeName.replace('axlapi:', '');
                                        activeNode.attributes.push(new SchemaAttribute('type', typeName));
                                        this.analyseType(typeName, activeNode);
                                    } else {
                                        typeName = typeName.split(':')[1];
                                        activeNode.attributes.push(new SchemaAttribute('type', typeName));
                                    }
                                }
                                break;

                            case 'xsd:maxLength':
                                if (obj.$.hasOwnProperty('value')) {
                                    activeNode.attributes.push(new SchemaAttribute('maxlength', obj.$.value));
                                }
                                break;

                            case 'xsd:enumeration':
                                if (obj.$.hasOwnProperty('value')) {
                                    if (obj.$.value) {
                                        activeNode.attributes.forEach(attr => {
                                            if (attr.key === 'options') {
                                                attr.value += obj.$.value + ', '
                                            }
                                        });
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
                            obj[prop].forEach(childObj => {
                                this.analyseChild(childObj, activeNode, prop);
                            });
                        };
                        break;
                    case 'xsd:choice':
                        const choiceNode = new SchemaNode('choice', '', false, [], []);
                        if (Array.isArray(obj[prop])) {
                            obj[prop].forEach(childObj => {
                                this.analyseChild(childObj, choiceNode, prop);
                            });
                        };
                        activeNode.children.push(choiceNode);
                        break;
                    case 'xsd:element':
                        // this.indentLevel++;
                        if (Array.isArray(obj[prop])) {
                            obj[prop].forEach(childObj => {
                                childNode = new SchemaNode('', '', false, [], []);
                                this.analyseChild(childObj, childNode, prop);
                                activeNode.children.push(childNode);
                            });
                        };
                        break;

                    case 'xsd:documentation':
                        if (Array.isArray(obj[prop])) {
                            activeNode.attributes.push(new SchemaAttribute('documentation', obj[prop][0]));
                            // this.output += ' #documentation: ' + obj[prop][0];
                        }
                        break;

                    case 'xsd:enumeration':
                        if (Array.isArray(obj[prop])) {
                            obj[prop].forEach(childObj => {
                                this.analyseChild(childObj, activeNode, prop);
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


}
