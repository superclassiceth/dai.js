import { mcdMaker } from '../helpers';
import { ServiceRoles } from '../../src/constants';
import { infuraProjectId } from './index';

let service;

beforeAll(async () => {
  const settings = {
    web3: {
      provider: {
        infuraProjectId
      }
    }
  };
  const network =
    process.env.NETWORK === 'test' ? 'testnet' : process.env.NETWORK;
  const maker = await mcdMaker({
    preset: process.env.NETWORK,
    network: network,
    ...settings
  });
  service = maker.service(ServiceRoles.QUERY_API);
});

//vdb doesn't support pip events anymore, need to update to use the spot
// test('getPriceHistoryForPip for ETH', async () => {
//   const prices = await service.getPriceHistoryForPip(
//     '0x75dd74e8afe8110c8320ed397cccff3b8134d981'
//   );
//   expect(!!prices[0].val && !!prices[0].blockNumber).toBe(true);
// });

function expectFrobEvent(event) {
  expect(
    !!event.dart &&
      !!event.dink &&
      !!event.ilkRate &&
      !!event.tx.transactionHash &&
      !!event.tx.txFrom &&
      !!event.tx.era.iso
  ).toBe(true);
}

function expectBiteEvent(event) {
  expect(
    !!event.urnIdentifier &&
      !!event.tx.transactionHash &&
      !!event.tx.txFrom &&
      !!event.tx.era.iso
  ).toBe(true);
}

//these are ilks  and urns that correspond to frobEvets in the current vdb data generator and remote kovan vdb instance
const frobParams = {
  test: [
    {
      urn: '0xd6a62aadf5a1593078b55a30c1067ff0e4d24369',
      ilk: 'BEF5872'
    },
    {
      urn: '0xbe72af4323df8b82949d45857ea7c5d7f0cc9246',
      ilk: 'D06C8A8'
    }
  ],
  kovan: [
    {
      urn: '0x361AF3DaB770855d6cB4FAB77bfB296f5ec9d035',
      ilk: 'ETH-A'
    },
    {
      urn: '0xeCDb1a35be176C91EbD0FA7E1201F18e8A3A4B9E',
      ilk: 'ETH-A'
    }
  ]
};

test('getCdpEventsForIlkAndUrn', async () => {
  const events = await service.getCdpEventsForIlkAndUrn(
    frobParams[process.env.NETWORK][0].ilk,
    frobParams[process.env.NETWORK][0].urn
  );
  let frob, bite = false;
  events.forEach(e => {
    if (e.eventType === 'frob') {
      frob = true;
      expectFrobEvent(e);
    }
    if (e.eventType === 'bite') {
      bite = true;
      expectBiteEvent(e);
    }
  });
  expect(frob && bite).toBe(true);
},12000);

// test('getCdpEventsForArrayOfIlksAndUrns', async () => {
//   const events = await service.getCdpEventsForArrayOfIlksAndUrns(
//     frobParams[process.env.NETWORK]
//   );
//   expectFrobEvent(events[0]);
// });
