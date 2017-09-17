import 'reflect-metadata';

interface Component {
}


function Component() {
}

interface WorkerComponent extends Component {
}

interface AccountComponent extends Component {
}

interface ServiceComponent extends Component {
}

interface Module {
  depends:  Module[];
  workers:  WorkerComponent[];
  accounts: AccountComponent[];
  services: ServiceComponent[];
}

// @NwModule({
  // declarations: [
    // TradeContract,
  // ],
// })
class NodesworkModule {}

class TradeEventProducer {
}

interface Worker<T> {
  work(): T;
}

function ScheduleWorker() {
  return injectConstructor;
}

class FifaAccount {
}

@ScheduleWorker()
class TradeContract implements Worker<void> {

  @Input({ type: 'FifaAccount' }) fifaAccount: FifaAccount[];

  constructor(private tradeEventProducer: TradeEventProducer) {
  }

  async work() {
    // this.fifaAccount;
    // this.fifaAccounts[0];
    // this.tradeEventProducer.send();
    // otherWorker.work();
  }
}

// let a : TradeContract;
// a.newProperty
