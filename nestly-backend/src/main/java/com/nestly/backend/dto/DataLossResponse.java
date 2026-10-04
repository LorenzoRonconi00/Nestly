package com.nestly.backend.dto;

import java.util.List;

public record DataLossResponse(List<Item> sections) {

    public record Item(String type, long pageCount) {

    }
}
