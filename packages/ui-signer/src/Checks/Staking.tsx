// Copyright 2017-2019 @polkadot/ui-signer authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DerivedFees } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { ExtraFees } from './types';

import BN from 'bn.js';
import React from 'react';
import { Compact, UInt } from '@polkadot/types';
import { withCalls, withMulti } from '@polkadot/ui-api';
import { Icon } from '@polkadot/ui-app';
import { formatBalance } from '@polkadot/util';

import translate from '../translate';

type Props = I18nProps & {
  value: BN | Compact<UInt>,
  fees: DerivedFees,
  onChange: (fees: ExtraFees) => void
};

type State = ExtraFees & {

};

export class Staking extends React.PureComponent<Props, State> {
  state: State = {
    extraFees: new BN(0),
    extraAmount: new BN(0),
    extraWarn: false,

  };

  static getDerivedStateFromProps ({ value = new BN(0), onChange }: Props): State {
    const extraAmount = value instanceof Compact
      ? value.toBn()
      : value;

    const update = {
      extraAmount,
      extraFees: new BN(0),
      extraWarn: false
    };

    // onChange(update);

    return {
      ...update,
    };
  }

  render () {
    const { t } = this.props;
    const { extraAmount } = this.state;

    return (
      <>
        {
          extraAmount.isZero()
            ? undefined
            : <div><Icon name='arrow right' />{t('The Staking totalling {{staking}} will be applied to the submission', {
              replace: {
                staking: formatBalance(extraAmount)
              }
            })}</div>
        }
      </>
    );
  }
}

export default withMulti(
  Staking,
  translate,
  withCalls<Props>()
);
