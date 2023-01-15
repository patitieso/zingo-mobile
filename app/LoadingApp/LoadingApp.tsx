/* eslint-disable react-native/no-inline-styles */
import React, { Component, Suspense, useState, useMemo, useCallback, useEffect } from 'react';
import {
  View,
  Alert,
  SafeAreaView,
  Image,
  Text,
  Modal,
  ScrollView,
  I18nManager,
  Dimensions,
  EmitterSubscription,
  ScaledSize,
  AppState,
  NativeEventSubscription,
} from 'react-native';
import Toast from 'react-native-simple-toast';
import { useTheme } from '@react-navigation/native';
import { I18n, TranslateOptions } from 'i18n-js';
import * as RNLocalize from 'react-native-localize';
import { StackScreenProps } from '@react-navigation/stack';

import BoldText from '../../components/Components/BoldText';
import Button from '../../components/Button';
import RPCModule from '../../components/RPCModule';
import { AppStateLoading, backgroundType, WalletSeedType } from '../AppState';
import { serverUris } from '../uris';
import SettingsFileImpl from '../../components/Settings/SettingsFileImpl';
import RPC from '../rpc';
import { ThemeType } from '../types';
import { defaultAppStateLoading, ContextLoadingProvider } from '../context';
import platform from '../platform/platform';
import BackgroundFileImpl from '../../components/Background/BackgroundFileImpl';

const Seed = React.lazy(() => import('../../components/Seed'));

const en = require('../translations/en.json');
const es = require('../translations/es.json');

//const useForceUpdate = () => {
//  const [value, setValue] = useState(0);
//  return () => {
//    const newValue = value + 1;
//    return setValue(newValue);
//  };
//};

type LoadingAppProps = {
  navigation: StackScreenProps<any>['navigation'];
  route: StackScreenProps<any>['route'];
};

const SERVER_DEFAULT_0 = serverUris()[0];
const SERVER_DEFAULT_1 = serverUris()[1];

export default function LoadingApp(props: LoadingAppProps) {
  const theme = useTheme() as unknown as ThemeType;
  const [language, setLanguage] = useState('en' as 'en' | 'es');
  const [currency, setCurrency] = useState('' as 'USD' | '');
  const [server, setServer] = useState(SERVER_DEFAULT_0 as string);
  const [sendAll, setSendAll] = useState(false);
  const [background, setBackground] = useState({ batches: 0, date: 0 } as backgroundType);
  const [loading, setLoading] = useState(true);
  //const forceUpdate = useForceUpdate();
  const file = useMemo(
    () => ({
      en: en,
      es: es,
    }),
    [],
  );
  const i18n = useMemo(() => new I18n(file), [file]);

  const translate = (key: string, config?: TranslateOptions) => i18n.t(key, config);

  const setI18nConfig = useCallback(async () => {
    // fallback if no available language fits
    const fallback = { languageTag: 'en', isRTL: false };

    //console.log(RNLocalize.findBestAvailableLanguage(Object.keys(file)));
    //console.log(RNLocalize.getLocales());

    const { languageTag, isRTL } = RNLocalize.findBestAvailableLanguage(Object.keys(file)) || fallback;

    // clear translation cache
    //if (translate && translate.cache) {
    //  translate?.cache?.clear?.();
    //}
    // update layout direction
    I18nManager.forceRTL(isRTL);

    //I have to check what language is in the settings
    const settings = await SettingsFileImpl.readSettings();
    if (settings.language) {
      setLanguage(settings.language);
      i18n.locale = settings.language;
      //console.log('apploading settings', settings.language, settings.currency);
    } else {
      const lang =
        languageTag === 'en' || languageTag === 'es'
          ? (languageTag as 'en' | 'es')
          : (fallback.languageTag as 'en' | 'es');
      setLanguage(lang);
      i18n.locale = lang;
      await SettingsFileImpl.writeSettings('language', lang);
      //console.log('apploading NO settings', languageTag);
    }
    if (settings.currency) {
      setCurrency(settings.currency);
    } else {
      await SettingsFileImpl.writeSettings('currency', currency);
    }
    if (settings.server) {
      setServer(settings.server);
      //console.log('settings', settings.server);
    } else {
      await SettingsFileImpl.writeSettings('server', server);
      //console.log('NO settings', settings.server);
    }
    if (settings.sendAll) {
      setSendAll(settings.sendAll);
    } else {
      await SettingsFileImpl.writeSettings('sendAll', sendAll);
    }

    // reading background task info
    const backgroundJson = await BackgroundFileImpl.readSettings();
    if (backgroundJson) {
      setBackground(backgroundJson);
    }
  }, [currency, file, i18n, sendAll, server]);

  useEffect(() => {
    (async () => {
      await setI18nConfig();
      setLoading(false);
    })();
  }, [setI18nConfig]);

  //const handleLocalizationChange = useCallback(() => {
  //  setI18nConfig();
  //  forceUpdate();
  //}, [setI18nConfig, forceUpdate]);

  //useEffect(() => {
  //  RNLocalize.addEventListener('change', handleLocalizationChange);
  //  return () => RNLocalize.removeEventListener('change', handleLocalizationChange);
  //}, [handleLocalizationChange]);

  if (loading) {
    return null;
  } else {
    return (
      <LoadingAppClass
        {...props}
        theme={theme}
        translate={translate}
        language={language}
        currency={currency}
        server={server}
        sendAll={sendAll}
        background={background}
      />
    );
  }
}

