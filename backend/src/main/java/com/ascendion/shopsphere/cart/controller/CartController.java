package com.ascendion.shopsphere.cart.controller;

import com.ascendion.shopsphere.auth.service.AuthService;
import com.ascendion.shopsphere.cart.dto.AddToCartRequest;
import com.ascendion.shopsphere.cart.dto.CartDto;
import com.ascendion.shopsphere.cart.dto.UpdateCartItemRequest;
import com.ascendion.shopsphere.cart.service.CartService;
import com.ascendion.shopsphere.common.response.ApiResponse;
import com.ascendion.shopsphere.user.entity.User;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@Tag(name = "Shopping Cart", description = "Customer shopping cart management")
public class CartController {

    private final CartService cartService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "View current customer's shopping cart")
    public ResponseEntity<ApiResponse<CartDto>> getCart() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success(cartService.getUserCart(currentUser)));
    }

    @PostMapping("/items")
    @Operation(summary = "Add an item to the shopping cart")
    public ResponseEntity<ApiResponse<CartDto>> addItem(@Valid @RequestBody AddToCartRequest request) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success("Item added to cart", cartService.addItemToCart(currentUser, request)));
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update quantity of a cart item")
    public ResponseEntity<ApiResponse<CartDto>> updateItem(
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateCartItemRequest request
    ) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success("Cart item updated", cartService.updateItemQuantity(currentUser, itemId, request)));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from the shopping cart")
    public ResponseEntity<ApiResponse<CartDto>> removeItem(@PathVariable Long itemId) {
        User currentUser = authService.getCurrentAuthenticatedUser();
        return ResponseEntity.ok(ApiResponse.success("Cart item removed", cartService.removeItemFromCart(currentUser, itemId)));
    }

    @DeleteMapping
    @Operation(summary = "Clear all items from the shopping cart")
    public ResponseEntity<ApiResponse<String>> clearCart() {
        User currentUser = authService.getCurrentAuthenticatedUser();
        cartService.clearCart(currentUser);
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", "All items removed from cart"));
    }
}

