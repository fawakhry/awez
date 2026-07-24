package com.aawz.app

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material.icons.filled.Explore
import androidx.compose.material.icons.filled.Remove
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.HorizontalDivider
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import java.text.NumberFormat
import java.util.Locale

@Composable
fun StoreScreen(
    business: Business,
    vm: AawzViewModel,
    onTour: () -> Unit,
    onCart: () -> Unit
) {
    Column(Modifier.fillMaxSize()) {
        Column(Modifier.padding(16.dp)) {
            Text(
                text = business.name,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
            Text("${business.address} • ${business.distanceKm} كم • ${business.rating} ★")

            if (business.hasTour360) {
                Spacer(Modifier.height(10.dp))
                Button(
                    onClick = onTour,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.Explore, contentDescription = null)
                    Spacer(Modifier.width(8.dp))
                    Text("ادخل جولة 360 واختار من جوه المحل")
                }
            }
        }

        HorizontalDivider()

        if (!business.hasCart) {
            Box(
                modifier = Modifier.fillMaxSize().padding(20.dp),
                contentAlignment = Alignment.TopCenter
            ) {
                Text("هذا النشاط يستخدم اتصال أو حجز أو طلب عرض سعر بدل سلة المشتريات.")
            }
            return
        }

        LazyColumn(
            modifier = Modifier.weight(1f).padding(horizontal = 16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(business.products) { product ->
                ProductRow(
                    product = product,
                    quantity = vm.quantity(product.id),
                    onAdd = { vm.add(product) },
                    onRemove = { vm.remove(product) }
                )
            }
        }

        Button(
            onClick = onCart,
            modifier = Modifier.fillMaxWidth().padding(16.dp).height(54.dp)
        ) {
            Icon(Icons.Default.ShoppingCart, contentDescription = null)
            Spacer(Modifier.width(8.dp))
            Text("راجع السلة والفاتورة")
        }
    }
}

@Composable
private fun ProductRow(
    product: Product,
    quantity: Int,
    onAdd: () -> Unit,
    onRemove: () -> Unit
) {
    Card(Modifier.fillMaxWidth()) {
        Row(
            modifier = Modifier.fillMaxWidth().padding(14.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Column(Modifier.weight(1f)) {
                Text(product.name, fontWeight = FontWeight.Bold)
                Text("${money(product.price)} / ${product.unit}")
                if (!product.available) {
                    Text("غير متاح", color = MaterialTheme.colorScheme.error)
                }
            }

            if (quantity == 0) {
                Button(onClick = onAdd, enabled = product.available) {
                    Text("ضيف")
                }
            } else {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = onRemove) {
                        Icon(Icons.Default.Remove, contentDescription = "تقليل")
                    }
                    Text(quantity.toString(), fontWeight = FontWeight.Bold)
                    IconButton(onClick = onAdd) {
                        Icon(Icons.Default.Add, contentDescription = "زيادة")
                    }
                }
            }
        }
    }
}

@Composable
fun CartScreen(vm: AawzViewModel) {
    val lines = vm.cartLines()

    if (lines.isEmpty()) {
        Box(Modifier.fillMaxSize(), contentAlignment = Alignment.Center) {
            Text("السلة فاضية حاليًا", style = MaterialTheme.typography.headlineSmall)
        }
        return
    }

    Column(Modifier.fillMaxSize()) {
        LazyColumn(
            modifier = Modifier.weight(1f).padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            items(lines) { line ->
                Card(Modifier.fillMaxWidth()) {
                    Row(
                        modifier = Modifier.fillMaxWidth().padding(14.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(Modifier.weight(1f)) {
                            Text(line.product.name, fontWeight = FontWeight.Bold)
                            Text("${line.quantity} × ${money(line.product.price)}")
                            Text("الإجمالي: ${money(line.subtotal)}")
                        }
                        IconButton(onClick = { vm.remove(line.product) }) {
                            Icon(Icons.Default.Remove, contentDescription = "تقليل")
                        }
                        Text(line.quantity.toString())
                        IconButton(onClick = { vm.add(line.product) }) {
                            Icon(Icons.Default.Add, contentDescription = "زيادة")
                        }
                    }
                }
            }
        }

        Column(
            modifier = Modifier
                .fillMaxWidth()
                .background(MaterialTheme.colorScheme.surfaceVariant)
                .padding(18.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("إجمالي الفاتورة", fontWeight = FontWeight.Bold)
                Text(money(vm.total()), fontWeight = FontWeight.ExtraBold)
            }
            Text("التوصيل والدفع يضافان بعد تحديد العنوان وطريقة الدفع.")
            Spacer(Modifier.height(10.dp))
            Button(
                onClick = { },
                modifier = Modifier.fillMaxWidth().height(52.dp)
            ) {
                Text("تأكيد الطلب — نسخة تجريبية")
            }
            TextButton(
                onClick = vm::clearCart,
                modifier = Modifier.align(Alignment.CenterHorizontally)
            ) {
                Icon(Icons.Default.Delete, contentDescription = null)
                Text("تفريغ السلة")
            }
        }
    }
}

private fun money(value: Double): String =
    NumberFormat.getCurrencyInstance(Locale("ar", "EG")).format(value)
