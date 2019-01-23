import { WAD, RAY } from '@makerdao/dai/utils/constants';
import BigNumber from 'bignumber.js';
import {
  getIlkForCurrency,
  getSpotContractNameForCurrency,
  getPipContractNameForCurrency
} from './utils';
import { USD } from '@makerdao/dai';

export default class CdpType {
  constructor(smartContractService, currency) {
    this._smartContract = smartContractService;
    this._currency = currency;
    this.ilkId = currency.symbol; //for now the ilkId is just the currency symbol, but this isn't necessarily always the case
    this._ilkBytes = getIlkForCurrency(currency);
  }

  async getTotalCollateral(unit = this._currency) {
    const ilkInfo = await this._vatContract().ilks(this._ilkBytes);
    const Ink = ilkInfo.Ink;
    const collateralValue = new BigNumber(Ink.toString())
      .dividedBy(WAD)
      .toNumber();
    if (unit === this._currency) return collateralValue;

    if (unit === USD) {
      const collateralPrice = await this.getPrice();
      return collateralValue * collateralPrice;
    }

    throw new Error(
      `Don't know how to get total collateral in ${
        unit.symbol ? unit.symbol : unit
      }`
    );
  }

  async getTotalDebt() {
    const ilkInfo = await this._vatContract().ilks(this._ilkBytes);
    const Art = ilkInfo.Art;
    return new BigNumber(Art.toString()).dividedBy(WAD).toNumber();
  }

  async getDebtCeiling() {
    const ilkInfo = await this._pitContract().ilks(this._ilkBytes);
    const line = ilkInfo.line;
    return new BigNumber(line.toString()).dividedBy(WAD).toNumber();
  }

  async getLiquidationRatio() {
    const spotContract = this._spotContract();
    const mat = await spotContract.mat();
    return new BigNumber(mat.toString()).dividedBy(RAY).toNumber();
  }

  async getPrice() {
    const pipContract = this._pipContract();
    const val = (await pipContract.peek())[0];
    return new BigNumber(val.toString()).dividedBy(RAY).toNumber();
  }

  async getLiquidationPenalty() {
    const ilkInfo = await this._catContract().ilks(this._ilkBytes);
    const chop = ilkInfo.chop;
    return new BigNumber(chop.toString())
      .dividedBy(RAY)
      .minus(1)
      .toNumber();
  }

  async getAnnualStabilityFee() {
    const ilkInfo = await this._dripContract().ilks(this._ilkBytes);
    const tax = ilkInfo.tax;
    const taxBigNumber = new BigNumber(tax.toString()).dividedBy(RAY);
    const secondsPerYear = 60 * 60 * 24 * 365;
    BigNumber.config({ POW_PRECISION: 100 });
    return taxBigNumber
      .pow(secondsPerYear)
      .minus(1)
      .toNumber();
  }

  // Helpers ----------------------------------------------

  _dripContract() {
    return this._smartContract.getContract('MCD_DRIP');
  }

  _pipContract() {
    return this._smartContract.getContract(
      getPipContractNameForCurrency(this._currency)
    );
  }

  _spotContract() {
    return this._smartContract.getContract(
      getSpotContractNameForCurrency(this._currency)
    );
  }

  _catContract() {
    return this._smartContract.getContract('MCD_CAT');
  }

  _pitContract() {
    return this._smartContract.getContract('MCD_PIT');
  }

  _vatContract() {
    return this._smartContract.getContract('MCD_VAT');
  }
}