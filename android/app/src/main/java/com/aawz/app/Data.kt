package com.aawz.app

data class Product(
    val id: String,
    val name: String,
    val unit: String,
    val price: Double,
    val available: Boolean = true
)

data class Business(
    val id: String,
    val name: String,
    val category: String,
    val address: String,
    val distanceKm: Double,
    val rating: Double,
    val hasCart: Boolean,
    val hasTour360: Boolean,
    val products: List<Product>
)

data class CartLine(
    val product: Product,
    val quantity: Int
) {
    val subtotal: Double get() = product.price * quantity
}

object DemoRepository {
    val businesses = listOf(
        Business(
            id = "khair-zaman",
            name = "خير زمان — بنها",
            category = "سوبر ماركت",
            address = "وسط بنها، القليوبية",
            distanceKm = 1.2,
            rating = 4.5,
            hasCart = true,
            hasTour360 = true,
            products = listOf(
                Product("oil", "زيت خليط 1 لتر", "زجاجة", 78.0),
                Product("rice", "أرز مصري 1 كجم", "كيس", 42.0),
                Product("chips", "شيبسي كبير", "كيس", 18.0),
                Product("detergent", "مسحوق غسيل 2.5 كجم", "عبوة", 165.0),
                Product("milk", "لبن كامل الدسم 1 لتر", "عبوة", 39.0)
            )
        ),
        Business(
            id = "ahmed-falafel",
            name = "مطعم أحمد للفول والفلافل",
            category = "مطعم",
            address = "شارع فريد ندا، بنها",
            distanceKm = 0.8,
            rating = 4.3,
            hasCart = true,
            hasTour360 = false,
            products = listOf(
                Product("falafel", "ساندوتش فلافل", "قطعة", 12.0),
                Product("beans", "طبق فول", "طبق", 25.0),
                Product("breakfast", "وجبة إفطار عائلية", "وجبة", 145.0)
            )
        ),
        Business(
            id = "style-store",
            name = "ستايل بنها للملابس",
            category = "ملابس",
            address = "منطقة الأهرام، بنها",
            distanceKm = 2.1,
            rating = 4.6,
            hasCart = true,
            hasTour360 = true,
            products = listOf(
                Product("shirt", "قميص رجالي", "قطعة", 650.0),
                Product("jeans", "بنطلون جينز", "قطعة", 890.0),
                Product("hoodie", "هودي شتوي", "قطعة", 720.0)
            )
        ),
        Business(
            id = "car-market",
            name = "معرض بنها للسيارات",
            category = "سيارات",
            address = "طريق بنها–القاهرة",
            distanceKm = 4.7,
            rating = 4.2,
            hasCart = false,
            hasTour360 = true,
            products = emptyList()
        )
    )
}
