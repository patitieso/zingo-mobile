import React, { ReactNode } from 'react';
import { StackScreenProps } from '@react-navigation/stack';

import {
  AppStateLoading,
  DimensionsType,
  InfoType,
  TotalBalanceClass,
  WalletSeedType,
  zecPriceType,
  backgroundType,
} from '../AppState';

export const defaultAppStateLoading: AppStateLoading = {
  navigation: {} as StackScreenProps<any>['navigation'],
  route: {} as StackScreenProps<any>['route'],
  dimensions: {} as DimensionsType,
  appState: '' as string,

  screen: 0,
  actionButtonsDisabled: false,
  walletExists: false,
  walletSeed: {} as WalletSeedType,
  totalBalance: new TotalBalanceClass(),
  info: {} as InfoType,

  server: '' as string,
  currency: '',
  language: 'en',

  zecPrice: {
    zecPrice: 0,
    date: 0,
  } as zecPriceType,
  sendAll: false,
  background: {
    batches: 0,
    date: 0,
  } as backgroundType,

  translate: () => '',
};

export const ContextLoading = React.createContext(defaultAppStateLoading);

type ContextProviderProps = {
  children: ReactNode;
  value: AppStateLoading;
};

export const ContextLoadingProvider = ({ children, value }: ContextProviderProps) => {
  return <ContextLoading.Provider value={value}>{children}</ContextLoading.Provider>;
};