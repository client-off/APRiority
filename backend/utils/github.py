import aiohttp
import base64
import json
from .models import Collection, PaymentsHistory
from typing import List


async def get_files_from_github_repo(owner, repo, path, token=None):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"
    async with aiohttp.ClientSession() as session:
        async with session.get(url=url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                return data
            else:
                return None


async def get_file_content(owner, repo, path, token=None):
    url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}"
    headers = {}
    if token:
        headers["Authorization"] = f"token {token}"

    async with aiohttp.ClientSession() as session:
        async with session.get(url=url, headers=headers) as response:
            if response.status == 200:
                data = await response.json()
                if data["type"] == "file":
                    content_base64 = data["content"]
                    content = base64.b64decode(content_base64).decode("utf-8")
                    print(json.loads(content))
                    return json.loads(content)
                else:
                    return None
            else:
                return None


async def get_collections(config) -> List[Collection]:
    files = await get_files_from_github_repo(
        config.owner, config.repo, "collections", config.token
    )

    collections = []

    if files:
        for file in files:
            if file["type"] == "file":
                file_content = await get_file_content(
                    config.owner, config.repo, file["path"], config.token
                )
                if file_content:
                    collections.append(Collection(**file_content))
    return collections


async def get_collection(config, address: str) -> Collection:
    file_content = await get_file_content(
        config.owner,
        config.repo,
        f"collections/{address}.json",
        config.token,
    )
    return Collection(**file_content)

async def get_collection_payment_history(config, address: str) -> Collection:
    file_content = await get_file_content(
        config.owner,
        config.repo,
        f"collections/payments/{address}.json",
        config.token,
    )
    return PaymentsHistory(**file_content)
