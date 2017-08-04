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
import { Component, OnInit, EventEmitter } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    FormArray,
    Validators
} from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { Http, URLSearchParams } from '@angular/http';
import 'rxjs/add/observable/timer';
import { CreateVchWizardService } from '../create-vch-wizard.service';

@Component({
    selector: 'vic-vch-creation-storage-capacity',
    templateUrl: './storage-capacity.html',
    styleUrls: ['./storage-capacity.scss']
})
export class StorageCapacityComponent implements OnInit {
    public form: FormGroup;
    public formErrMessage = '';
    public inAdvancedMode = false;
    public datastores: any[] = [];
    public datastoresLoading = true;

    constructor(
        private formBuilder: FormBuilder,
        private createWzService: CreateVchWizardService
    ) {
        this.form = formBuilder.group({
            imageStore: ['', Validators.required],
            fileFolder: '',
            volumeStores: formBuilder.array([this.createNewVolumeDatastoreEntry()]),
            baseImageSize: [
                '8',
                [
                    Validators.required,
                    Validators.pattern(new RegExp(/^\d+$/))
                ]
            ],
            baseImageSizeUnit: 'GB'
        });

        // volume store validation is disabled by default, as user starts in the basic mode
        this.form.get('volumeStores').disable();
    }

    // TODO: function that calls a service's method to load WIP data and replace form values

    ngOnInit() {

    }

    addNewVolumeDatastoreEntry() {
        const volStores = this.form.get('volumeStores') as FormArray;
        volStores.push(this.createNewVolumeDatastoreEntry());
    }

    removeVolumeDatastoreEntry(index: number) {
        const volStores = this.form.get('volumeStores') as FormArray;
        volStores.removeAt(index);
    }

    createNewVolumeDatastoreEntry() {
        return this.formBuilder.group({
            volDatastore: '',
            volFileFolder: '',
            dockerVolName: [{ value: '', disabled: true }, Validators.required]
        });
    }

    onPageLoad() {
        // if image datastore is already selected return here
        if (this.form.get('imageStore').value) {
            return;
        }

        // listen for imageStore changes and handle validation errors
        this.form.get('imageStore').statusChanges
            .subscribe(v => {
                if (this.form.get('imageStore').hasError('required')) {
                    this.formErrMessage = 'Image datastore cannot be empty!';
                    return;
                }
            });

        // listen for imageStore changes and handle validation errors, only if advanced mode is on
        this.form.get('baseImageSize').statusChanges
            .subscribe(v => {
                if (!this.inAdvancedMode) {
                    return;
                }
                if (this.form.get('baseImageSize').hasError('required')) {
                    this.formErrMessage = 'Base image size cannot be empty!';
                    return;
                }
                if (this.form.get('baseImageSize').hasError('pattern')) {
                    this.formErrMessage = 'Base image size should be numeric!';
                    return;
                }
            });

        this.form.get('volumeStores').valueChanges
            .subscribe(v => {
                v.forEach((item, index) => {
                    const controls = this.form.get('volumeStores')['controls'][index]['controls'];
                    const labelControl = controls['dockerVolName'];
                    const datastoreControl = controls['volDatastore'];
                    if (datastoreControl.value && labelControl.disabled) {
                        labelControl.enable();
                    } else if (!datastoreControl.value && labelControl.enabled) {
                        labelControl.disable();
                    }
                });
            });

        // load datastores
        this.createWzService.getDatacenter()
            .switchMap((dcs) => this.createWzService.getDatastores(dcs[0]['objRef']))
            .subscribe(v => {
                this.datastores = v;
                this.form.get('imageStore').setValue('');
                this.datastoresLoading = false;
            }, err => console.error(err));
    }

    /**
     */
    onCommit(): Observable<any> {
        const errs: string[] = [];
        const results: any = {};

        if (this.form.invalid) {
            if (this.form.get('imageStore').hasError('required')) {
                this.formErrMessage = 'Image store should be selected!';
                return Observable.throw('Image store should be selected!');
            }
        }

        results['imageStore'] = this.form.get('imageStore').value;
        if (this.form.get('fileFolder').value) {
            let val = this.form.get('fileFolder').value;
            if (val.length && val.charAt(0) !== '/') {
                val = '/' + val;
            }
            results['fileFolder'] = val;
        }

        if (this.inAdvancedMode) {
            results['baseImageSize'] =
            this.form.get('baseImageSize').value + this.form.get('baseImageSizeUnit').value;

            // filter ones with empty datastore
            results['volumeStores'] = this.form.get('volumeStores').value
                .filter(vol => vol['volDatastore']);

            results['volumeStores'].forEach(vol => {
                // if volume file folder doesn't start with '/', prepend the value with '/'
                if (vol['volFileFolder'].length && vol['volFileFolder'].charAt(0) !== '/') {
                    vol['volFileFolder'] = '/' + vol['volFileFolder'];
                }
            });
        } else {
            results['volumeStores'] = [];
        }

        return Observable.of({ storageCapacity: results });
    }

    toggleAdvancedMode() {
        this.inAdvancedMode = !this.inAdvancedMode;
        if (!this.inAdvancedMode) {
            this.form.get('volumeStores').disable();
        } else {
            this.form.get('volumeStores').enable();
        }
    }
}
