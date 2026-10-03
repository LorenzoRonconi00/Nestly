package com.nestly.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nestly.backend.domain.RefreshToken;
import com.nestly.backend.repository.RefreshTokenRepository;

@Service
public class RefreshTokenService {

    private static final int TOKEN_BYTES = 32;

    public record RotatedToken(UUID userId, String rawToken) {

    }

    private final RefreshTokenRepository repository;
    private final SecureRandom secureRandom = new SecureRandom();
    private final Duration lifetime;

    public RefreshTokenService(
            RefreshTokenRepository repository,
            @Value("${nestly.refresh-token.expiration-days}") long expirationDays) {
        this.repository = repository;
        this.lifetime = Duration.ofDays(expirationDays);
    }

    public Duration getLifetime() {
        return lifetime;
    }

    @Transactional
    public String issue(UUID userId) {
        String rawToken = generate();
        repository.save(new RefreshToken(userId, UUID.randomUUID(), hash(rawToken), Instant.now().plus(lifetime)));
        return rawToken;
    }

    // Reuse of a revoked token must revoke the whole family and still commit, so the 401 must not roll back the transaction
    @Transactional(noRollbackFor = ResponseStatusException.class)
    public RotatedToken rotate(String rawToken) {
        Instant now = Instant.now();
        RefreshToken current = repository.findByTokenHash(hash(rawToken)).orElseThrow(this::invalidToken);
        if (current.isRevoked() || repository.revokeIfActive(current.getId(), now) == 0) {
            repository.revokeFamily(current.getFamilyId(), now);
            throw invalidToken();
        }
        if (current.isExpired(now)) {
            throw invalidToken();
        }
        String nextRawToken = generate();
        repository.save(new RefreshToken(
                current.getUserId(), current.getFamilyId(), hash(nextRawToken), now.plus(lifetime)));
        return new RotatedToken(current.getUserId(), nextRawToken);
    }

    @Transactional
    public void revoke(String rawToken) {
        repository.findByTokenHash(hash(rawToken))
                .ifPresent(token -> repository.revokeFamily(token.getFamilyId(), Instant.now()));
    }

    @Transactional
    public int purgeExpired() {
        return repository.deleteExpired(Instant.now());
    }

    private String generate() {
        byte[] bytes = new byte[TOKEN_BYTES];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String rawToken) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(digest);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException(ex);
        }
    }

    private ResponseStatusException invalidToken() {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid refresh token");
    }
}
