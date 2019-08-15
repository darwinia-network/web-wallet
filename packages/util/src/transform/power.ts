import BN from 'bn.js';

const ZERO = new BN(0);

export default function assetToPower(value: BN, type: string) {
    let power = ZERO;
    if (type === 'ring') {
        power = power.add(new BN(value.div(new BN(10000))));
    }

    if (type === 'kton') {
        power = power.add(value)
    }

    return power
}