type LoadingAppClassProps = {
  navigation: StackScreenProps<any>['navigation'];
  route: StackScreenProps<any>['route'];
  translate: (key: string, config?: TranslateOptions) => string;
  theme: ThemeType;
  language: 'en' | 'es';
  currency: 'USD' | '';
  server: string;
  sendAll: boolean;
  background: backgroundType;
};

class LoadingAppClass extends Component<LoadingAppClassProps, AppStateLoading> {
  dim: EmitterSubscription;
  sta: NativeEventSubscription;

  constructor(props: LoadingAppClassProps) {
    super(props);

    const screen = Dimensions.get('screen');

    this.state = {
      ...defaultAppStateLoading,
      navigation: props.navigation,
      route: props.route,
      translate: props.translate,
      server: props.server,
      language: props.language,
      currency: props.currency,
      sendAll: props.sendAll,
      background: props.background,
      dimensions: {
        width: Number(screen.width.toFixed(0)),
        height: Number(screen.height.toFixed(0)),
        orientation: platform.isPortrait(screen) ? 'portrait' : 'landscape',
        deviceType: platform.isTablet(screen) ? 'tablet' : 'phone',
        scale: Number(screen.scale.toFixed(2)),
      },
      appState: AppState.currentState,
    };

    this.dim = {} as EmitterSubscription;
    this.sta = {} as NativeEventSubscription;
  }

