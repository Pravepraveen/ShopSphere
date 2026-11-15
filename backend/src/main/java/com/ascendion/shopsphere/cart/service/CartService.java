package com.ascendion.shopsphere.cart.service;

import com.ascendion.shopsphere.cart.dto.AddToCartRequest;
import com.ascendion.shopsphere.cart.dto.CartDto;
import com.ascendion.shopsphere.cart.dto.UpdateCartItemRequest;
import com.ascendion.shopsphere.cart.entity.Cart;
import com.ascendion.shopsphere.cart.entity.CartItem;
import com.ascendion.shopsphere.cart.repository.CartItemRepository;
import com.ascendion.shopsphere.cart.repository.CartRepository;
import com.ascendion.shopsphere.catalog.product.Product;
import com.ascendion.shopsphere.catalog.product.ProductRepository;
import com.ascendion.shopsphere.common.exception.BadRequestException;
import com.ascendion.shopsphere.common.exception.ResourceNotFoundException;
import com.ascendion.shopsphere.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;

    @Transactional
    public Cart getOrCreateCart(User user) {
        return cartRepository.findByUserIdWithItems(user.getId())
                .orElseGet(() -> {
                    Cart newCart = Cart.builder()
                            .user(user)
                            .build();
                    return cartRepository.save(newCart);
                });
    }

    @Transactional(readOnly = true)
    public CartDto getUserCart(User user) {
        return cartRepository.findByUserIdWithItems(user.getId())
                .map(CartDto::fromEntity)
                .orElseGet(() -> CartDto.builder()
                        .userId(user.getId())
                        .items(java.util.Collections.emptyList())
                        .totalItems(0)
                        .subtotal(java.math.BigDecimal.ZERO)
                        .build());
    }

    @Transactional
    public CartDto addItemToCart(User user, AddToCartRequest request) {
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("Cannot add inactive product to cart: " + product.getTitle());
        }

        if (product.getStock() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity (" + request.getQuantity() +
                    ") exceeds available stock (" + product.getStock() + ") for " + product.getTitle());
        }

        Cart cart = getOrCreateCart(user);

        Optional<CartItem> existingItemOpt = cart.getItems().stream()
                .filter(item -> item.getProduct().getId().equals(product.getId()))
                .findFirst();

        if (existingItemOpt.isPresent()) {
            CartItem existingItem = existingItemOpt.get();
            int newQuantity = existingItem.getQuantity() + request.getQuantity();
            if (product.getStock() < newQuantity) {
                throw new BadRequestException("Total requested quantity (" + newQuantity +
                        ") exceeds available stock (" + product.getStock() + ")");
            }
            existingItem.setQuantity(newQuantity);
            cartItemRepository.save(existingItem);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .product(product)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return CartDto.fromEntity(cartRepository.findByUserIdWithItems(user.getId()).orElse(cart));
    }

    @Transactional
    public CartDto updateItemQuantity(User user, Long itemId, UpdateCartItemRequest request) {
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to the current user's cart");
        }

        if (item.getProduct().getStock() < request.getQuantity()) {
            throw new BadRequestException("Requested quantity (" + request.getQuantity() +
                    ") exceeds available stock (" + item.getProduct().getStock() + ")");
        }

        item.setQuantity(request.getQuantity());
        cartItemRepository.save(item);

        return CartDto.fromEntity(cartRepository.findByUserIdWithItems(user.getId()).orElse(cart));
    }

    @Transactional
    public CartDto removeItemFromCart(User user, Long itemId) {
        Cart cart = getOrCreateCart(user);

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + itemId));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new BadRequestException("Cart item does not belong to the current user's cart");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);

        return CartDto.fromEntity(cartRepository.findByUserIdWithItems(user.getId()).orElse(cart));
    }

    @Transactional
    public void clearCart(User user) {
        cartRepository.findByUserId(user.getId()).ifPresent(cart -> {
            cart.getItems().clear();
            cartItemRepository.deleteByCartId(cart.getId());
        });
    }
}

