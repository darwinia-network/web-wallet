// Copyright 2017-2019 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Compact from '../codec/Compact';
import Struct from '../codec/Struct';
import Balance from './Balance';
import BlockNumber from './BlockNumber';
import U32 from '../primitive/U32'
import UnlockingValue from './UnlockingValue'
import Bool from '../primitive/Bool';
import UInt from '../codec/UInt';
/**
 * @name Unlocking
 * @description
 * Just a Balance/BlockNumber tuple to encode when a chunk of funds will be unlocked
 */
export default class Unlocking extends Struct {
  constructor (value?: any) {
    super({
      value: UnlockingValue,
      era: Compact.with(U32),
      is_time_deposit: Bool
    }, value);
  }

  /**
   * @description Era number at which point it'll be unlocked
   */
  get era (): U32 {
    return (this.get('era') as Compact<UInt>).toBn() as U32;
  }

  /**
   * @description Amount of funds to be unlocked
   */
  get value (): UnlockingValue {
    return this.get('value') as UnlockingValue;
  }

  get is_time_deposit(): Bool{
    return this.get('is_time_deposit') as Bool;
  }
}
