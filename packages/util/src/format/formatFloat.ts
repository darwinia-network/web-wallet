// Copyright 2017-2019 @polkadot/util authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import formatDecimal from './formatDecimal';

export default function formatFloat (_value?: string | null): string {
  if (!_value) {
    return '0';
  }

  const _f = _value.split('.')[0];
  const _l = _value.split('.')[1];

  const value = formatDecimal(_f) + '.' + (_l || '000').substr(0,3);
  // const value = (_value as any).toBn
  //   ? (_value as Compact).toBn()
  //   : bnToBn(_value as BN);

  return value;
}
