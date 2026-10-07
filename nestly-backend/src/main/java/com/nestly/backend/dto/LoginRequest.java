package com.nestly.backend.dto;

import com.nestly.backend.validation.MaxUtf8Bytes;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @Email
        @NotBlank
        String email,
        @NotBlank
        @MaxUtf8Bytes(72)
        String password) {

}
