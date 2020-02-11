import { IonBlockAddress, IonMetaData } from '.';

export class IonResult<DataT> {
  blockAddress: IonBlockAddress;
  hash: Uint8Array[];
  data: DataT;
  metadata: IonMetaData;
}
