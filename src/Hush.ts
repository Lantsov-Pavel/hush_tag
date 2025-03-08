import { Field, SmartContract, state, State, method } from 'o1js';

export class Hush extends SmartContract {
  @state(Field) used = State<Field>();

  init() {
    super.init();
    this.used.set(Field(0));
  }

  @method async update() {
    const currentState = this.used.get();
    this.used.requireEquals(currentState);
    currentState.assertEquals(Field(0));
    this.used.set(Field(1));
  }
}