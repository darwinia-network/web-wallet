// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import React from 'react';
import { withCalls, withApi, withMulti } from '@polkadot/ui-api';
import styled from 'styled-components'
import { ColorButton, Card, TxButton, Menu, AddressInfoStaking, LabelHelp } from '@polkadot/ui-app';
import EraningsDetail from './EraningsDetail'
import { getStakingHistory } from './api';
import translate from '../translate';

type Props = I18nProps & {
  stashId: string,
  address: string
};

type State = {
  error: string | null,
  isEraningsDetailOpen: boolean,
  sum: string,
  today: string
};

const StyledWrapper = styled.div`
  .titleRow {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    margin-top: 20px;
    margin-bottom: 10px;
    font-size: 16px;
    color: #302B3C;
    text-transform: uppercase;
    font-weight: bold;
  }

  .titleRow::before {
    content: ' ';
    display: inline-block;
    width:3px;
    height:18px;
    background:linear-gradient(315deg,rgba(254,56,118,1) 0%,rgba(124,48,221,1) 71%,rgba(58,48,221,1) 100%);
    margin-right: 0.5rem;
    margin-top: -1px;
  }

  .content {
    background: #fff;
    border: 1px solid #EDEDED;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 25px 20px 27px 57px; 
  }

  .earings-item {
    flex: 1;
    p {
      font-size: 16px;
      color: #302B3C;
      font-weight: bold
    }
    h1 {
      font-size: 26px;
      color:rgba(48,43,60,1);
      font-weight: bold;
      line-height:36px;
      color: #5930DD;
      /* background:linear-gradient(315deg, #FE3876 70%, #7C30DD 85%, #3A30DD 100%); */
      /* background:#5930DD; */
      /* -webkit-background-clip:text;
      -webkit-text-fill-color:transparent; */
      margin-top: 10px;
    }
  }
  .button-box{
    display: flex;
    align-items: center;
    justify-content: center;
  }
`

class Earnings extends React.PureComponent<Props, State> {
  state: State = {
    error: null,
    isEraningsDetailOpen: false,
    sum: '----',
    today: '----'
  };

  toggleEraningsDetail = () => {
    this.setState(({ isEraningsDetailOpen }) => ({
      isEraningsDetailOpen: !isEraningsDetailOpen
    }));
  }

  componentDidMount(){
    this.getStakingHistory()
  }

  componentWillReceiveProps(nextProps: Props) {

    if(nextProps.address !== this.props.address ) {
      this.getStakingHistory(0, nextProps.address)
      return true
    }
  }

  private getStakingHistory = (page = 0, address = this.props.address) => {
    
    getStakingHistory({
      page,
      address: address
    },(data) => {
      this.setState({
        sum: data.data.sum,
        today: data.data.today
      })
    })
  }

  render() {
    const { t, address } = this.props
    const { isEraningsDetailOpen, sum, today } = this.state
    return (
      <StyledWrapper>
        <div className={'titleRow'}>
          {t('EARNINGS')}
        </div>
        <div className="content">
          <div className="earings-item">
            <p>{t('Earnings')}</p>
            <h1>{sum}</h1>
          </div>
          <div className="earings-item">
            <p>{t('Today')}</p>
            <h1>{today}</h1>
          </div>
          <div className="button-box">
            <ColorButton
              key='detail'
              onClick={this.toggleEraningsDetail}
            >{t('Detail')}</ColorButton>
          </div>
        </div>
        {address ? <EraningsDetail
          isOpen={isEraningsDetailOpen}
          onClose={this.toggleEraningsDetail}
          address={address}
        /> : null}
      </StyledWrapper>
    );
  }
}

export default withMulti(
  Earnings,
  translate,
)
