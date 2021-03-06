// Copyright 2017-2019 @polkadot/ui-app authors & contributors
// This software may be modified and distributed under the terms
// of the Apache-2.0 license. See the LICENSE file for details.

import { BareProps, BitLength, I18nProps } from './types';

import BN from 'bn.js';
import React from 'react';
import { formatBalance, isUndefined, formatKtonBalance } from '@polkadot/util';

import { classes } from './util';
import { BitLengthOption } from './constants';
import Button from './Button';
import Dropdown from './Dropdown';
import Input, { KEYS, KEYS_PRE } from './Input';
import translate from './translate';

type Props = BareProps & I18nProps & {
  autoFocus?: boolean,
  bitLength?: BitLength,
  defaultValue?: BN | string,
  help?: React.ReactNode,
  isDisabled?: boolean,
  isError?: boolean,
  isSi?: boolean,
  isType?: boolean,
  siValue?: string,
  isDecimal?: boolean,
  label?: any,
  maxLength?: number,
  maxValue?: BN,
  minValue?: BN,
  onChange?: (value?: BN) => void,
  onChangeType?: (value?: string) => void,
  onEnter?: () => void,
  placeholder?: string,
  value?: BN | string,
  withEllipsis?: boolean,
  withLabel?: boolean,
  withMax?: boolean,
  rightLabel?: string,
  power?: number
};

type State = {
  isPreKeyDown: boolean,
  isValid: boolean,
  siOptions: Array<{ value: string, text: string }>,
  siUnit: string,
  value: string,
  valueBN: BN,
  type: string
};

const DEFAULT_BITLENGTH = BitLengthOption.NORMAL_NUMBERS as BitLength;
const ZERO = new BN(0);
const TEN = new BN(10);

