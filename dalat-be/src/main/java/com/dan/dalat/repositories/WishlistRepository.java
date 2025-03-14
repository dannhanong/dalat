package com.dan.dalat.repositories;

import com.dan.dalat.models.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Page<Wishlist> findByUser_UsernameAndPlace_NameContainingIgnoreCase(String username, String name, Pageable pageable);
    boolean existsByPlace_IdAndUser_Username(Long placeId, String username);
}
