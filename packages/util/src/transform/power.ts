import BN from 'bn.js';
import { Balance } from '@polkadot/types'
import Bignumber from 'bignumber.js'

const ZERO = new Bignumber(0)
const POWER_CAP = 100000

export default function assetToPower(ringAmount: Balance, ktonAmount: Balance, ringPool: Balance, ktonPool: Balance) {
    let power = ZERO;
    let _div = new Bignumber(0)

    if (!ringPool || (ringPool && ringPool.toString() === '0')) {
        return power
    }

    if (ktonPool && ktonPool.toString() !== '0') {
        _div = new Bignumber(ringPool.toString()).div(new Bignumber(ktonPool.toString()))
    }

    power = new Bignumber(ringAmount.toString()).plus(new Bignumber(ktonAmount.toString()).times(_div)).div(new Bignumber(ringPool.toString()).times(2)).times(POWER_CAP)

    return power
}

export function bondedToPower(bondedAmount: Balance, ringPool: Balance) {
    let power = ZERO;

    if (!ringPool || (ringPool && ringPool.toString() === '0') || !bondedAmount || (bondedAmount && bondedAmount.toString() === '0')) {
        return power
    }

    power = new Bignumber(bondedAmount.toString()).div(new Bignumber(ringPool.toString()).times(2)).times(POWER_CAP)

    return power
}
