/**
 * @format
 */

import 'react-native';
import React from 'react';

import { render } from '@testing-library/react-native';
import About from '../components/About';
import { ContextLoadedProvider } from '../app/context';
import {
  ErrorModalData,
  ReceivePageState,
  SendPageState,
  SendProgress,
  SyncStatusReport,
  ToAddr,
  TotalBalance,
  WalletSettings,
} from '../app/AppState';

jest.useFakeTimers();
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

// test suite
describe('Component About - test', () => {
  //snapshot test
  test('About - snapshot', () => {
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
      info: null,
      rescanning: false,
      wallet_settings: new WalletSettings(),
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
      translate: () => [
        '1 text translated line 1',
        '2 text translated line 2',
        '3 text translated line 3',
        '4 text translated line 4',
        '5 text translated line 5',
      ],
      totalBalance: new TotalBalance(),
    };
    const about = render(
      <ContextLoadedProvider value={state}>
        <About closeModal={() => {}} />
      </ContextLoadedProvider>,
    );
    expect(about.toJSON()).toMatchSnapshot();
  });
});
