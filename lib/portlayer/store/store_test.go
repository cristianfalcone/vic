// Copyright 2016 VMware, Inc. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

package store

import (
	"testing"

	"github.com/vmware/vic/pkg/kvstore"

	"github.com/stretchr/testify/assert"
)

func setup() {
	if mgr == nil {
		// set up fake store manager
		mgr = &StoreManager{
			dsStores: make(map[string]*kvstore.KeyValueStore),
		}
	}
}

func TestNameValidation(t *testing.T) {
	setup()

	// valid name -- empty map
	assert.NoError(t, validateStoreName(APIKV))

	// fail regex
	assert.Error(t, validateStoreName("jojo-1"))
	assert.Error(t, validateStoreName("jojo%1"))

	mgr.dsStores[APIKV] = &kvstore.KeyValueStore{}
	// dupe store
	assert.Error(t, validateStoreName(APIKV))
	// valid name
	assert.NoError(t, validateStoreName("AB_63cd"))

}

func TestStore(t *testing.T) {
	setup()

	// API store created in first test
	s, err := Store(APIKV)
	assert.NoError(t, err)
	assert.NotNil(t, s)

	// store not found
	s, err = Store("jojo")
	assert.Error(t, err)
	assert.Nil(t, s)

}