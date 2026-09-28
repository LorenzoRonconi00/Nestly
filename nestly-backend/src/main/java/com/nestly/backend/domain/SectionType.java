package com.nestly.backend.domain;

public enum SectionType {
    EXPENSES("expenses"),
    CHECKLIST("checklist"),
    MOOD("mood"),
    FREETEXT("freetext"),
    APPOINTMENTS("appointments");

    private final String value;

    SectionType(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static SectionType fromValue(String value) {
        for (SectionType type : values()) {
            if (type.value.equals(value)) {
                return type;
            }
        }
        throw new IllegalArgumentException("Unknown section type: " + value);
    }
}