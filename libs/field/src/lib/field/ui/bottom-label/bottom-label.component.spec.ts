import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomLabelComponent } from './bottom-label.component';

describe('BottomLabelComponent', () => {
    let component: BottomLabelComponent;
    let fixture: ComponentFixture<BottomLabelComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [BottomLabelComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(BottomLabelComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
