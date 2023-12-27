import { TestBed } from '@angular/core/testing';

import { FormDisableService } from './form-disable.service';

describe('FormDisableService', () => {
    let service: FormDisableService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(FormDisableService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
