import * as should from 'should';

import * as kiws from '../../src/kiws';

@kiws.Injectable()
class Account1 {
  name: string;
}

@kiws.Worker()
class Worker1 implements kiws.Worker<string> {
  @kiws.Input() account1: Account1;

  work() {
    return 'worked by worker1 and ' + this.account1.name;
  }
}

@kiws.NwModule({
  accounts: [
    Account1,
  ],
  workers: [
    Worker1,
  ],
})
class SampleModule {
}

kiws.bootstrap(SampleModule, {noCore: true});

describe('kiws -> module', () => {
  it ('should returns right module meta', () => {
    (SampleModule as kiws.NwModule).$getModuleMetadata().should.have.properties({
      workers: [Worker1],
      accounts: [Account1],
      providers: [],
    });
  });

  it ('should work with account', async () => {
    const result = await (SampleModule as kiws.NwModule).$work('Worker1', [
      {
        type: 'Account1',
        data: {
          name: 'account1',
        },
      },
    ]);
    result.should.be.equal('worked by worker1 and account1');
  });
});
