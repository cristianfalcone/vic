/*
 Copyright 2017 VMware, Inc. All Rights Reserved.

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
*/
import {VchCreationWizardNameComponent} from './vch-creation-wizard-name.component';
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {ClarityModule} from 'clarity-angular';
import {HttpModule} from '@angular/http';
import {CreateVchWizardService} from '../create-vch-wizard.service';
import {Observable} from 'rxjs/Observable';

describe('VchCreationWizardNameComponent', () => {

  const ValidVCHName = 'unique-vm-container-host';
  const InvalidVCHName = 'vm-container-host';

  let component: VchCreationWizardNameComponent;
  let fixture: ComponentFixture<VchCreationWizardNameComponent>;
  let service: CreateVchWizardService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule,
        HttpModule,
        ClarityModule
      ],
      providers: [
        {
          provide: CreateVchWizardService,
          useValue: {
            checkVchNameUniqueness(name) {
              if (name === 'vm-container-host') {
                return Observable.of(false);
              } else {
                return Observable.of(true);
              }
            }
          }
        }
      ],
      declarations: [
        VchCreationWizardNameComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VchCreationWizardNameComponent);
    component = fixture.componentInstance;
    component.onPageLoad();
    service = fixture.debugElement.injector.get(CreateVchWizardService);
    spyOn(service, 'checkVchNameUniqueness').and.callThrough();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an invalid form', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should have a valid form after adding a name',  () => {
    component.form.get('name').setValue(ValidVCHName);
    expect(component.form.valid).toBe(true);
  });

  it('should have a invalid form after adding an invalid empty name',  () => {
    component.form.get('name').setValue('');
    expect(component.form.invalid).toBe(true);
  });

  it('should have a invalid form after adding an invalid length for name',  () => {
    component.form.get('name').setValue(ValidVCHName.repeat(10));
    expect(component.form.invalid).toBe(true);
  });

  it('should have a invalid form after adding an invalid name pattern',  () => {
    component.form.get('name').setValue('two@words');
    expect(component.form.invalid).toBe(true);
  });

  it('should check name uniqueness on step commit',  () => {
    component.form.get('name').setValue(ValidVCHName);
    component.onCommit();
    expect(service.checkVchNameUniqueness).toHaveBeenCalledWith(ValidVCHName);
  });

  it('should have a valid form after adding an unique name', () => {
    component.form.get('name').setValue(ValidVCHName);
    component.onCommit().subscribe(() => {
      expect(component.form.valid).toBe(true);
    })
  });

  it('should have a invalid form after adding an already defined name', () => {
    component.form.get('name').setValue(InvalidVCHName);
    component.onCommit().catch((value) => {
      return Observable.of(value);
    }).subscribe(() => {
      expect(component.form.invalid).toBe(true);
    })
  });
});
