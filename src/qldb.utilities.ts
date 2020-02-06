/*
 * Copyright 2019 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: MIT-0
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this
 * software and associated documentation files (the "Software"), to deal in the Software
 * without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to
 * permit persons to whom the Software is furnished to do so.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 * OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import {
  Decimal,
  IonTypes,
  Reader,
  Timestamp,
  Writer,
  decodeUtf8,
  makePrettyWriter,
  makeReader,
  toBase64,
} from 'ion-js';
import { GetBlockResponse, GetDigestResponse } from 'aws-sdk/clients/qldb';

import { Result } from 'amazon-qldb-driver-nodejs';

/**
 * Returns the string representation of a given BlockResponse.
 * @param blockResponse The BlockResponse to convert to string.
 * @returns The string representation of the supplied BlockResponse.
 */
export function blockResponseToString(blockResponse: GetBlockResponse): string {
  let stringBuilder: string = '';
  if (blockResponse.Block.IonText) {
    stringBuilder =
      stringBuilder + 'Block: ' + blockResponse.Block.IonText + ', ';
  }
  if (blockResponse.Proof.IonText) {
    stringBuilder = stringBuilder + 'Proof: ' + blockResponse.Proof.IonText;
  }
  stringBuilder = '{' + stringBuilder + '}';
  const writer: Writer = makePrettyWriter();
  const reader: Reader = makeReader(stringBuilder);
  writer.writeValues(reader);
  return decodeUtf8(writer.getBytes());
}

/**
 * Returns the string representation of a given GetDigestResponse.
 * @param digestResponse The GetDigestResponse to convert to string.
 * @returns The string representation of the supplied GetDigestResponse.
 */
export function digestResponseToString(
  digestResponse: GetDigestResponse,
): string {
  let stringBuilder: string = '';
  if (digestResponse.Digest) {
    stringBuilder +=
      'Digest: ' +
      JSON.stringify(toBase64(digestResponse.Digest as Uint8Array)) +
      ', ';
  }
  if (digestResponse.DigestTipAddress.IonText) {
    stringBuilder +=
      'DigestTipAddress: ' + digestResponse.DigestTipAddress.IonText;
  }
  stringBuilder = '{' + stringBuilder + '}';
  const writer: Writer = makePrettyWriter();
  const reader: Reader = makeReader(stringBuilder);
  writer.writeValues(reader);
  return decodeUtf8(writer.getBytes());
}

export async function getFirstResult(promise: Promise<Result>) {
  const response = (await promise).getResultList();
  if (!!response && response.length > 0) {
    return response[0];
  }
  return null;
}

/**
 * Converts a given value to Ion using the provided writer.
 * @param value The value to covert to Ion.
 * @param ionWriter The Writer to pass the value into.
 * @throws Error: If the given value cannot be converted to Ion.
 */
export function writeValueAsIon(value: any, ionWriter: Writer): void {
  switch (typeof value) {
    case 'string':
      ionWriter.writeString(value);
      break;
    case 'boolean':
      ionWriter.writeBoolean(value);
      break;
    case 'number':
      ionWriter.writeInt(value);
      break;
    case 'object':
      if (Array.isArray(value)) {
        // Object is an array.
        ionWriter.stepIn(IonTypes.LIST);

        for (const element of value) {
          writeValueAsIon(element, ionWriter);
        }

        ionWriter.stepOut();
      } else if (value instanceof Date) {
        // Object is a Date.
        ionWriter.writeTimestamp(Timestamp.parse(value.toISOString()));
      } else if (value instanceof Decimal) {
        // Object is a Decimal.
        ionWriter.writeDecimal(value);
      } else if (value === null) {
        ionWriter.writeNull(IonTypes.NULL);
      } else {
        // Object is a struct.
        ionWriter.stepIn(IonTypes.STRUCT);

        for (const key of Object.keys(value)) {
          ionWriter.writeFieldName(key);
          writeValueAsIon(value[key], ionWriter);
        }
        ionWriter.stepOut();
      }
      break;
    default:
      throw new Error(`Cannot convert to Ion for type: ${typeof value}.`);
  }
}
