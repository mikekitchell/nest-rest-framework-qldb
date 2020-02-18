
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://encrypted-tbn0.gstatic.com/images?q=tbn%3AANd9GcQDKJWSppTxNLtP4W_nGEwysUcuXX9qW9nMr58eaVs20G_AVj9i" width="320" alt="Nest Logo" /></a>
</p>

# NEST-REST-FRAMEWORK-QLDB

## Description
This project extends the Nest Rest Framework to implement QLDB. It is a library to handle crud operations for your models against QLDB. Quantum Ledger Database is blockchain so it is inherently awesome

## Usage

See the example directory of this project.

First Install Nest Rest Framework QlDB
```bash
npm i --save nest-rest-framework-qldb
```

Second Produce the Model you want to persist in Qldb.

```typescript

export class ExampleModel {
    name: string;
    age: number;
    gender: string;
}

```

Third Produce a ViewSet that Extends QldbViewSet. 
Don't worry that there's no code, QldbViewSet know how to talk to the Quantum Ledger Database.

```typescript

import { Injectable, Inject } from '@nestjs/common';
import { ExampleModel } from './example.model';
import { QldbSession } from 'amazon-qldb-driver-nodejs';
import { QldbViewSet } from 'nest-rest-framework-qldb';

@Injectable()
export class ExampleQldbViewset extends QldbViewSet<ExampleModel> {
  constructor(readonly driver: PooledQldbDriver) {
    super(driver, 'example-model');
  }
}

```

Forth Produce a controller than Extends QldbRestController.
There should be no code in this as well.

```typescript

import { Controller } from '@nestjs/common';
import { QldbRestController } from 'nest-rest-framework-qldb';
import { ExampleModel } from './example.model';
import { ExampleQldbViewset } from './example-qldb-viewset';

@Controller('example-qldb')
export class ExampleQldbController extends QldbRestController<ExampleModel, ExampleModel, ExampleModel> {

    constructor(readonly exampleViewSet: ExampleQldbViewset) {
        super({
            viewset: exampleViewSet,
        });
    }
}


```



Finally Produce a QldbSession as a provider in your Module, register it with the token name QLDB_SESSION_TOKEN.
Also register your controller and ViewSet
```typescript

import { Module } from '@nestjs/common';
import { ExampleQldbController } from './example-qldb.controller';
import { ExampleQldbViewset } from './example-qldb-viewset';
import { PooledQldbDriver,  } from 'amazon-qldb-driver-nodejs';

@Module({
    providers: [
        ExampleQldbViewset,
        {
            provide: PooledQldbDriver,
            useValue: new PooledQldbDriver('fake-ledger'),
        },
    ],
    controllers: [ExampleQldbController],
})
export class ExampleModule {}

```



## License

  Nest-Rest-Framework-QLDB is [MIT licensed](LICENSE).
