// Copyright 2017-2019 @polkadot/ui-staking authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { I18nProps } from '@polkadot/ui-app/types';
import { ApiProps } from '@polkadot/ui-api/types';

import BN from 'bn.js';
import React from 'react';
import { AccountId, Option, StakingLedgers } from '@polkadot/types';
import { Modal, TxButton, TxComponent } from '@polkadot/ui-app';
import { withMulti } from '@polkadot/ui-api';
import styled from 'styled-components'
import dayjs from 'dayjs'
import ReactPaginate from 'react-paginate';
import translate from '../translate';
import { getStakingHistory } from './api';
import { formatNumber } from '@polkadot/util';


type Props = I18nProps & ApiProps & {
  controllerId?: AccountId | null,
  isOpen: boolean,
  onClose: () => void,
  address: string
};

type State = {
  history: Array<any>,
  count: number,
  pageCount: number
};

const StyleWrapper = styled.div`
  color: #302B3C;
  .td, .th{
    display: flex;
    justify-content: center;
    font-weight: bold;
    font-size: 16px;
    text-align: center;
  }

  .th{
    padding: 12px 0;
    &>div{
      flex: 1;
    }
  }

  .td {
    padding: 12px 0;
    &>div{
      flex: 1;
    }
    .earning {
      color:rgba(48,43,60,1);
      background:linear-gradient(315deg, #FE3876 0%, #7C30DD 75%, #3A30DD 100%);
      -webkit-background-clip:text;
      -webkit-text-fill-color:transparent;
    }
  }

  .even{
    background: #FBFBFB;
  }
`

class EraningsDetail extends React.PureComponent<Props, State> {
  state: State = {
    history: [],
    count: 0,
    pageCount: 0
  };

  componentDidMount() {
    this.getStakingHistory()
  }

  componentWillReceiveProps(nextProps: Props) {
    if(nextProps.isOpen === true && this.props.isOpen === false) {
      this.setState({
        history: []
      })
      this.getStakingHistory()
    }
  }

  private getStakingHistory = (page = 0) => {
    const { address } = this.props
    getStakingHistory({
      page,
      address: address
    },(data) => {
      this.setState({
        history: data.data.history,
        count: data.data.count,
        pageCount: (data.data.count%10 > 0) ? (data.data.count/10) : (data.data.count/10 - 1)
      })
    })
  }

  render() {
    const { isOpen, onClose, t } = this.props;
    const { pageCount } = this.state;
    if (!isOpen) {
      return null;
    }

    return (
      <>
        <Modal
          className='staking--Unbond'
          dimmer='inverted'
          open
          onClose={onClose}
        >
          {this.renderContent()}
          <Modal.Actions>
            <ReactPaginate
              previousLabel={'<'}
              nextLabel={'>'}
              breakLabel={'...'}
              breakClassName={'break-me'}
              pageCount={pageCount}
              marginPagesDisplayed={2}
              pageRangeDisplayed={3}
              onPageChange={this.handlePageClick}
              containerClassName={'pagination'}
              subContainerClassName={'pages pagination'}
              activeClassName={'active'}
            />
          </Modal.Actions>
        </Modal>
      </>
    );
  }

  private handlePageClick = data => {
    console.log(data)
    let selected = data.selected;
    this.getStakingHistory(selected)
  };

  private renderContent() {
    const { t } = this.props;
    const { history } = this.state;

    return (
      <>
        <Modal.Content className='ui--signer-Signer-Content'>
          <StyleWrapper>
            <div className="th">
              <div>{t('Date')}</div>
              <div>{t('Era')}</div>
              <div>{t('Type')}</div>
              <div>{t('Reward')}</div>
            </div>
            {history.map((item, index) => (
              <div className={`td ${index%2 === 0 ? 'even' : 'odd'}`} key={item.Id}>
                <div>{this.parserDate(item.block_timestamp)}</div>
                <div>{item.era}</div>
                <div>{item.reward_type}</div>
                <div className="earning">{formatNumber(parseFloat(item.reward))} RING</div>
              </div>
            ))}
          </StyleWrapper>
        </Modal.Content>
      </>
    );
  }

  private nextState(newState: Partial<State>): void {
    this.setState((prevState: State): State => {
      const { history, count, pageCount } = newState;

      return {
        history,
        count,
        pageCount
      };
    });
  }

  private parserDate = (date) => {
    return dayjs(date*1000).format('YYYY-MM-DD HH:mm:ss')
  }
}

export default withMulti(
  styled(EraningsDetail)`
    .ui--signer-Signer-Content {
      padding:0;
    }
  `,
  translate
);
