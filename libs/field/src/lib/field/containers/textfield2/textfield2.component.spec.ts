import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Textfield2Component } from './textfield2.component';

describe('Textfield2Component', () => {
    let component: Textfield2Component;
    let fixture: ComponentFixture<Textfield2Component>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [Textfield2Component],
        }).compileComponents();

        fixture = TestBed.createComponent(Textfield2Component);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
