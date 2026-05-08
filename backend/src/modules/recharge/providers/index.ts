import { KwikApiProvider } from './kwikapi.provider';
import type { RechargeProvider } from './recharge-provider.interface';

const providers: Record<string, RechargeProvider> = {
  kwikapi: new KwikApiProvider(),
};

export function getRechargeProvider(name = 'kwikapi'): RechargeProvider {
  const provider = providers[name];
  if (!provider) throw new Error(`Unknown recharge provider: ${name}`);
  return provider;
}
