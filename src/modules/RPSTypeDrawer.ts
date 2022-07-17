import type { RPSCharacterType } from '@/modules/types';

export default class RPSTypeDrawer {
  distance = 0;
  private type: RPSCharacterType;
  private index_ = 0;
  private angle_ = 0;

  constructor (type: RPSCharacterType) {
    this.type = type;
  }

  set index (index: number) {
    this.index_ = index;
  }

  get index () {
    return this.index_;
  }
}