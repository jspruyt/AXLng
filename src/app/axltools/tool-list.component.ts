import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'tool-list',
    templateUrl: 'tool-list.component.html'
})

export class ToolListComponent implements OnInit {
    tools: any = [
        { 'title': 'AXL Creator', 'url': 'creator' },
        { 'title': 'AXL Query', 'url': 'query' },
        { 'title': 'AXL Updater', 'url': 'updater' },
        { 'title': 'AXL Tester', 'url': 'tester' },
        { 'title': 'AXL Blueprints', 'url': 'blueprints' },
        { 'title': 'AXL Schema Query', 'url': 'schema' },

    ];

    constructor() { }

    ngOnInit() { }
}
