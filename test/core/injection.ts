import * as should from 'should';

import * as core from '../../src/core';

@core.Injectable()
class A {
  static i = 0;

  foo = 'bar' + A.i++;
}

@core.Injectable({ inputs: true })
class B {

  @core.Input() c: A;
  @core.Input({type: 'A'}) d: A[];

  constructor(public a: A) {
  }
}

describe('core -> injection', () => {
  it('should work', () => {
    core.beanProvider.register(A);
    core.beanProvider.register(B);
    let b: B = core.beanProvider.getSingletonBean('B');
    b.a.foo.should.be.equal('bar0');
    b.c.should.be.ok();
    b.d.should.be.empty();

    let b2: B = core.beanProvider.getSingletonBean('B');
    b2.a.foo.should.be.equal('bar0');
    b2.should.be.equal(b);

    let a1: A = core.beanProvider.getBean('A');
    let a2: A = core.beanProvider.getBean('A');

    a1.should.not.be.equal(a2);

    b = core.beanProvider.getBean('B', [a1, a2]);
    b.a.foo.should.be.equal('bar0');

    b.c.should.be.equal(a1);
    b.d.should.be.deepEqual([a1, a2]);
  });
});
