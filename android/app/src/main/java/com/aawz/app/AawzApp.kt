package com.aawz.app

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.ShoppingCart
import androidx.compose.material3.Badge
import androidx.compose.material3.BadgedBox
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.runtime.Composable
import androidx.compose.runtime.CompositionLocalProvider
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.lifecycle.viewmodel.compose.viewModel

private enum class Screen { HOME, RESULTS, STORE, CART, TOUR }

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AawzApp(vm: AawzViewModel = viewModel()) {
    CompositionLocalProvider(LocalLayoutDirection provides LayoutDirection.Rtl) {
        var screen by remember { mutableStateOf(Screen.HOME) }

        Scaffold(
            topBar = {
                TopAppBar(
                    title = {
                        Text(
                            text = when (screen) {
                                Screen.HOME -> "عاوز"
                                Screen.RESULTS -> "النتائج"
                                Screen.STORE -> "المتجر"
                                Screen.CART -> "سلة المشتريات"
                                Screen.TOUR -> "جولة 360"
                            },
                            fontWeight = FontWeight.Bold
                        )
                    },
                    navigationIcon = {
                        if (screen != Screen.HOME) {
                            IconButton(onClick = {
                                screen = when (screen) {
                                    Screen.RESULTS -> Screen.HOME
                                    Screen.STORE -> Screen.RESULTS
                                    Screen.CART, Screen.TOUR -> Screen.STORE
                                    Screen.HOME -> Screen.HOME
                                }
                            }) {
                                Icon(Icons.Default.ArrowBack, contentDescription = "رجوع")
                            }
                        }
                    },
                    actions = {
                        if (screen != Screen.CART) {
                            IconButton(onClick = { screen = Screen.CART }) {
                                BadgedBox(
                                    badge = {
                                        if (vm.cartCount() > 0) {
                                            Badge { Text(vm.cartCount().toString()) }
                                        }
                                    }
                                ) {
                                    Icon(Icons.Default.ShoppingCart, contentDescription = "السلة")
                                }
                            }
                        }
                    }
                )
            }
        ) { padding ->
            Box(Modifier.padding(padding).fillMaxSize()) {
                when (screen) {
                    Screen.HOME -> HomeScreen(
                        query = vm.query,
                        onQueryChange = { vm.query = it },
                        onSearch = { screen = Screen.RESULTS }
                    )
                    Screen.RESULTS -> ResultsScreen(
                        results = vm.results(),
                        onSelect = {
                            vm.selectedBusiness = it
                            screen = Screen.STORE
                        }
                    )
                    Screen.STORE -> vm.selectedBusiness?.let { business ->
                        StoreScreen(
                            business = business,
                            vm = vm,
                            onTour = { screen = Screen.TOUR },
                            onCart = { screen = Screen.CART }
                        )
                    }
                    Screen.CART -> CartScreen(vm)
                    Screen.TOUR -> vm.selectedBusiness?.let { business ->
                        PanoramaScreen(business = business, onAddProduct = vm::add)
                    }
                }
            }
        }
    }
}
