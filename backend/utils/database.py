from tortoise import Tortoise, fields, exceptions
from tortoise.models import Model
from .models import Jetton
from typing import List


class ListingRequest(Model):
    id = fields.IntField(pk=True)
    user_id = fields.BigIntField()
    address = fields.CharField(max_length=49)
    income = fields.FloatField()
    payment_interval_days = fields.IntField()
    jettons = fields.JSONField()

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


async def add_listing_request(
    user_id: int,
    address: str,
    income: float,
    payment_interval_days: int,
    jettons: List[Jetton] = [],
):
    await init_db()

    new_collection = await ListingRequest.create(
        user_id=user_id,
        address=address,
        income=income,
        payment_interval_days=payment_interval_days,
        jettons=jettons,
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
