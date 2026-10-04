package com.nestly.backend.service;

import java.util.List;

public class DataLossConfirmationRequiredException extends RuntimeException {

    public record Loss(String type, long pageCount) {

    }

    private final transient List<Loss> losses;

    public DataLossConfirmationRequiredException(List<Loss> losses) {
        super("Removing these sections would delete existing data");
        this.losses = losses;
    }

    public List<Loss> getLosses() {
        return losses;
    }
}
