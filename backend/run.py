if __name__ == "__main__":
    import asyncio
    from api import run_api

    async def main():
        await asyncio.gather(run_api())

    asyncio.run(main())
