import { buildTestNonceService } from '../helpers/serviceBuilders';

let nonceService;

beforeEach(async () => {
  nonceService = buildTestNonceService();
  await nonceService.manager().authenticate();
  nonceService.setNextNonce();
});

test('should increment transaction count to generate new nonce', async () => {
  console.log(nonceService._nextNonce);
  console.log(await nonceService.getNonce());
  console.log(await nonceService.inject(['a', 2, { gasLimit: 400000 }]));
});
