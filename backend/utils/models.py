from pydantic import BaseModel, HttpUrl
from .blockchain.models import NftCollection
from typing import List, Dict


class PaybackPeriod(BaseModel):
    days: int
    months: int
    years: int
    

class Payment(BaseModel):
    date: str
    amount: int | float

class APRiorityData(BaseModel):
    collection: NftCollection
    apr: float
    payback_period: PaybackPeriod
    regular_payments: bool
    unsafe: bool
    payments_history: List[Payment]

class APRiorityCalculatorData(BaseModel):
    collection: NftCollection
    apr: float
    payback_period: PaybackPeriod
    

class Jetton(BaseModel):
    address: str
    symbol: str
    image: HttpUrl


class ListingRequest(BaseModel):
    id: int
    user_id: int
    address: str
    income: float
    payment_interval_days: int
    jettons: List[Jetton]
    payments_history: List[Dict[str, float]]


class CollectionResponse(BaseModel):
    address: str
    income: float
    payment_interval_days: int
    jettons: List[Jetton]
    payments_history: List[Payment]
    regular_payments: bool
    unsafe: bool


class CalculatorResponse(BaseModel):
    address: str
    income: float
    payment_interval_days: int


class AddCommentResponse(BaseModel):
    collection: str
    name: str
    user_address: str
    like: bool
    text: str


class CommentResponse(BaseModel):
    collection: str
    name: str
    time: str
    like: bool
    text: str
    

class Collection(BaseModel):
    address: str
    income: float
    payment_interval_days: int
    regular_payments: bool
    unsafe: bool