from tortoise import Tortoise, fields, exceptions
from tortoise.models import Model
from .models import Jetton
from typing import List


class Collection(Model):
    id = fields.IntField(pk=True)
    address = fields.CharField(max_length=49)
    income = fields.FloatField()
    payment_interval_days = fields.IntField()
    jettons = fields.JSONField()
    payments_history = fields.JSONField()
    regular_payments = fields.BooleanField()
    unsafe = fields.BooleanField()

    @classmethod
    async def get_collection(cls, address: str):
        return await cls.get(address=address)


class ListingRequest(Model):
    id = fields.IntField(pk=True)
    user_id = fields.BigIntField()
    address = fields.CharField(max_length=49)
    income = fields.FloatField()
    payment_interval_days = fields.IntField()
    jettons = fields.JSONField()
    payments_history = fields.JSONField()

    @classmethod
    async def get_request(cls, address: str):
        return await cls.get(address=address)


class Comment(Model):
    id = fields.IntField(pk=True)
    address = fields.CharField(max_length=49)
    name = fields.TextField()
    text = fields.TextField()
    like = fields.BooleanField()
    time = fields.DatetimeField(auto_now_add=True)

    def get_time(self) -> str:
        return self.time.strftime("%d.%m.%Y %H%M%S")


async def init_db():
    await Tortoise.init(
        db_url="sqlite://database.db", modules={"models": ["utils.database"]}
    )
    await Tortoise.generate_schemas()


async def add_collection(
    address: str,
    income: float,
    payment_interval_days: int,
    jettons: List[Jetton] = [],
    payments_history: List[dict[str, any]] = [],
    regular_payments: bool = False,
    unsafe: bool = False
):
    await init_db()

    new_collection = await Collection.create(
        address=address,
        income=income,
        payment_interval_days=payment_interval_days,
        jettons=jettons,
        payments_history=payments_history,
        regular_payments=regular_payments,
        unsafe=unsafe
    )

    collection_id = new_collection.id

    return collection_id


async def delete_collection(address: str):
    await init_db()
    try:
        collection = await Collection.get_collection(address=address)
        await collection.delete()
        return True
    except exceptions.DoesNotExist:
        return False


async def get_collection(address: str):
    await init_db()
    try:
        collection = await Collection.get_collection(address=address)
        return collection
    except exceptions.DoesNotExist:
        return


async def get_collections():
    await init_db()
    try:
        collection = await Collection.all()
        return collection
    except exceptions.DoesNotExist:
        return


async def add_listing_request(
    user_id: int,
    address: str,
    income: float,
    payment_interval_days: int,
    jettons: List[Jetton] = [],
    payments_history: List[dict[str, any]] = [],
):
    await init_db()

    new_collection = await ListingRequest.create(
        user_id=user_id,
        address=address,
        income=income,
        payment_interval_days=payment_interval_days,
        jettons=jettons,
        payments_history=payments_history,
    )

    collection_id = new_collection.id

    return collection_id


async def delete_listing_request(address: str):
    await init_db()
    try:
        request = await ListingRequest.get_request(address=address)
        await request.delete()
        return True
    except exceptions.DoesNotExist:
        return False


async def get_listing_request(address: str):
    await init_db()
    try:
        collection = await ListingRequest.get_request(address=address)
        return collection
    except exceptions.DoesNotExist:
        return


async def get_listing_requests_by_user(user_id: int):
    await init_db()
    try:
        collection = await ListingRequest.all().filter(user_id=user_id)
        return collection
    except exceptions.DoesNotExist:
        return


async def get_listing_requests():
    await init_db()
    try:
        listing_request = await ListingRequest.all()
        return listing_request
    except exceptions.DoesNotExist:
        return


async def add_comment(address: str, name: str, text: str, like: bool):
    await init_db()

    new_collection = await Comment.create(
        address=address, name=name, text=text, like=like
    )

    collection_id = new_collection.id

    return collection_id


async def get_comments(address: str):
    await init_db()
    try:
        collection = await Comment.all().filter(address=address)
        return collection
    except exceptions.DoesNotExist:
        return
