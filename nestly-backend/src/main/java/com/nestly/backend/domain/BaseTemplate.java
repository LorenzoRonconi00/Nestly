package com.nestly.backend.domain;

public enum BaseTemplate {
    NOTEBOOK("notebook"),
    STANDARD("standard"),
    DIARY("diary");

    private final String value;

    BaseTemplate(String value) {
        this.value = value;
    }

    public String getValue() {
        return value;
    }

    public static BaseTemplate fromValue(String value) {
        for (BaseTemplate template : values()) {
            if (template.value.equals(value)) {
                return template;
            }
        }
        throw new IllegalArgumentException("Unknown base template: " + value);
    }
}