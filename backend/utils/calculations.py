from .models import APRiorityData, PaybackPeriod, APRiorityCalculatorData
from .blockchain.models import NftCollection


def calculate_apr(
    income_per_nft: float, payment_interval_days: int, floor_price: float
):
    annual_income = (income_per_nft / payment_interval_days) * 365
    apr = (annual_income / floor_price) * 100
    return round(apr, 2)


def calculate_payback_period(
    income_per_nft: float, payment_interval_days: int, floor_price: float
):
    daily_income = income_per_nft / payment_interval_days
    payback_period_days = floor_price / daily_income
    return payback_period_days


def convert_days(days):
    days = int(days)
    years = days // 365
    remaining_days = days % 365

    months = remaining_days // 30
    remaining_days = remaining_days % 30

    return PaybackPeriod(days=remaining_days, months=months, years=years)


def build_response(
    collection: NftCollection,
    income_per_nft: float,
    payment_interval_days: int,
    regular_payments: bool,
    unsafe: bool,
):
    apr = calculate_apr(
        income_per_nft=income_per_nft,
        payment_interval_days=payment_interval_days,
        floor_price=collection.floor,
    )
    payback_period = convert_days(
        calculate_payback_period(
            income_per_nft=income_per_nft,
            payment_interval_days=payment_interval_days,
            floor_price=collection.floor,
        )
    )

    return APRiorityData(
        collection=collection,
        apr=apr,
        payback_period=payback_period,
        regular_payments=regular_payments,
        unsafe=unsafe,
    )


def build_calculator_response(
    collection: NftCollection,
    income_per_nft: float,
    payment_interval_days: int,
):
    apr = calculate_apr(
        income_per_nft=income_per_nft,
        payment_interval_days=payment_interval_days,
        floor_price=collection.floor,
    )
    payback_period = convert_days(
        calculate_payback_period(
            income_per_nft=income_per_nft,
            payment_interval_days=payment_interval_days,
            floor_price=collection.floor,
        )
    )

    return APRiorityCalculatorData(
        collection=collection,
        apr=apr,
        payback_period=payback_period,
    )
