package com.aawz.app

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Mic
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.AssistChip
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp

@Composable
fun HomeScreen(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearch: () -> Unit
) {
    val voice = rememberVoiceInput { result ->
        onQueryChange(result)
        onSearch()
    }

    Column(
        modifier = Modifier.fillMaxSize().padding(20.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Box(
            modifier = Modifier.size(88.dp).background(MaterialTheme.colorScheme.primary, CircleShape),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "ع",
                style = MaterialTheme.typography.displayMedium,
                color = MaterialTheme.colorScheme.onPrimary
            )
        }

        Spacer(Modifier.height(18.dp))
        Text(
            text = "عاوز... هتلاقي",
            style = MaterialTheme.typography.headlineMedium,
            fontWeight = FontWeight.ExtraBold
        )
        Text(
            text = "قول أو اكتب أنت محتاج إيه في بنها",
            textAlign = TextAlign.Center
        )

        Spacer(Modifier.height(24.dp))
        OutlinedTextField(
            value = query,
            onValueChange = onQueryChange,
            modifier = Modifier.fillMaxWidth(),
            singleLine = true,
            label = { Text("مثال: عاوز زيت ورز من أقرب سوبر ماركت") },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null) },
            trailingIcon = {
                IconButton(onClick = voice.start) {
                    Icon(Icons.Default.Mic, contentDescription = "بحث صوتي")
                }
            }
        )

        if (voice.listening) {
            Text("سامعك... اتكلم", fontWeight = FontWeight.Bold)
        }
        voice.error?.let {
            Text(it, color = MaterialTheme.colorScheme.error)
        }

        Spacer(Modifier.height(12.dp))
        Button(
            onClick = onSearch,
            modifier = Modifier.fillMaxWidth().height(52.dp)
        ) {
            Text("دور لي")
        }

        Spacer(Modifier.height(16.dp))
        Row(horizontalArrangement = Arrangement.spacedBy(6.dp)) {
            listOf("سوبر ماركت", "مطعم", "ملابس", "عربيات").forEach { category ->
                AssistChip(
                    onClick = {
                        onQueryChange(category)
                        onSearch()
                    },
                    label = { Text(category) }
                )
            }
        }
    }
}

@Composable
fun ResultsScreen(
    results: List<Business>,
    onSelect: (Business) -> Unit
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize().padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        item {
            Text(
                text = "الأقرب والأفضل ليك",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
        }

        if (results.isEmpty()) {
            item { Text("ملقيناش نتيجة في البيانات التجريبية. جرّب كلمة تانية.") }
        }

        items(results) { business ->
            Card(
                modifier = Modifier.fillMaxWidth().clickable { onSelect(business) }
            ) {
                Column(Modifier.padding(16.dp)) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween
                    ) {
                        Text(business.name, fontWeight = FontWeight.Bold)
                        Text("${business.rating} ★")
                    }
                    Text("${business.category} • ${business.address}")
                    Text(
                        "${business.distanceKm} كم • مفتوح الآن" +
                            if (business.hasCart) " • سلة" else "" +
                            if (business.hasTour360) " • 360" else ""
                    )
                }
            }
        }
    }
}