class InputNumber extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);

    const { defaultValue, isSi, value, siValue } = this.props;
    let valueBN = new BN(value || 0);
    const commonFormatBalance = (siValue === 'kton' ? formatKtonBalance : formatBalance);
    const si = commonFormatBalance.findSi('-');
    this.state = {
      value: isSi
        ? new BN(defaultValue || valueBN).div(new BN(10).pow(new BN(si.power))).toString()
        : (defaultValue || valueBN).toString(),
      isPreKeyDown: false,
      isValid: !isUndefined(value),
      siOptions: commonFormatBalance.getOptions().map(({ power, text, value }) => ({
        value,
        // text: power === 0
        //   ? InputNumber.units
        //   : text
        text
      })),
      siUnit: si.value,
      valueBN,
      type: 'ring'
    };
  }

  static units: string = 'Unit';
  static setUnit(units: string = InputNumber.units): void {
    InputNumber.units = units;
  }

  static getDerivedStateFromProps({ isDisabled, isSi, defaultValue = '0', siValue }: Props): Partial<State> | null {
    if (!isDisabled || !isSi) {
      return null;
    }
    const commonFormatBalance = (siValue === 'kton' ? formatKtonBalance : formatBalance);

    return {
      value: commonFormatBalance(defaultValue, false),
      siUnit: commonFormatBalance.calcSi(defaultValue.toString(), commonFormatBalance.getDefaults().decimals).value
    };
  }

  render() {
    const { bitLength = DEFAULT_BITLENGTH, className, help, isSi, isType, isDisabled, isError = false, maxLength, maxValue, minValue, onEnter, style, withMax, t, placeholder, rightLabel } = this.props;
    const { isValid, value } = this.state;
    const maxValueLength = this.maxValue(bitLength).toString().length - 1;

    return (
      <>
        <Input
          {...this.props}

          className={classes('ui--InputNumber', rightLabel ? 'ui--InputNumber-RightLabel' : undefined, className)}
          help={help}
          isAction={isSi}
          isDisabled={isDisabled}
          isError={!isValid || isError}
          maxLength={maxLength || maxValueLength}
          min={minValue}
          onChange={this.onChange}
          onEnter={onEnter}
          onKeyDown={this.onKeyDown}
          onKeyUp={this.onKeyUp}
          onPaste={this.onPaste}
          placeholder={placeholder || t('Positive number')}
          style={style}
          type='text'
          value={value}
        >
          {(withMax && !!maxValue) && this.renderMaxButton()}
          {isSi && this.renderSiDropdown()}
          {isType && this.renderTypeDropdown()}
          {rightLabel && this.renderRightLabel()}
        </Input>

      </>
    );
  }

  private renderRightLabel() {
    const { rightLabel } = this.props;

    return (<div className="ui basic label label">{rightLabel}</div>)
  }

  private renderSiDropdown() {
    const { siOptions, siUnit } = this.state;

    return (
      <Dropdown
        dropdownClassName='ui--SiDropdown'
        isButton
        defaultValue={siUnit}
        onChange={this.selectSiUnit}
        options={siOptions}
      />
    );
  }

  private renderTypeDropdown() {
    const { siOptions, siUnit, type } = this.state;
    const typeOptions = [{
      text: 'RING',
      value: 'ring'
    }, {
      text: 'KTON',
      value: 'kton'
    }];

    return (
      <Dropdown
        dropdownClassName='ui--TypeDropdown'
        isButton

        onChange={this.selectType}
        options={typeOptions}
        defaultValue={type}
      />
    );
  }

  private renderMaxButton() {
    const { valueBN } = this.state;
    const { maxValue } = this.props;

    if (!maxValue || valueBN.eq(maxValue)) {
      return;
    }

    return (
      <Button
        className='ui--MaxButton'
        onClick={this.setToMaxValue}
      >
        Max
      </Button>
    );
  }

  private maxValue(bitLength?: number): BN {
    return new BN(2).pow(new BN(bitLength || DEFAULT_BITLENGTH)).subn(1);
  }

  private isValidBitLength(value: BN, bitLength?: number): boolean {
    return value.bitLength() <= (bitLength || DEFAULT_BITLENGTH);
  }

  private isValidNumber(input: BN, bitLength: number = DEFAULT_BITLENGTH): boolean {
    const { maxValue, withMax } = this.props;
    const maxBN = this.maxValue(bitLength);

    if (
      input.lt(new BN(0)) ||
      !input.lt(maxBN) ||
      !this.isValidBitLength(input, bitLength) ||
      (withMax && maxValue !== undefined && maxValue.gtn(0) && input.gt(maxValue))
    ) {
      return false;
    }

    return true;
  }

  private regex = (): RegExp => {
    const { isDecimal = true, isSi } = this.props;
    return new RegExp(
      (isSi || isDecimal) ?
        `^(0|[1-9]\\d*)(\\${KEYS.DECIMAL}\\d*)?$` :
        `^(0|[1-9]\\d*)$`
    );
  }

  private onChange = (value: string): void => {
    const { bitLength, onChange } = this.props;
    const { siUnit } = this.state;

    try {
      const valueBN = this.inputValueToBn(value, siUnit);
      const isValid = this.isValidNumber(valueBN, bitLength);

      this.setState({ isValid, value, valueBN });

      onChange && onChange(
        isValid
          ? valueBN
          : undefined
      );
    } catch (error) {
      console.error(error);
    }
  }

  private onKeyDown = (event: React.KeyboardEvent<Element>): void => {
    const { isPreKeyDown } = this.state;

    if (KEYS_PRE.includes(event.key)) {
      this.setState({ isPreKeyDown: true });
      return;
    }

    if (event.key.length === 1 && !isPreKeyDown) {
      const { selectionStart: i, selectionEnd: j, value } = event.target as HTMLInputElement;
      const newValue = `${
        value.substring(0, i!)
        }${
        event.key
        }${
        value.substring(j!)
        }`;

      if (!this.regex().test(newValue)) {
        event.preventDefault();
      }
    }
  }

  private onKeyUp = (event: React.KeyboardEvent<Element>): void => {
    if (KEYS_PRE.includes(event.key)) {
      this.setState({ isPreKeyDown: false });
    }
  }

  private onPaste = (event: React.ClipboardEvent<Element>): void => {
    const { value: newValue } = event.target as HTMLInputElement;

    if (!this.regex().test(newValue)) {
      event.preventDefault();
      return;
    }
  }

  private selectSiUnit = (siUnit: string): void => {
    this.setState((prevState: State) => {
      const { bitLength, onChange } = this.props;
      const valueBN = this.inputValueToBn(prevState.value, siUnit);
      const isValid = this.isValidNumber(valueBN, bitLength);

      onChange && onChange(
        isValid
          ? prevState.valueBN
          : undefined
      );

      return {
        isValid,
        siUnit,
        valueBN
      };
    });
  }

  private selectType = (type: string): void => {
    const { onChangeType } = this.props
    onChangeType(type);
    this.setState((prevState: State) => {
      return {
        type: type
      };
    });
  }

  private setToMaxValue = () => {
    this.setState((prevState: State) => {
      const { bitLength, maxValue, onChange } = this.props;
      const { siUnit = prevState.siUnit } = this.state;

      if (!maxValue) {
        return {} as State;
      }

      const isValid = this.isValidNumber(maxValue, bitLength);

      onChange && onChange(
        isValid
          ? maxValue
          : undefined
      );

      return {
        value: this.bnToInputValue(maxValue, siUnit),
        valueBN: maxValue,
        isValid
      };
    });
  }

  private inputValueToBn = (value: string, siUnit?: string): BN => {
    const [siPower, basePower, siUnitPower] = this.getSiPowers(siUnit);

    const isDecimalValue = value.match(/^(\d+)\.(\d+)$/);

    if (isDecimalValue) {
      if (siUnitPower - isDecimalValue[2].length < -basePower) {
        return new BN(-1);
      }

      const div = new BN(value.replace(/\.\d*$/, ''));
      const modString = value.replace(/^\d+\./, '')
      const mod = new BN(modString);

      return div
        .mul(TEN.pow(siPower))
        .add(mod.mul(TEN.pow(new BN(basePower + siUnitPower - modString.length))));
    } else {
      return new BN(value.replace(/[^\d]/g, ''))
        .mul(TEN.pow(siPower));
    }
  }

  private bnToInputValue = (bn: BN, siUnit?: string): string => {
    const [siPower] = this.getSiPowers(siUnit);

    const base = TEN.pow(siPower);
    const div = bn.div(base);
    const mod = bn.mod(base);

    return `${
      div.gt(ZERO) ? div.toString() : '0'
      }${
      mod.gt(ZERO) ?
        (() => {
          const padding = Math.max(
            mod.toString().length,
            base.toString().length - div.toString().length,
            bn.toString().length - div.toString().length
          );
          return `.${mod.toString(10, padding).replace(/0*$/, '')}`;
        })() :
        ''
      }`;
  }

  private getSiPowers = (siUnit = this.state.siUnit): [BN, number, number] => {
    const { isSi = true, siValue, power = 0 } = this.props;

    const commonFormatBalance = (siValue === 'kton' ? formatKtonBalance : formatBalance);
    const basePower = isSi ? commonFormatBalance.getDefaults().decimals : 0;
    const siUnitPower = isSi ? commonFormatBalance.findSi(siUnit).power : power;

    return [new BN(basePower + siUnitPower), basePower, siUnitPower];
  }
}

export {
  InputNumber
};

export default translate(InputNumber);
