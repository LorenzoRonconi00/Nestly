package com.nestly.backend.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

@Component
public class RefreshTokenCookies {

    public static final String NAME = "nestly_refresh";
    private static final String PATH = "/api/auth";

    private final boolean secure;

    public RefreshTokenCookies(@Value("${nestly.refresh-token.cookie-secure}") boolean secure) {
        this.secure = secure;
    }

    public ResponseCookie create(String rawToken, Duration maxAge) {
        return build(rawToken, maxAge);
    }

    public ResponseCookie clear() {
        return build("", Duration.ZERO);
    }

    private ResponseCookie build(String value, Duration maxAge) {
        return ResponseCookie.from(NAME, value)
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path(PATH)
                .maxAge(maxAge)
                .build();
    }
}