  componentDidMount = async () => {
    // First, check if a wallet exists. Do it async so the basic screen has time to render
    setTimeout(async () => {
      await RPCModule.initLightClient(this.state.server);

      // reading Info
      const info = await RPC.rpc_getInfoObject();
      if (info) {
        this.setState({ info });
      }

      const exists = await RPCModule.walletExists();
      //console.log('Wallet Exists result', exists);

      if (exists && exists !== 'false') {
        this.setState({ walletExists: true });
        const error = await RPCModule.loadExistingWallet(this.state.server);
        //console.log('Load Wallet Exists result', error);
        if (!error.startsWith('Error')) {
          // Load the wallet and navigate to the transactions screen
          this.navigateToLoaded();
        } else {
          this.setState({ screen: 1 });
          Alert.alert(this.props.translate('loadingapp.readingwallet-label'), error);
        }
      } else {
        //console.log('Loading new wallet');
        this.setState({ screen: 1, walletExists: false });
      }
    });

    this.dim = Dimensions.addEventListener('change', ({ screen }) => {
      this.setDimensions(screen);
      //console.log('++++++++++++++++++++++++++++++++++ change dims', Dimensions.get('screen'));
    });

    this.sta = AppState.addEventListener('change', nextAppState => {
      if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
        console.log('App has come to the foreground!');
      }
      if (nextAppState.match(/inactive|background/) && this.state.appState === 'active') {
        console.log('App is gone to the background!');
      }
      this.setState({ appState: nextAppState });
    });
  };

  componentWillUnmount = () => {
    this.dim.remove();
    this.sta.remove();
  };

  setDimensions = (screen: ScaledSize) => {
    this.setState({
      dimensions: {
        width: Number(screen.width.toFixed(0)),
        height: Number(screen.height.toFixed(0)),
        orientation: platform.isPortrait(screen) ? 'portrait' : 'landscape',
        deviceType: platform.isTablet(screen) ? 'tablet' : 'phone',
        scale: Number(screen.scale.toFixed(2)),
      },
    });
  };

  useDefaultServer_0 = async () => {
    this.setState({ actionButtonsDisabled: true });
    await SettingsFileImpl.writeSettings('server', SERVER_DEFAULT_0);
    this.setState({ server: SERVER_DEFAULT_0, actionButtonsDisabled: false });
  };

  useDefaultServer_1 = async () => {
    this.setState({ actionButtonsDisabled: true });
    await SettingsFileImpl.writeSettings('server', SERVER_DEFAULT_1);
    this.setState({ server: SERVER_DEFAULT_1, actionButtonsDisabled: false });
  };

  navigateToLoaded = () => {
    const { navigation } = this.props;
    navigation.reset({
      index: 0,
      routes: [{ name: 'LoadedApp' }],
    });
  };

  createNewWallet = () => {
    this.setState({ actionButtonsDisabled: true });
    setTimeout(async () => {
      const seed: string = await RPCModule.createNewWallet(this.state.server);

      if (!seed.startsWith('Error')) {
        this.setState({ walletSeed: JSON.parse(seed), screen: 2, actionButtonsDisabled: false, walletExists: true });
        // default values for wallet options
        this.set_wallet_option('download_memos', 'wallet');
        //await this.set_wallet_option('transaction_filter_threshold', '500');
      } else {
        this.setState({ actionButtonsDisabled: false });
        Alert.alert(this.props.translate('loadingapp.creatingwallet-label'), seed);
      }
    });
  };

  getwalletSeedToRestore = async () => {
    this.setState({ walletSeed: {} as WalletSeedType, screen: 3, walletExists: false });
  };

  getViewingKeyToRestore = async () => {
    //this.setState({ viewingKey: '', screen: 3 });
    Toast.show(this.props.translate('workingonit'), Toast.LONG);
  };

  getSpendableKeyToRestore = async () => {
    //this.setState({ spendableKey: '', screen: 3 });
    Toast.show(this.props.translate('workingonit'), Toast.LONG);
  };

  doRestore = async (seed: string, birthday: number) => {
    const { server } = this.state;

    if (!seed) {
      Alert.alert(
        this.props.translate('loadingapp.invalidseed-label'),
        this.props.translate('loadingapp.invalidseed-error'),
      );
      return;
    }

    this.setState({ actionButtonsDisabled: true });
    setTimeout(async () => {
      let walletBirthday = birthday.toString() || '0';
      if (parseInt(walletBirthday, 10) < 0) {
        walletBirthday = '0';
      }
      if (isNaN(parseInt(walletBirthday, 10))) {
        walletBirthday = '0';
      }

      const error = await RPCModule.restoreWallet(seed.toLowerCase(), walletBirthday || '0', server);
      if (!error.startsWith('Error')) {
        this.setState({ actionButtonsDisabled: false });
        this.navigateToLoaded();
      } else {
        this.setState({ actionButtonsDisabled: false });
        Alert.alert(this.props.translate('loadingapp.readingwallet-label'), error);
      }
    });
  };

  set_wallet_option = async (name: string, value: string) => {
    await RPC.rpc_setWalletSettingOption(name, value);
  };

  render() {
    const { screen, walletSeed, actionButtonsDisabled, walletExists, server } = this.state;
    const { translate } = this.props;
    const { colors } = this.props.theme;

    return (
      <ContextLoadingProvider value={this.state}>
        <SafeAreaView
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            backgroundColor: colors.background,
          }}>
          {screen === 0 && (
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: colors.zingo, fontSize: 40, fontWeight: 'bold' }}>{translate('zingo')}</Text>
              <Text style={{ color: colors.zingo, fontSize: 15 }}>{translate('version')}</Text>
            </View>
          )}
          {screen === 1 && (
            <ScrollView
              style={{ maxHeight: '100%' }}
              contentContainerStyle={{
                flexDirection: 'column',
                alignItems: 'stretch',
                justifyContent: 'flex-start',
                padding: 20,
              }}>
              <View
                style={{
                  flex: 1,
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                <View style={{ marginBottom: 50, display: 'flex', alignItems: 'center' }}>
                  <Text style={{ color: colors.zingo, fontSize: 40, fontWeight: 'bold' }}>{translate('zingo')}</Text>
                  <Text style={{ color: colors.zingo, fontSize: 15 }}>{translate('version')}</Text>
                  <Image
                    source={require('../../assets/img/logobig-zingo.png')}
                    style={{ width: 100, height: 100, resizeMode: 'contain', marginTop: 10 }}
                  />
                </View>

                <BoldText style={{ fontSize: 15, marginBottom: 3 }}>{translate('loadingapp.actualserver')}</BoldText>
                <BoldText style={{ fontSize: 15, marginBottom: 10 }}>{server})</BoldText>

                {server === SERVER_DEFAULT_1 && (
                  <Button
                    type="Primary"
                    title={translate('loadingapp.changeserver')}
                    disabled={actionButtonsDisabled}
                    onPress={this.useDefaultServer_0}
                    style={{ marginBottom: 10 }}
                  />
                )}
                {server === SERVER_DEFAULT_0 && (
                  <Button
                    type="Primary"
                    title={translate('loadingapp.changeserver')}
                    disabled={actionButtonsDisabled}
                    onPress={this.useDefaultServer_1}
                    style={{ marginBottom: 10 }}
                  />
                )}
                {server !== SERVER_DEFAULT_0 && server !== SERVER_DEFAULT_1 && (
                  <Button
                    type="Primary"
                    title={translate('loadingapp.changeserver')}
                    disabled={actionButtonsDisabled}
                    onPress={this.useDefaultServer_0}
                    style={{ marginBottom: 10 }}
                  />
                )}

                <Button
                  type="Primary"
                  title={translate('loadingapp.createnewwallet')}
                  disabled={actionButtonsDisabled}
                  onPress={this.createNewWallet}
                  style={{ marginBottom: 10, marginTop: 10 }}
                />
                {walletExists && (
                  <Button
                    type="Primary"
                    title={translate('loadingapp.opencurrentwallet')}
                    disabled={actionButtonsDisabled}
                    onPress={this.componentDidMount}
                    style={{ marginBottom: 10 }}
                  />
                )}

                <View style={{ marginTop: 50, display: 'flex', alignItems: 'center' }}>
                  <Button
                    type="Secondary"
                    title={translate('loadingapp.restorewalletseed')}
                    disabled={actionButtonsDisabled}
                    onPress={this.getwalletSeedToRestore}
                    style={{ margin: 10 }}
                  />
                  <Button
                    type="Secondary"
                    title={translate('loadingapp.restorewalletviewing')}
                    disabled={actionButtonsDisabled}
                    onPress={this.getViewingKeyToRestore}
                    style={{ margin: 10 }}
                  />
                  <Button
                    type="Secondary"
                    title={translate('loadingapp.restorewalletspendable')}
                    disabled={actionButtonsDisabled}
                    onPress={this.getSpendableKeyToRestore}
                    style={{ margin: 10 }}
                  />
                </View>
              </View>
            </ScrollView>
          )}
          {screen === 2 && walletSeed && (
            <Modal
              animationType="slide"
              transparent={false}
              visible={screen === 2}
              onRequestClose={() => this.navigateToLoaded()}>
              <Suspense
                fallback={
                  <View>
                    <Text>{translate('loading')}</Text>
                  </View>
                }>
                <Seed
                  onClickOK={() => this.navigateToLoaded()}
                  onClickCancel={() => this.navigateToLoaded()}
                  action={'new'}
                />
              </Suspense>
            </Modal>
          )}
          {screen === 3 && (
            <Modal
              animationType="slide"
              transparent={false}
              visible={screen === 3}
              onRequestClose={() => this.setState({ screen: 1 })}>
              <Suspense
                fallback={
                  <View>
                    <Text>{translate('loading')}</Text>
                  </View>
                }>
                <Seed
                  onClickOK={(s: string, b: number) => this.doRestore(s, b)}
                  onClickCancel={() => this.setState({ screen: 1 })}
                  action={'restore'}
                />
              </Suspense>
            </Modal>
          )}
        </SafeAreaView>
      </ContextLoadingProvider>
    );
  }
}
