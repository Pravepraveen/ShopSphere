package com.ascendion.shopsphere.cart;

import com.ascendion.shopsphere.cart.dto.AddToCartRequest;
import com.ascendion.shopsphere.cart.dto.CartDto;
import com.ascendion.shopsphere.cart.entity.Cart;
import com.ascendion.shopsphere.cart.entity.CartItem;
import com.ascendion.shopsphere.cart.repository.CartItemRepository;
import com.ascendion.shopsphere.cart.repository.CartRepository;
import com.ascendion.shopsphere.cart.service.CartService;
import com.ascendion.shopsphere.catalog.category.Category;
import com.ascendion.shopsphere.catalog.product.Product;
import com.ascendion.shopsphere.catalog.product.ProductRepository;
import com.ascendion.shopsphere.common.exception.BadRequestException;
import com.ascendion.shopsphere.user.entity.Role;
import com.ascendion.shopsphere.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private CartService cartService;

    private User user;
    private Product product;
    private Cart cart;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("user@example.com")
                .role(Role.ROLE_CUSTOMER)
                .build();

        Category category = Category.builder().id(1L).name("Audio").build();

        product = Product.builder()
                .id(10L)
                .title("Wireless Headphones")
                .price(new BigDecimal("150.00"))
                .stock(5)
                .active(true)
                .category(category)
                .build();

        cart = Cart.builder()
                .id(100L)
                .user(user)
                .items(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Add item to cart successfully")
    void shouldAddItemToCart() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));
        when(cartRepository.findByUserIdWithItems(user.getId())).thenReturn(Optional.of(cart));

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(10L)
                .quantity(2)
                .build();

        CartDto result = cartService.addItemToCart(user, request);

        assertThat(result).isNotNull();
        assertThat(result.getItems()).hasSize(1);
        assertThat(result.getTotalItems()).isEqualTo(2);
        assertThat(result.getSubtotal()).isEqualByComparingTo("300.00");
    }

    @Test
    @DisplayName("Reject adding to cart when requested quantity exceeds available stock")
    void shouldRejectWhenQuantityExceedsStock() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(10L)
                .quantity(10) // Only 5 in stock
                .build();

        assertThatThrownBy(() -> cartService.addItemToCart(user, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("exceeds available stock");
    }

    @Test
    @DisplayName("Reject adding inactive product to cart")
    void shouldRejectInactiveProduct() {
        product.setActive(false);
        when(productRepository.findById(10L)).thenReturn(Optional.of(product));

        AddToCartRequest request = AddToCartRequest.builder()
                .productId(10L)
                .quantity(1)
                .build();

        assertThatThrownBy(() -> cartService.addItemToCart(user, request))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("Cannot add inactive product");
    }
}

