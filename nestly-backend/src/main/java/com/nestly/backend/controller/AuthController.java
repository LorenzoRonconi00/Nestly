package com.nestly.backend.controller;

import com.nestly.backend.config.CurrentUser;
import com.nestly.backend.domain.User;
import com.nestly.backend.dto.AuthResponse;
import com.nestly.backend.dto.LoginRequest;
import com.nestly.backend.dto.LoginResponse;
import com.nestly.backend.dto.RegisterRequest;
import com.nestly.backend.service.JwtService;
import com.nestly.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;
    private final JwtService jwtService;

    public AuthController(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
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
        String token = jwtService.generateToken(user.getId(), user.getEmail());
        return ResponseEntity.ok(new LoginResponse(token, user.getId(), user.getEmail()));
    }

    @GetMapping("/me")
    public ResponseEntity<AuthResponse> me() {
        UUID userId = CurrentUser.id();
        User user = userService.getById(userId);
        return ResponseEntity.ok(new AuthResponse(user.getId(), user.getEmail()));
    }
}