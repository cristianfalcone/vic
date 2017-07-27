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
import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ClarityModule } from 'clarity-angular';
import { CreateVchWizardComponent } from './create-vch-wizard.component';
import { VchCreationWizardNameComponent } from './name/vch-creation-wizard-name.component';
import { CreateVchWizardService } from './create-vch-wizard.service';

const routes: Routes = [
    { path: '', component: CreateVchWizardComponent },
    { path: ':id', component: CreateVchWizardComponent }
];

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        HttpModule,
        ReactiveFormsModule,
        ClarityModule,
        RouterModule.forChild(routes)
    ],
    declarations: [
        CreateVchWizardComponent,
        VchCreationWizardNameComponent
    ],
    providers: [
        CreateVchWizardService
    ],
    exports: [
        CreateVchWizardComponent,
        VchCreationWizardNameComponent
    ]
})
export class CreateVchWizardModule { }