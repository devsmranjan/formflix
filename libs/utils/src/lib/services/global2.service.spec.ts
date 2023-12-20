import { TestBed } from '@angular/core/testing';

import { Global2Service } from './global2.service';

describe('Global2Service', () => {
    let service: Global2Service;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(Global2Service);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
