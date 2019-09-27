// Copyright 2017-2019 @polkadot/app-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { DerivedBalancesMap } from '@polkadot/api-derive/types';
import { I18nProps } from '@polkadot/ui-app/types';
import { BlockNumber } from '@polkadot/types';
import styled from 'styled-components';

import BN from 'bn.js';
import React from 'react';
import SummarySession from '@polkadot/app-explorer/SummarySession';
import { CardSummary, IdentityIcon, SummaryBox } from '@polkadot/ui-app';
import { withCalls, withMulti } from '@polkadot/ui-api';

import translate from '../translate';


type Props = I18nProps & {
  balances: DerivedBalancesMap,
  controllers: Array<string>,
  lastAuthor?: string,
  lastBlock: string,
  lastBlockBN: BlockNumber,
  staking_validatorCount?: BN,
  validators: Array<string>
};

class Summary extends React.PureComponent<Props> {
  render() {
    const { className, controllers, lastAuthor, lastBlock, style, t, staking_validatorCount, validators, lastBlockBN } = this.props;
    const waiting = controllers.length > validators.length
      ? (controllers.length - validators.length)
      : 0;

    return (
      <StyledWrapper>
        <SummaryBox
          className={className}
          style={style}
        >
          <section>
            <CardSummary label={t('validators')}>
              {validators.length}/{staking_validatorCount ? staking_validatorCount.toString() : '-'}
            </CardSummary>
            <CardSummary label={t('waiting')}>
              {waiting}
            </CardSummary>
          </section>
          <section>
            {<SummarySession lastBlockBN={lastBlockBN}/>}
          </section>
          <section>
            <CardSummary label={t('last block')}>
              {lastBlock}
            </CardSummary>
          </section>
        </SummaryBox>
      </StyledWrapper>
    );
  }
}

const StyledWrapper = styled.div`
  background: #fff;
  padding: 55px;
  border-radius:2px;
  border:1px solid rgba(237,237,237,1);

  .ui--Labelled-content{
    margin-top: 28px;
    font-size: 40px;
  }

  @media (max-width: 767px) {
    padding: 0;
    .ui--Labelled-content{
      margin-top: 10px;
      font-size: 16px;
    }
  }
`


export default withMulti(
  Summary,
  translate,
  withCalls<Props>('query.staking.validatorCount')
);
