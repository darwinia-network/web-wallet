// Copyright 2017-2019 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.
import Compact from '../codec/Compact';
import Enum from '../codec/Enum';
import Balance from './Balance';

/**
 * @name UnlockingValue
 * @description
 * A destination account for payment
 */
export default class UnlockingValue extends Enum {
  constructor (value?: any) {
    super({
      "Ring":  Balance,
      "Kton":  Balance
    }, value);
  }
}
