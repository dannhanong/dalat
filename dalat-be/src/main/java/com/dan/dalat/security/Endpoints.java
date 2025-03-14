package com.dan.dalat.security;

public class Endpoints {
    public static final String[] PUBLIC_POST_ENDPOINTS = {
            "/auth/login",
            "/auth/signup",
            "/auth/hdkt-forgot-password",
            "/auth/refresh-token",
            "/auth/oauth2/**",
            "/places/public/**",
    };

    public static final String[] PRIVATE_POST_ENDPOINTS = {
            "/auth/logout",
            "/places/private/**",
            "/feedbacks/private/**",
            "/itineraries/private/**",
            "/wishlist/private/**",
            "/services/private/**",
    };

    public static final String[] ADMIN_POST_ENDPOINTS = {
            "/auth/admin/**",
            "/packages/admin/**",
            "/categories/admin/**",
            "/blogs/admin/**",
            "/services/admin/**",
            "/icons/admin/**",
            "/festivals/admin/**",
    };

    public static final String[] ADMIN_PUT_ENDPOINTS = {
            "/categories/admin/**",
            "/places/admin/**",
            "/services/admin/**",
            "/icons/admin/**",
            "/festivals/admin/**",
            "/auth/admin/**",
    };

    public static final String[] ADMIN_GET_ENDPOINTS = {
        "/auth/admin/**",
    };

    public static final String[] ADMIN_DELETE_ENDPOINTS = {
            "/categories/admin/**",
            "/places/admin/**",
            "/services/admin/**",
            "/icons/admin/**",
            "/festivals/admin/**",
            "/feedbacks/admin/**",
    };

    public static final String[] PUBLIC_GET_ENDPOINTS = {
            "/auth/verify",
            "/auth/validate",
            "/auth/user/**",
            "/auth",
            "/auth/get-name/**",
            "/auth/user/profile/**",
            "/auth/public/**",
            "/packages/public/**",
            "/files/**",
            "/categories/public/**",
            "/public/**",
            "/places/public/**",
            "/feedbacks/public/**",
            "/services/public/**",
            "/icons/public/**",
            "/festivals/public/**",
    };

    public static final String[] PRIVATE_GET_ENDPOINTS = {
            "/auth/get/profile",
            "/itineraries/private/**",
            "/wishlist/private/**",
    };

    public static final String[] PUBLIC_PUT_ENDPOINTS = {
            "/auth/reset-password",
    };

    public static final String[] PRIVATE_PUT_ENDPOINTS = {
            "/auth/update-profile",
            "/auth/change-password",
            "/places/private/**",
            "/itineraries/private/**",
            "/wishlist/private/**",
    };

    public static final String[] PRIVATE_DELETE_ENDPOINTS = {
            "/places/private/**",
            "/itineraries/private/**",
            "/wishlist/private/**",
    };
}
