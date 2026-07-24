package com.aawz.app

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateMapOf
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel

class AawzViewModel : ViewModel() {
    var query by mutableStateOf("")
    var selectedBusiness by mutableStateOf<Business?>(null)

    private val quantities = mutableStateMapOf<String, Int>()

    fun results(): List<Business> {
        val normalized = query.trim().lowercase()
        if (normalized.isBlank()) return DemoRepository.businesses.sortedBy { it.distanceKm }

        return DemoRepository.businesses.filter { business ->
            val searchable = buildList {
                add(business.name)
                add(business.category)
                addAll(business.products.map { it.name })
            }.joinToString(" ").lowercase()

            normalized.split(" ").any { token ->
                token.isNotBlank() && searchable.contains(token)
            } || matchesSynonym(normalized, business.category)
        }.sortedBy { it.distanceKm }
    }

    private fun matchesSynonym(query: String, category: String): Boolean = when (category) {
        "سوبر ماركت" -> listOf("سوبر", "بقالة", "زيت", "رز", "شيبسي", "منظفات").any(query::contains)
        "مطعم" -> listOf("مطعم", "فول", "فلافل", "طعمية", "أكل").any(query::contains)
        "ملابس" -> listOf("لبس", "ملابس", "قميص", "بنطلون", "هودي").any(query::contains)
        "سيارات" -> listOf("عربية", "سيارة", "عربيات").any(query::contains)
        else -> false
    }

    fun add(product: Product) {
        if (product.available) quantities[product.id] = (quantities[product.id] ?: 0) + 1
    }

    fun remove(product: Product) {
        val current = quantities[product.id] ?: return
        if (current <= 1) quantities.remove(product.id)
        else quantities[product.id] = current - 1
    }

    fun quantity(productId: String): Int = quantities[productId] ?: 0

    fun cartCount(): Int = quantities.values.sum()

    fun cartLines(): List<CartLine> {
        val products = DemoRepository.businesses
            .flatMap { it.products }
            .associateBy { it.id }

        return quantities.mapNotNull { (productId, quantity) ->
            products[productId]?.let { CartLine(it, quantity) }
        }
    }

    fun total(): Double = cartLines().sumOf { it.subtotal }

    fun clearCart() = quantities.clear()
}
