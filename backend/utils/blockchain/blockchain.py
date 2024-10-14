from pytonapi import AsyncTonapi
from config import TON_API_KEY
from gql import gql, Client
from gql.transport.aiohttp import AIOHTTPTransport
from .models import ResponseModel, NftCollection, Jetton
import aiohttp

tonapi = AsyncTonapi(api_key=TON_API_KEY, is_testnet=False)


async def get_jetton_data(address: str) -> Jetton | None:
    try:
        jetton = await tonapi.jettons.get_info(address)
        return Jetton(
            address=jetton.metadata.address.to_userfriendly(),
            symbol=jetton.metadata.symbol,
            image=jetton.metadata.image,
        )
    except:
        return


async def get_nft_collection(address: str) -> NftCollection | None:
    API_PATH = "https://api.getgems.io/graphql"

    QUERY1 = gql(
        """query NftCollectionByAddress(
  $address: String!
) {
  nftCollectionByAddress(address: $address) {
    address
    name
    description
    image {
      image {
        baseUrl
      }
    }
    coverImage {
      image {
        baseUrl
      }
    }
    socialLinks
    isVerified
    approximateItemsCount
    approximateHoldersCount
  }
}"""
    )

    QUERY2 = gql(
        """query AlphaNftCollectionStats($address: String!) {
  alphaNftCollectionStats(address: $address) {
    floorPrice
  }
}"""
    )

    try:
        transport = AIOHTTPTransport(url=API_PATH)
        async with Client(
            transport=transport, fetch_schema_from_transport=True
        ) as session:
            result = await session.execute(
                QUERY1,
                variable_values={"address": address},
            )
            result2 = await session.execute(
                QUERY2,
                variable_values={"address": address},
            )
            nft_collection = ResponseModel(**result).nftCollectionByAddress
            nft_collection.floor = result2["alphaNftCollectionStats"]["floorPrice"]
            return nft_collection
    except:
        return


async def check_collection_ownership(address, collection):
    url = f"https://tonapi.io/v2/accounts/{address}/nfts?collection={collection}&limit=1000&offset=0&indirect_ownership=false"

    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(url) as response:
                if response.status != 200:
                    return False
                data = await response.json()
                nft_items = data.get("nft_items", [])
    except aiohttp.ClientError as e:
        return False
    except Exception as e:
        return False

    return bool(nft_items)