/**
 * @format
 */

import 'react-native';
import React from 'react';

import { render } from '@testing-library/react-native';
import Settings from '../components/Settings';
import { ContextLoadedProvider } from '../app/context';

import {
  ErrorModalData,
  InfoType,
  ReceivePageState,
  SendPageState,
  SendProgress,
  SyncStatusReport,
  ToAddr,
  TotalBalance,
  WalletSettings,
} from '../app/AppState';

jest.mock('@fortawesome/react-native-fontawesome', () => ({
  FontAwesomeIcon: '',
}));
jest.mock('react-native-localize', () => ({
  getNumberFormatSettings: () => {
    return {
      decimalSeparator: '.',
      groupingSeparator: ',',
    };
  },
}));
jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
jest.useFakeTimers();

// test suite
describe('Component Settings - test', () => {
  //snapshot test
  const state = {
    navigation: null,
    route: null,
    dimensions: {} as {
      width: number;
      height: number;
      orientation: 'portrait' | 'landscape';
      deviceType: 'tablet' | 'phone';
      scale: number;
    },

    syncStatusReport: new SyncStatusReport(),
    addressPrivateKeys: new Map(),
    addresses: [],
    addressBook: [],
    transactions: null,
    sendPageState: new SendPageState(new ToAddr(0)),
    receivePageState: new ReceivePageState(),
    info: {} as InfoType,
    rescanning: false,
    syncingStatus: null,
    errorModalData: new ErrorModalData(),
    txBuildProgress: new SendProgress(),
    walletSeed: null,
    isMenuDrawerOpen: false,
    selectedMenuDrawerItem: '',
    aboutModalVisible: false,
    computingModalVisible: false,
    settingsModalVisible: false,
    infoModalVisible: false,
    rescanModalVisible: false,
    seedViewModalVisible: false,
    seedChangeModalVisible: false,
    seedBackupModalVisible: false,
    seedServerModalVisible: false,
    syncReportModalVisible: false,
    poolsModalVisible: false,
    newServer: null,
    uaAddress: null,
    translate: (p: string) => {
      if (p === 'settings.memos') {
        return [
          {
            value: 'none',
            text: 'text none',
          },
          {
            value: 'wallet',
            text: 'text wallet',
          },
          {
            value: 'all',
            text: 'text all',
          },
        ];
      } else {
        return 'text translated';
      }
    },
    totalBalance: new TotalBalance(),
    wallet_settings: new WalletSettings(),
  };
  state.info.currencyName = 'ZEC';
  state.totalBalance.total = 1.12345678;
  state.wallet_settings.server = 'https://zcash.es';
  const onClose = jest.fn();
  const onSetOption = jest.fn();
  test('Settings - snapshot', () => {
    const settings = render(
      <ContextLoadedProvider value={state}>
        <Settings closeModal={onClose} set_wallet_option={onSetOption} set_server_option={onSetOption} />
      </ContextLoadedProvider>,
    );
    expect(settings.toJSON()).toMatchSnapshot();
  });
});
