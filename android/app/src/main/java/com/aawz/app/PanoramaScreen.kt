package com.aawz.app

import android.annotation.SuppressLint
import android.os.Handler
import android.os.Looper
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.viewinterop.AndroidView

private class ProductBridge(
    private val onAddProduct: (String) -> Unit
) {
    @JavascriptInterface
    fun addToCart(productId: String) {
        Handler(Looper.getMainLooper()).post {
            onAddProduct(productId)
        }
    }
}

@SuppressLint("SetJavaScriptEnabled")
@Composable
fun PanoramaScreen(
    business: Business,
    onAddProduct: (Product) -> Unit
) {
    AndroidView(
        modifier = Modifier.fillMaxSize(),
        factory = { context ->
            WebView(context).apply {
                settings.javaScriptEnabled = true
                settings.domStorageEnabled = true
                webChromeClient = WebChromeClient()
                webViewClient = WebViewClient()
                addJavascriptInterface(
                    ProductBridge { productId ->
                        business.products
                            .firstOrNull { it.id == productId }
                            ?.let(onAddProduct)
                    },
                    "AawzAndroid"
                )
                loadDataWithBaseURL(
                    "https://pannellum.org/",
                    panoramaHtml(business),
                    "text/html",
                    "UTF-8",
                    null
                )
            }
        }
    )
}

private fun panoramaHtml(business: Business): String {
    val coordinates = listOf(-55 to -8, -5 to -2, 40 to 5, 85 to 1)
    val hotSpots = business.products.take(4).mapIndexed { index, product ->
        val (yaw, pitch) = coordinates[index]
        """{
            pitch: $pitch,
            yaw: $yaw,
            cssClass: 'product-hotspot',
            createTooltipFunc: createProductHotspot,
            createTooltipArgs: {
                id: '${product.id}',
                name: '${product.name}',
                price: '${product.price.toInt()} ج.م'
            }
        }""".trimIndent()
    }.joinToString(",")

    return """
        <!doctype html>
        <html lang="ar" dir="rtl">
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.css">
          <script src="https://cdn.jsdelivr.net/npm/pannellum@2.5.6/build/pannellum.js"></script>
          <style>
            html, body, #panorama { width:100%; height:100%; margin:0; background:#111827; font-family:sans-serif; }
            .product-hotspot { width:34px; height:34px; border-radius:50%; background:#f59e0b; border:3px solid #fff; box-shadow:0 4px 18px rgba(0,0,0,.45); cursor:pointer; }
            .product-card { position:absolute; width:180px; right:42px; top:-30px; background:#fff; color:#111827; border-radius:14px; padding:10px; box-shadow:0 8px 30px rgba(0,0,0,.3); display:none; text-align:right; }
            .product-hotspot:hover .product-card, .product-hotspot:active .product-card { display:block; }
            button { width:100%; border:0; border-radius:10px; padding:9px; background:#111827; color:#fff; font-weight:700; margin-top:8px; }
            .tour-title { position:fixed; z-index:10; top:12px; right:12px; left:12px; background:rgba(17,24,39,.88); color:white; border-radius:14px; padding:10px 14px; text-align:center; }
          </style>
        </head>
        <body>
          <div class="tour-title">جولة 360 داخل ${business.name} — اضغط على نقاط المنتجات</div>
          <div id="panorama"></div>
          <script>
            function createProductHotspot(hotSpotDiv, args) {
              var card = document.createElement('div');
              card.className = 'product-card';
              card.innerHTML = '<strong>' + args.name + '</strong><br><span>' + args.price + '</span><button onclick="event.stopPropagation(); addProduct(\'' + args.id + '\')">ضيف للسلة</button>';
              hotSpotDiv.appendChild(card);
              hotSpotDiv.onclick = function() { addProduct(args.id); };
            }
            function addProduct(id) {
              if (window.AawzAndroid) window.AawzAndroid.addToCart(id);
            }
            pannellum.viewer('panorama', {
              type: 'equirectangular',
              panorama: 'https://pannellum.org/images/alma.jpg',
              autoLoad: true,
              showControls: true,
              compass: true,
              hotSpots: [$hotSpots]
            });
          </script>
        </body>
        </html>
    """.trimIndent()
}
