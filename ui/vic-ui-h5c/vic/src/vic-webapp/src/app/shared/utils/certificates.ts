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

import { fromBER } from 'asn1js';
import Certificate from 'pkijs/src/Certificate';

interface CertificateInfo {
  expires: Date
}

export function parsePEMFileTextContent(str: string): CertificateInfo {

  // TODO: Handle errors

  // Remove certificate headers
  str = str.replace(/(-----(BEGIN|END) CERTIFICATE-----|\n)/g, '');

  // Decode base-64 string
  str = atob(str);

  // Convert to an ArrayBuffer
  const arr = stringToArrayBuffer(str);

  // Parse raw data
  const asn1 = fromBER(arr);

  // Create model
  const certificate = new Certificate({ schema: asn1.result });

  return {
    expires: certificate.notAfter.value
  }
}

function stringToArrayBuffer(str: string): ArrayBuffer {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);

  for (let i = 0, strLen = str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }

  return buf;
}
