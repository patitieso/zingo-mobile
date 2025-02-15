import Url from 'url-parse';
import RPCModule from '../RPCModule';

type checkServerURIReturn = {
  result: boolean;
  timeout: boolean;
};

const checkServerURI = async (uri: string, oldUri: string): Promise<checkServerURIReturn> => {
  const parsedUri = new Url(uri, true);

  let port = parsedUri.port;

  if (!port) {
    // by default -> 9067
    // for `zecwallet` -> 443
    port = uri.includes('lwdv3.zecwallet') ? '443' : '9067';
  }

  try {
    const resultStrServerPromise = RPCModule.execute(
      'changeserver',
      `${parsedUri.protocol}//${parsedUri.hostname}:${port}`,
    );
    const timeoutServerPromise = new Promise((resolve, reject) => {
      setTimeout(() => {
        reject(new Error('Timeout'));
      }, 30000);
    });

    const resultStrServer: string = await Promise.race([resultStrServerPromise, timeoutServerPromise]);

    if (resultStrServer.toLowerCase().startsWith('error')) {
      // I have to restore the old server again. Just in case.
      await RPCModule.execute('changeserver', oldUri);
      // error, no timeout
      return { result: false, timeout: false };
    } else {
      // the server is changed
      const infoStrPromise = RPCModule.execute('info', '');
      const timeoutInfoPromise = new Promise((resolve, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout'));
        }, 30000);
      });

      const infoStr: string = await Promise.race([infoStrPromise, timeoutInfoPromise]);

      if (!infoStr || infoStr.toLowerCase().startsWith('error')) {
        // I have to restore the old server again.
        await RPCModule.execute('changeserver', oldUri);
        // error, no timeout
        return { result: false, timeout: false };
      }
    }
  } catch (error: any) {
    // I have to restore the old server again. Just in case.
    await RPCModule.execute('changeserver', oldUri);
    // error, YES timeout
    return { result: false, timeout: true };
  }

  // NO error, no timeout
  return { result: true, timeout: false };
};

export default checkServerURI;
