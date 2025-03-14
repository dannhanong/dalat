package com.dan.dalat.services.impls;

import com.dan.dalat.dtos.responses.ResponseMessage;
import com.dan.dalat.models.Place;
import com.dan.dalat.models.User;
import com.dan.dalat.models.Wishlist;
import com.dan.dalat.repositories.PlaceRepository;
import com.dan.dalat.repositories.UserRepository;
import com.dan.dalat.repositories.WishlistRepository;
import com.dan.dalat.services.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class WishlistServiceImpl implements WishlistService {
    @Autowired
    private WishlistRepository wishlistRepository;
    @Autowired
    private PlaceRepository placeRepository;
    @Autowired
    private UserRepository userRepository;

    @Override
    public Wishlist create(Long placeId, String username) {
        User user = userRepository.findByUsername(username);
        Place place = placeRepository.findById(placeId).orElseThrow(() -> new RuntimeException("Không tìm thấy địa điểm"));
        if (wishlistRepository.existsByPlace_IdAndUser_Username(placeId, username)){
            return null;
        }
        Wishlist wishlist = new Wishlist();
        wishlist.setUser(user);
        wishlist.setPlace(place);
        return wishlistRepository.save(wishlist);
    }

    @Override
    public ResponseMessage delete(Long id, String username) {
        return wishlistRepository.findById(id).map(wishlist -> {
            if (!wishlist.getUser().getUsername().equals(username)){
                throw new RuntimeException("Không thể xóa wishlist của người khác");
            }
            wishlistRepository.delete(wishlist);
            return new ResponseMessage(200, "Xóa wishlist thành công");
        }).orElseThrow(() -> new RuntimeException("Không tìm thấy wishlist"));
    }

    @Override
    public boolean isWishlisted(Long placeId, String username) {
        return wishlistRepository.existsByPlace_IdAndUser_Username(placeId, username);
    }

    @Override
    public Page<Wishlist> getWishlist(String username, String name, Pageable pageable) {
        return wishlistRepository.findByUser_UsernameAndPlace_NameContainingIgnoreCase(username, name, pageable);
    }

    @Override
    public Wishlist getWishList(Long id) {
        return wishlistRepository.findById(id).orElseThrow(() -> new RuntimeException("Không tìm thấy wishlist"));
    }
}
