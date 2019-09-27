// Copyright 2017-2019 @polkadot/types authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import Compact from '../codec/Compact';
import Struct from '../codec/Struct';
import Vector from '../codec/Vector';
import UInt from '../codec/UInt';
import AccountId from '../primitive/AccountId';
import Balance from './Balance';
import Unlocking from './Unlocking';
import DepositItem from './DepositItem'
import { any } from 'prop-types';

/**
 * @name Ledger
 * @description
 * The ledger of a (bonded) stash
 */
export default class Ledger extends Struct {
  constructor (value?: any) {
    super({
      stash: AccountId,
      total_ring: Compact.with(Balance),
      total_deposit_ring: Compact.with(Balance),
      active_ring: Compact.with(Balance),
      active_deposit_ring: Compact.with(Balance),
      total_kton: Compact.with(Balance),
      active_kton: Compact.with(Balance),
      deposit_items: Vector.with(DepositItem),
      unlocking: Vector.with(Unlocking)
    }, value);
  }

  get stash (): AccountId {
    return this.get('stash') as AccountId;
  }

  get total_ring (): Balance {
    return (this.get('total_ring') as Compact<Balance>).toBn() as Balance;
  }

  get total_deposit_ring (): Balance {
    return (this.get('total_deposit_ring') as Compact<Balance>).toBn() as Balance;
  }

  get active_ring (): Balance {
    return (this.get('active_ring') as Compact<Balance>).toBn() as Balance;
  }

  get active_deposit_ring (): Balance {
    return (this.get('active_deposit_ring') as Compact<Balance>).toBn() as Balance;
  }

  get total_kton (): Balance {
    return (this.get('total_kton') as Compact<Balance>).toBn() as Balance;
  }

  get active_kton (): Balance {
    return (this.get('active_kton') as Compact<Balance>).toBn() as Balance;
  }

  get deposit_items (): Vector<DepositItem> {
    return this.get('deposit_items')  as Vector<DepositItem>;
  }

  get unlocking (): Vector<Unlocking> {
    return this.get('unlocking') as Vector<Unlocking>;
  }
}
