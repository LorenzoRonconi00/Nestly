package com.nestly.backend.controller;

import java.util.UUID;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.nestly.backend.config.CurrentUser;
import com.nestly.backend.config.RefreshTokenCookies;
import com.nestly.backend.domain.User;
import com.nestly.backend.dto.AuthResponse;
import com.nestly.backend.dto.LoginRequest;
import com.nestly.backend.dto.LoginResponse;
import com.nestly.backend.dto.RegisterRequest;
import com.nestly.backend.service.JwtService;
import com.nestly.backend.service.RefreshTokenService;
import com.nestly.backend.service.UserService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;
    private final RefreshTokenCookies refreshTokenCookies;

    public AuthController(
            UserService userService,
            JwtService jwtService,
            RefreshTokenService refreshTokenService,
            RefreshTokenCookies refreshTokenCookies) {
        this.userService = userService;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
        this.refreshTokenCookies = refreshTokenCookies;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        User user = userService.register(request.email(), request.password());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new AuthResponse(user.getId(), user.getEmail()));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        User user = userService.authenticate(request.email(), request.password());
        String accessToken = jwtService.generateToken(user.getId(), user.getEmail());
        String refreshToken = refreshTokenService.issue(user.getId());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(refreshToken))
                .body(new LoginResponse(accessToken, user.getId(), user.getEmail()));
    }

    @PostMapping("/refresh")
    public ResponseEntity<LoginResponse> refresh(
            @CookieValue(name = RefreshTokenCookies.NAME, required = false) String refreshToken) {
        if (refreshToken == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing refresh token");
        }
        RefreshTokenService.RotatedToken rotated = refreshTokenService.rotate(refreshToken);
        User user = userService.getById(rotated.userId());
        String accessToken = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(rotated.rawToken()))
                .body(new LoginResponse(accessToken, user.getId(), user.getEmail()));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            @CookieValue(name = RefreshTokenCookies.NAME, required = false) String refreshToken) {
        if (refreshToken != null) {
            refreshTokenService.revoke(refreshToken);
        }
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, refreshTokenCookies.clear().toString())
                .build();
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me() {
        UUID userId = CurrentUser.id();
        User user = userService.getById(userId);
        return ResponseEntity.ok(new AuthResponse(user.getId(), user.getEmail()));
    }

    private String refreshCookie(String rawToken) {
        return refreshTokenCookies.create(rawToken, refreshTokenService.getLifetime()).toString();
    }
}
