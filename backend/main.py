from __future__ import annotations

from datetime import datetime, timezone
from typing import Literal
from uuid import uuid4

from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel, Field

app = FastAPI(
    title="Aawz API",
    version="0.1.0",
    description="نسخة تجريبية لمحرك بحث وطلبات عاوز.",
)


class Product(BaseModel):
    id: str
    name: str
    price_egp: float = Field(ge=0)
    available: bool = True


class Business(BaseModel):
    id: str
    name: str
    category: str
    city: str = "بنها"
    address: str
    distance_km: float = Field(ge=0)
    rating: float = Field(ge=0, le=5)
    supports_cart: bool
    supports_360: bool
    products: list[Product] = Field(default_factory=list)


class OrderItem(BaseModel):
    product_id: str
    quantity: int = Field(gt=0, le=99)


class CreateOrderRequest(BaseModel):
    business_id: str
    customer_name: str
    customer_phone: str
    delivery_address: str
    payment_method: Literal["cash", "card", "wallet"] = "cash"
    items: list[OrderItem]


class OrderResponse(BaseModel):
    order_id: str
    status: Literal["pending", "accepted", "preparing", "out_for_delivery", "delivered"]
    subtotal_egp: float
    delivery_fee_egp: float
    total_egp: float
    created_at: datetime


class InterpretRequest(BaseModel):
    text: str = Field(min_length=1, max_length=500)


class InterpretResponse(BaseModel):
    normalized_query: str
    intent: str
    category: str | None = None
    requested_products: list[str] = Field(default_factory=list)


BUSINESSES = [
    Business(
        id="khair-zaman",
        name="خير زمان — بنها",
        category="سوبر ماركت",
        address="وسط بنها، القليوبية",
        distance_km=1.2,
        rating=4.5,
        supports_cart=True,
        supports_360=True,
        products=[
            Product(id="oil", name="زيت خليط 1 لتر", price_egp=78),
            Product(id="rice", name="أرز مصري 1 كجم", price_egp=42),
            Product(id="chips", name="شيبسي كبير", price_egp=18),
            Product(id="detergent", name="مسحوق غسيل 2.5 كجم", price_egp=165),
        ],
    ),
    Business(
        id="ahmed-falafel",
        name="مطعم أحمد للفول والفلافل",
        category="مطعم",
        address="شارع فريد ندا، بنها",
        distance_km=0.8,
        rating=4.3,
        supports_cart=True,
        supports_360=False,
        products=[
            Product(id="falafel", name="ساندوتش فلافل", price_egp=12),
            Product(id="beans", name="طبق فول", price_egp=25),
        ],
    ),
]

ORDERS: dict[str, OrderResponse] = {}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "aawz-api"}


@app.get("/businesses", response_model=list[Business])
def search_businesses(
    query: str = Query(default="", max_length=200),
    city: str = Query(default="بنها", max_length=100),
) -> list[Business]:
    normalized = query.strip().lower()
    available = [business for business in BUSINESSES if business.city == city]

    if not normalized:
        return sorted(available, key=lambda business: business.distance_km)

    def matches(business: Business) -> bool:
        searchable = " ".join(
            [business.name, business.category, *[product.name for product in business.products]]
        ).lower()
        return normalized in searchable or any(
            token in searchable for token in normalized.split() if token
        )

    return sorted(
        [business for business in available if matches(business)],
        key=lambda business: business.distance_km,
    )


@app.get("/businesses/{business_id}", response_model=Business)
def get_business(business_id: str) -> Business:
    business = next((item for item in BUSINESSES if item.id == business_id), None)
    if business is None:
        raise HTTPException(status_code=404, detail="النشاط غير موجود")
    return business


@app.post("/interpret", response_model=InterpretResponse)
def interpret(request: InterpretRequest) -> InterpretResponse:
    text = request.text.strip()
    lowered = text.lower()

    category = None
    if any(word in lowered for word in ["سوبر", "بقالة", "زيت", "رز", "شيبسي"]):
        category = "سوبر ماركت"
    elif any(word in lowered for word in ["مطعم", "فول", "فلافل", "طعمية", "أكل"]):
        category = "مطعم"
    elif any(word in lowered for word in ["عربية", "سيارة", "عربيات"]):
        category = "سيارات"

    known_products = ["زيت", "رز", "شيبسي", "مسحوق", "فول", "فلافل"]
    requested_products = [product for product in known_products if product in lowered]

    intent = "product_search" if requested_products else "search"
    if any(word in lowered for word in ["اطلب", "هات", "اشتري"]):
        intent = "create_order"

    return InterpretResponse(
        normalized_query=text,
        intent=intent,
        category=category,
        requested_products=requested_products,
    )


@app.post("/orders", response_model=OrderResponse, status_code=201)
def create_order(request: CreateOrderRequest) -> OrderResponse:
    business = next((item for item in BUSINESSES if item.id == request.business_id), None)
    if business is None:
        raise HTTPException(status_code=404, detail="النشاط غير موجود")
    if not business.supports_cart:
        raise HTTPException(status_code=400, detail="هذا النشاط لا يدعم سلة الشراء")

    product_map = {product.id: product for product in business.products}
    subtotal = 0.0

    for item in request.items:
        product = product_map.get(item.product_id)
        if product is None:
            raise HTTPException(
                status_code=400,
                detail=f"المنتج {item.product_id} غير موجود في هذا النشاط",
            )
        if not product.available:
            raise HTTPException(status_code=409, detail=f"{product.name} غير متاح")
        subtotal += product.price_egp * item.quantity

    delivery_fee = 25.0
    order = OrderResponse(
        order_id=str(uuid4()),
        status="pending",
        subtotal_egp=round(subtotal, 2),
        delivery_fee_egp=delivery_fee,
        total_egp=round(subtotal + delivery_fee, 2),
        created_at=datetime.now(timezone.utc),
    )
    ORDERS[order.order_id] = order
    return order


@app.get("/orders/{order_id}", response_model=OrderResponse)
def get_order(order_id: str) -> OrderResponse:
    order = ORDERS.get(order_id)
    if order is None:
        raise HTTPException(status_code=404, detail="الطلب غير موجود")
    return order
