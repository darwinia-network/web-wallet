// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps } from './types';

import React from 'react';
import SUIModal from 'semantic-ui-react/dist/commonjs/modules/Modal/Modal';
import settings from '@polkadot/ui-settings';

import styled from 'styled-components'
import { classes } from './util';
import ModalCloseIcon from './styles/icon/modal-close.svg'
import { noop } from 'rxjs';

type Props = BareProps & {
  children: React.ReactNode,
  [index: string]: any
};

const Wrapper = styled.div`
 
  img{
    width: 48px;
    height: 48px;
    top: 0px;
    position: absolute;
    right: -64px;
    cursor: pointer;
  }
`
export default class Modal extends React.PureComponent<Props> {
  static Actions = SUIModal.Actions;
  static Content = SUIModal.Content;
  static Header = SUIModal.Header;
  static Description = SUIModal.Description;

  render () {
    const { className, children, onClose } = this.props;
    return (
      <SUIModal
        {...this.props}
        className={classes(`theme--${settings.uiTheme}`, 'ui--Modal', className)}
      >
        {children}
        <Wrapper><img onClick={onClose || noop} src={ModalCloseIcon}/></Wrapper>
      </SUIModal>
    );
  }
}
