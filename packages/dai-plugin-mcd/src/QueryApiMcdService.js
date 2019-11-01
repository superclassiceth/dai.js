import { PublicService } from '@makerdao/services-core';
import { ServiceRoles } from './constants';
import { TESTNET_ID } from '@makerdao/dai/dist/contracts/networks';
import { getQueryResponse } from '@makerdao/dai/dist/src/QueryApi';

const LOCAL_URL = 'http://localhost:5000/graphql';
const KOVAN_SERVER_URL = 'https://vdb0k-staging.vulcanize.io/graphql';

export default class QueryApi extends PublicService {
  constructor(name = ServiceRoles.QUERY_API) {
    super(name, ['web3']);
  }

  connect() {
    const network = this.get('web3').network;
    switch (network) {
      case TESTNET_ID:
        this.serverUrl = LOCAL_URL;
        break;
      case 'kovan':
      case 42:
      default:
        this.serverUrl = KOVAN_SERVER_URL;
        break;
    }
  }

  _buildCdpEventsQuery(ilk, urn) {
    return `
      frobAndBite: getUrn(ilkIdentifier: "${ilk}", urnIdentifier: "${urn}") {
        frobs {
          nodes {
            dart
            dink
            ilkRate
            tx {
              transactionHash
              txFrom
              era {
                iso
              }
            }
          }
        }
        bites {
          nodes {
            tx {
              transactionHash
              era {
                iso
              }
              txFrom
            }
          }
        }
      }
      bid: allFlipBidEvents {
        nodes {
          tx {
            nodes {
              transactionHash
              era {
                iso
              }
              txFrom
            }
          }
          bid {
            lot
            tab
            urn {
              nodes {
                urnIdentifier
              }
            }
          }
          act
          bidAmount
          lot
        }
      }`;
  }

  _buildFrobsQuery(ilk, urn) {
    return `
      urnFrobs(ilkIdentifier: "${ilk}", urnIdentifier: "${urn}") {
        nodes {
          dart
          dink
          ilkRate
          tx {
            transactionHash
            txFrom
            era {
              iso
            }
          }
          ilkIdentifier
        }
      }`;
  }

  async getCdpEventsForIlkAndUrn(ilkName, urn) {
    const query = '{' + this._buildCdpEventsQuery(ilkName, urn) + '}';
    const response = await getQueryResponse(this.serverUrl, query);
    const frobEvents = response['frobAndBite']['frobs'].nodes.map(e => {
      return {
        ...e,
        eventType: 'frob'
      };
    });
    const biteEvents = response['frobAndBite']['bites'].nodes.map(e => {
      return {
        ...e,
        eventType: 'bite'
      };
    });
    const bidEvents = response['bid'].nodes
      .filter(
        b =>
          b.bid.urn.nodes.urnIdentifier === urn &&
          (b.act === 'KICK' || b.act === 'DENT' || b.act === 'DEAL')
      )
      .map(e => {
        return {
          ...e,
          eventType: 'bid'
        };
      });
    const events = [...frobEvents, ...biteEvents, ...bidEvents];
    const eventsSorted = events.sort((a, b) => {
      //sort by date descending
      return new Date(b.tx.era.iso) - new Date(a.tx.era.iso);
    });
    return eventsSorted;
  }

  //takes in an array of objects with ilk and urn properties
  //TODO: currently only returns frob events, update to include bite and auction events
  async getCdpEventsForArrayOfIlksAndUrns(cdps) {
    let query = '{';
    cdps.forEach((cdp, index) => {
      query += `frobs${index}: ` + this._buildFrobsQuery(cdp.ilk, cdp.urn);
    });
    query += '}';
    const response = await getQueryResponse(this.serverUrl, query);
    let events = [];
    cdps.forEach((_, index) => {
      events.push(response[`frobs${index}`].nodes);
    });
    const arr = [].concat.apply([], events); //flatten array
    const arrSort = arr.sort((a, b) => {
      //sort by date descending
      return new Date(b.tx.era.iso) - new Date(a.tx.era.iso);
    });
    return arrSort;
  }

  async getPriceHistoryForPip(pipAddress, num = 100) {
    const query = `query ($pipAddress: String, $num: Int){
      allPipLogValues(last: $num, condition: { contractAddress: $pipAddress }){
        nodes{
          val,
          blockNumber
        }
      }
    }`;

    const response = await getQueryResponse(this.serverUrl, query, {
      pipAddress,
      num
    });
    return response.allPipLogValues.nodes;
  }
}
