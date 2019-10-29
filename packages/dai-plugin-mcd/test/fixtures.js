import { MDAI } from '../src';

export function dummyEventData(ilkIdentifier) {
  return [
    {
      eventType: 'frob',
      dart: '-6000000000000000000',
      dink: '0',
      ilkRate: '2000000000000000000000000000',
      tx: {
        transactionHash:
          '0x37d1c253f79784313045d3922928f646020d545f17fc3d74a0d68e665db0b394',
        txFrom: '0x1ad35418e7b7c5746ea42295a1100480a810256a',
        era: { iso: '1970-01-01T00:01:20' }
      },
      ilkIdentifier
    },
    {
      eventType: 'bite',
      tx: {
        transactionHash:
          '0xbe023a205453b833e65bf29063de8b8b3bd44d2e68c9c079f681ec46a765a63f',
        txFrom: '0x1ad35418e7b7c5746ea42295a1100480a810256a',
        era: { iso: '2019-01-01T00:01:20' }
      },
      ilkIdentifier
    },
    {
      eventType: 'bid',
      act: 'KICK',
    },
    {
      eventType: 'bid',
      act: 'DENT',
      tx: {
        transactionHash:
          '0xbe023a205453b833e65bf29063de8b8b3bd44d2e68c9c079f681ec46a765a63f',
        txFrom: '0x1ad35418e7b7c5746ea42295a1100480a810256a',
        era: { iso: '2021-01-01T00:01:20' }
      },
      ilkIdentifier
    },
    {
      eventType: 'bid',
      act: 'DEAL',
      tx: {
        transactionHash:
          '0xbe023a205453b833e65bf29063de8b8b3bd44d2e68c9c079f681ec46a765a63f',
        txFrom: '0x1ad35418e7b7c5746ea42295a1100480a810256a',
        era: { iso: '2022-01-01T00:01:20' }
      },
      ilkIdentifier
    },
  ];
}

export function formattedDummyEventData(GEM, ilk) {
  return [
    {
      transactionHash:
        '0x37d1c253f79784313045d3922928f646020d545f17fc3d74a0d68e665db0b394',
      changeInCollateral: GEM(0),
      changeInDai: MDAI(12),
      daiAction: 'wipe',
      time: new Date('1970-01-01T00:01:20'),
      senderAddress: '0x1ad35418e7b7c5746ea42295a1100480a810256a',
      ilk
    },
    {
      transactionHash:
        '0xbe023a205453b833e65bf29063de8b8b3bd44d2e68c9c079f681ec46a765a63f',
      changeInCollateral: GEM(0),
      liquidated: true,
      time: new Date('2019-01-01T00:01:20'),
      senderAddress: '0x1ad35418e7b7c5746ea42295a1100480a810256a',
      ilk
    },
    {
      transactionHash:
        '0xd7304f96f375c3c05a10f34a7555cbae14eea346d1f993e0e7dc8a5f9cbd91a7',
      changeInCollateral: GEM(15),
      auctionProceeds: true,
      time: new Date('2021-01-01T00:01:20'),
      senderAddress: '0x1ad35418e7b7c5746ea42295a1100480a810256a'
    }
  ];
}
