import BN from 'bn.js';
import { AccountId, Balance, BlockNumber, Exposure, Index, StakingLedger, StructAny, ValidatorPrefs, Vote } from '@polkadot/types';
export interface DerivedRingBalances extends StructAny {
  freeBalance: BN;
}
