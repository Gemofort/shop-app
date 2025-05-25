import { Config } from './config.interface';

export const environment: Config = {
  production: true,
  apiEndpoints: {
    product: 'https://7zs4qhrg6g.execute-api.eu-west-1.amazonaws.com/prod/',
    order: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
    import: 'https://abub9llisb.execute-api.eu-west-1.amazonaws.com/prod/',
    bff: 'https://7zs4qhrg6g.execute-api.eu-west-1.amazonaws.com/prod/',
    cart: 'https://.execute-api.eu-west-1.amazonaws.com/dev',
  },
  apiEndpointsEnabled: {
    product: true,
    order: false,
    import: true,
    bff: true,
    cart: false,
  },
};
