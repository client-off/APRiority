from pydantic import BaseModel, HttpUrl
from typing import List, Optional


class Image(BaseModel):
    baseUrl: HttpUrl


class NftImage(BaseModel):
    image: Image


class NftCollection(BaseModel):
    address: str
    name: str
    description: str
    image: NftImage
    coverImage: NftImage
    socialLinks: List[HttpUrl]
    isVerified: bool
    approximateItemsCount: int
    approximateHoldersCount: int
    floor: Optional[float] = 0


class ResponseModel(BaseModel):
    nftCollectionByAddress: NftCollection

class Jetton(BaseModel):
    address: str
    symbol: str
    image: Optional[HttpUrl]