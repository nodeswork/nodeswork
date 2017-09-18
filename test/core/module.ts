import * as should from 'should';

import * as core from '../../src/core';

@core.Injectable()
class Account1 {
  name: string;
}

@core.Worker()
class Worker1 implements core.Worker<string> {
  @core.Input() account1: Account1;

  work() {
    return 'worked by worker1 and ' + this.account1.name;
  }
}

@core.NwModule({
  accounts: [
    Account1,
  ],
  workers: [
    Worker1,
  ],
})
class SampleModule {
}

core.bootstrap(SampleModule, {noCore: true});

describe('core -> module', () => {
  it ('should returns right module meta', () => {
    (SampleModule as core.NwModule).$getModuleMetadata().should.have.properties({
      workers: [Worker1],
      accounts: [Account1],
      services: [],
    });
  });

  it ('should work with account', async () => {
    const result = await (SampleModule as core.NwModule).$work('Worker1', [
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
