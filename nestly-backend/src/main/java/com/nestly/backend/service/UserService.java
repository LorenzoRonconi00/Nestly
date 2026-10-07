package com.nestly.backend.service;

import java.util.Locale;
import java.util.UUID;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nestly.backend.domain.User;
import com.nestly.backend.repository.UserRepository;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User register(String email, String rawPassword) {
        String normalizedEmail = normalize(email);
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw emailAlreadyRegistered();
        }
        try {
            return userRepository.save(new User(normalizedEmail, passwordEncoder.encode(rawPassword)));
        } catch (DataIntegrityViolationException ex) {
            // Two concurrent registrations can both pass the existence check: the unique index decides the winner
            throw emailAlreadyRegistered();
        }
    }

    public User authenticate(String email, String rawPassword) {
        User user = userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials"));
        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        return user;
    }

    public User getById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private static String normalize(String email) {
        return email.strip().toLowerCase(Locale.ROOT);
    }

    private static ResponseStatusException emailAlreadyRegistered() {
        return new ResponseStatusException(HttpStatus.CONFLICT, "Email already registered");
    }
}
