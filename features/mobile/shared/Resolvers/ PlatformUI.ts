// features/mobile/shared/Resolvers/PlatformUI.ts
import { AndroidLoginUI } from '../../android/UI/LoginUI.android';
import { IOSLoginUI } from '../../ios/UI/LoginUI.ios';
import { LoginSelectors } from '../UI/LoginSelectors';

export class PlatformUI {
  static login(): LoginSelectors {
    return (process.env.MOBILE_PLATFORM || '').toLowerCase() === 'ios'
      ? IOSLoginUI
      : AndroidLoginUI;
  }
}