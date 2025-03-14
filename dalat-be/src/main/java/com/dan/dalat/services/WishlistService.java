package com.dan.dalat.services;

import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface WishlistService {
    Wishlist create(Long placeId, String username);
    ResponseMessage delete(Long id, String username);
    boolean isWishlisted(Long placeId, String username);
    Page<Wishlist> getWishlist(String username, String name, Pageable pageable);
    Wishlist getWishList(Long id);
}
