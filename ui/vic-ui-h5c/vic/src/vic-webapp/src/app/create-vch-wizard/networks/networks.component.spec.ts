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
import {ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule} from '@angular/forms';
import {ClarityModule} from 'clarity-angular';
import {HttpModule} from '@angular/http';
import {CreateVchWizardService} from '../create-vch-wizard.service';
import {Observable} from 'rxjs/Observable';
import {NetworksComponent} from './networks.component';

describe('StorageCapacityComponent', () => {

  let component: NetworksComponent;
  let fixture: ComponentFixture<NetworksComponent>;
  let service: CreateVchWizardService;

  function setDefaultRequiredValues() {
    component.form.get('bridgeNetwork').setValue('portGroup');
    component.form.get('publicNetwork').setValue('portGroup');
  }

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
            getDistributedPortGroups() {
              return Observable.of([{
                text: 'portGroup'
              }]);
            }
          }
        }
      ],
      declarations: [
        NetworksComponent
      ]
    });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NetworksComponent);
    component = fixture.componentInstance;
    component.onPageLoad();

    service = fixture.debugElement.injector.get(CreateVchWizardService);
    spyOn(service, 'getDistributedPortGroups').and.callThrough();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  it('should start with an invalid form', () => {
    expect(component.form.invalid).toBe(true);
  });

  it('should end with an invalid form on step commit without selecting bridge and public network',  () => {
    component.onCommit();
    expect(component.form.invalid).toBe(true);
  });

  it('should end with an valid form on step commit after selecting bridge and public network', () => {
    setDefaultRequiredValues();
    component.onCommit();
    expect(component.form.valid).toBe(true);
  });

  it('should validate static IP address related fields', () => {
    const publicNetworkType = component.form.get('publicNetworkType');
    const managementNetworkType = component.form.get('managementNetworkType');
    const publicNetworkIp = component.form.get('publicNetworkIp');
    const managementNetworkIp = component.form.get('managementNetworkIp');
    const publicNetworkGateway = component.form.get('publicNetworkGateway');
    const managementNetworkGateway = component.form.get('managementNetworkGateway');

    setDefaultRequiredValues();
    component.form.get('managementNetwork').setValue('portGroup');

    publicNetworkType.setValue('static');
    managementNetworkType.setValue('static');

    expect(component.form.invalid).toBe(true);

    // static IP address fields are required
    expect(publicNetworkIp.errors['required']).toBeTruthy();
    expect(managementNetworkIp.errors['required']).toBeTruthy();

    // static IP address fields to something incorrect
    publicNetworkIp.setValue('invalidAddress');
    managementNetworkIp.setValue('invalidAddress');
    expect(publicNetworkIp.errors['pattern']).toBeTruthy();
    expect(managementNetworkIp.errors['pattern']).toBeTruthy();

    // gateway fields are required
    expect(publicNetworkGateway.errors['required']).toBeTruthy();
    expect(managementNetworkGateway.errors['required']).toBeTruthy();

    // gateway fields to something incorrect
    publicNetworkGateway.setValue('invalidAddress');
    managementNetworkGateway.setValue('invalidAddress');
    expect(publicNetworkGateway.errors['pattern']).toBeTruthy();
    expect(managementNetworkGateway.errors['pattern']).toBeTruthy();

    // valid form with correct values
    publicNetworkIp.setValue('127.0.0.1');
    publicNetworkGateway.setValue('127.0.0.1');
    managementNetworkIp.setValue('127.0.0.1');
    managementNetworkGateway.setValue('127.0.0.1');
    component.onCommit();
    expect(component.form.valid).toBe(true);

    // back to DHCP and still a valid form
    publicNetworkType.setValue('dhcp');
    managementNetworkType.setValue('dhcp');
    expect(component.form.valid).toBe(true);
  });

  it('should validate advanced fields defaults values', () => {
    setDefaultRequiredValues();
    component.toggleAdvancedMode();
    component.onCommit();
    expect(component.form.valid).toBe(true);
  });

  it('should add and remove container network entries', () => {
    component.addNewContainerNetworkEntry();
    expect(component.form.get('containerNetworks')['controls'].length).toBe(2);
    component.removeContainerNetworkEntry(1);
    expect(component.form.get('containerNetworks')['controls'].length).toBe(1);
  });
});
