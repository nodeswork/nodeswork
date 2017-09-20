import * as should from 'should';

import * as kiws from '../../src/kiws';

@kiws.Injectable()
class A {
  static i = 0;

  foo = 'bar' + A.i++;
}

@kiws.Injectable({ inputs: true })
class B {

  @kiws.Input() c: A;
  @kiws.Input({type: 'A'}) d: A[];

  constructor(public a: A) {
  }
}

describe('kiws -> injection', () => {
  it('should work', () => {
    kiws.beanProvider.register(A);
    kiws.beanProvider.register(B);
    let b: B = kiws.beanProvider.getSingletonBean('B');
    b.a.foo.should.be.equal('bar0');
    b.c.should.be.ok();
    b.d.should.be.empty();

    let b2: B = kiws.beanProvider.getSingletonBean('B');
    b2.a.foo.should.be.equal('bar0');
    b2.should.be.equal(b);

    let a1: A = kiws.beanProvider.getBean('A');
    let a2: A = kiws.beanProvider.getBean('A');

    a1.should.not.be.equal(a2);

    b = kiws.beanProvider.getBean('B', [a1, a2]);
    b.a.foo.should.be.equal('bar0');

    b.c.should.be.equal(a1);
    b.d.should.be.deepEqual([a1, a2]);
  });
});
