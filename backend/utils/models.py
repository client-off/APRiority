from pydantic import BaseModel, HttpUrl
from .blockchain.models import NftCollection
from typing import List, Dict


class PaybackPeriod(BaseModel):
    days: int
    months: int
    years: int


class APRiorityData(BaseModel):
    collection: NftCollection
    apr: float
    average_apr: float
    payback_period: PaybackPeriod
    regular_payments: bool
    unsafe: bool
    
    
class APRiorityListingData(BaseModel):
    collection: NftCollection
    apr: float
    payback_period: PaybackPeriod

class APRiorityCalculatorData(BaseModel):
    collection: NftCollection
    apr: float
    payback_period: PaybackPeriod


class ListingRequest(BaseModel):
    id: int
    user_id: int
    address: str
    income: float
    payment_interval_days: int


class CollectionResponse(BaseModel):
    address: str
    income: float
    payment_interval_days: int
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


class Payment(BaseModel):
    date: str
    amount: float

class PaymentsHistory(BaseModel):
    history: List[Payment]
