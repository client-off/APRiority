from fastapi import FastAPI, HTTPException
import uvicorn
from utils.blockchain import (
    get_nft_collection,
    check_collection_ownership,
)
from utils.blockchain.models import NftCollection
from utils.models import (
    APRiorityData,
    ListingRequest,
    CalculatorResponse,
    AddCommentResponse,
    CommentResponse,
    APRiorityCalculatorData,
    PaymentsHistory,
    APRiorityListingData
)
from utils.calculations import build_response, build_calculator_response, build_listing_response
from utils.database import (
    add_listing_request,
    get_listing_requests,
    delete_listing_request,
    add_comment,
    get_comments,
)
from utils.github import get_collections, get_collection, get_collection_payment_history
from typing import List
import config

app = FastAPI(docs_url="/api/v1/docs", title="APRiority", redoc_url=None)


@app.get(
    "/api/v1/collection/{address}",
    response_model=APRiorityData,
    description="Get NFT collection data from database",
    tags=["Collection"],
)
async def get_collection_db(address: str):
    nft_collection = await get_collection(config, address)
    if not nft_collection:
        raise HTTPException(404, f"Collection not found!")
    blockchain_nft_collection = await get_nft_collection(nft_collection.address)
    if not blockchain_nft_collection:
        raise HTTPException(404, f"Collection not found!")
    response = build_response(
        collection=blockchain_nft_collection,
        income_per_nft=nft_collection.income,
        payment_interval_days=nft_collection.payment_interval_days,
        regular_payments=nft_collection.regular_payments,
        unsafe=nft_collection.unsafe,
        payments_history=await get_collection_payment_history(
                config, nft_collection.address
            ),
    )
    return response.model_dump()


@app.get(
    "/api/v1/collections",
    response_model=List[APRiorityData],
    description="Get NFT collections list from database",
    tags=["Collection"],
)
async def get_collections_list_db():
    nft_collections = await get_collections(config)
    if not nft_collections:
        return []
    collections = []
    for nft_collection in nft_collections:
        blockchain_nft_collection = await get_nft_collection(nft_collection.address)
        if not blockchain_nft_collection:
            continue
        response = build_response(
            collection=blockchain_nft_collection,
            income_per_nft=nft_collection.income,
            payment_interval_days=nft_collection.payment_interval_days,
            regular_payments=nft_collection.regular_payments,
            unsafe=nft_collection.unsafe,
            payments_history=await get_collection_payment_history(
                config, nft_collection.address
            ),
        )
        collections.append(response.model_dump())
    if not collections:
        return []
    return collections


@app.get(
    "/api/v1/collection/{address}/payment_history",
    response_model=PaymentsHistory,
    description="Get NFT collection pay7ments history from database",
    tags=["Collection"],
)
async def get_collection_db(address: str):
    nft_collection = await get_collection(config, address)
    if not nft_collection:
        raise HTTPException(404, f"Collection not found!")
    ph = await get_collection_payment_history(config, address)
    if not ph:
        return []
    return ph.model_dump()


@app.post(
    "/api/v1/calculator",
    response_model=APRiorityCalculatorData,
    description="Calculate APR & payback period",
    tags=["Collection"],
)
async def calculator(data: CalculatorResponse):
    blockchain_nft_collection = await get_nft_collection(data.address)
    if not blockchain_nft_collection:
        raise HTTPException(404, f"Collection not found!")
    response = build_calculator_response(
        collection=blockchain_nft_collection,
        income_per_nft=data.income,
        payment_interval_days=data.payment_interval_days,
    )
    return response.model_dump()


@app.get(
    "/api/v1/blockchain/collection/{address}",
    response_model=NftCollection,
    description="Get NFT collection data from blockchain",
    tags=["Blockchain"],
)
async def get_collection_blockchain(address: str):
    nft_collection = await get_nft_collection(address)
    if not nft_collection:
        raise HTTPException(404, f"Collection {address} not found!")
    return nft_collection.model_dump()



@app.get(
    "/api/v1/listing/requests",
    response_model=List[APRiorityListingData],
    description="Get listing request list from database",
    tags=["Listing"],
)
async def get_listing_requests_list_db():
    listing_requests = await get_listing_requests()
    if not listing_requests:
        raise HTTPException(404, f"Collection not found!")
    listing_request_list = []
    for listing_request in listing_requests:
        blockchain_nft_collection = await get_nft_collection(listing_request.address)
        if not blockchain_nft_collection:
            continue
        response = build_listing_response(
            collection=blockchain_nft_collection,
            income_per_nft=listing_request.income,
            payment_interval_days=listing_request.payment_interval_days,
        )
        listing_request_list.append(response.model_dump())
    if not listing_request_list:
        raise HTTPException(404, f"Listing requests not found!")
    return listing_request_list


@app.put(
    "/api/v1/listing",
    response_model=APRiorityListingData,
    description="Add listing request data to db",
    tags=["Listing"],
)
async def add_listing_request_db(data: ListingRequest):
    await add_listing_request(
        address=data.address,
        income=data.income,
        payment_interval_days=data.payment_interval_days,
    )
    blockchain_nft_collection = await get_nft_collection(data.address)
    if not blockchain_nft_collection:
        raise HTTPException(404, f"NFT Collection not found!")
    response = build_listing_response(
        collection=blockchain_nft_collection,
        income_per_nft=data.income,
        payment_interval_days=data.payment_interval_days,
    )
    return response.model_dump()


@app.delete(
    "/api/v1/listing",
    description="Delete listing request from db",
    tags=["Listing"],
)
async def delete_listing_request_db(address: str):
    return await delete_listing_request(
        address=address,
    )


@app.get(
    "/api/v1/collection/{address}/comments",
    response_model=List[CommentResponse],
    description="Get NFT collection comments list from database",
    tags=["Comments"],
)
async def get_comments_list_db(address: str):
    nft_collection = await get_collection(config, address)
    if not nft_collection:
        raise HTTPException(404, f"Collection not found!")
    comments = await get_comments(address)
    comment_list = []
    for comment in comments:
        comment_response = CommentResponse(
            collection=comment.address,
            name=comment.name,
            text=comment.text,
            like=comment.like,
            time=comment.get_time(),
        )
        comment_list.append(comment_response.model_dump())
    return reversed(comment_list)


@app.put(
    "/api/v1/collection/{address}/comments",
    response_model=List[CommentResponse],
    description="Add comment to db",
    tags=["Comments"],
)
async def add_comment_db(address: str, data: AddCommentResponse):
    ownership = await check_collection_ownership(data.user_address, address)
    nft_collection = await get_collection(config, address)
    if not nft_collection:
        raise HTTPException(404, f"Collection not found!")
    if not ownership:
        raise HTTPException(401, "There is no NFT from this collection in your wallet")
    await add_comment(address=address, name=data.name, text=data.text, ltke=data.like)
    return 200


@app.get(
    "/api/v1/collection/{address}/ownership/{wallet}",
    response_model=bool,
    description="Check nft collection ownership",
    tags=["Blockchain"],
)
async def check_nft_ownership(address: str, wallet: str):
    ownership = await check_collection_ownership(wallet, address)
    return ownership


async def run_api():
    config = uvicorn.Config(app, port=5000, reload=True)
    server = uvicorn.Server(config)
    await server.serve()
