// Copyright 2017-2019 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Compact from '../codec/Compact';
import Struct from '../codec/Struct';
import Balance from './Balance';
import Moment from '../primitive/Moment';

/**
 * @name DepositItem
 * @description
 * Just a Balance/BlockNumber tuple to encode when a chunk of funds will be unlocked
 */
export default class DepositItem extends Struct {
  constructor (value?: any) {
    super({
      value: Compact.with(Balance),
      start_time: Compact.with(Moment),
      expire_time: Compact.with(Moment),
    }, value);
  }

  /**
   * @description Amount of funds to be unlocked
   */
  get value (): Balance {
    return (this.get('value') as Compact<Balance>).toBn() as Balance;
  }

  get start_time (): Moment {
    return (this.get('start_time') as Compact<Moment>).unwrap() as Moment;
  }

  get expire_time (): Moment {
    return (this.get('expire_time') as Compact<Moment>).unwrap() as Moment;
  }

}
