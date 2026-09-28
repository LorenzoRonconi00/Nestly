package com.nestly.backend.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class SectionTypeConverter implements AttributeConverter<SectionType, String> {

    @Override
    public String convertToDatabaseColumn(SectionType attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public SectionType convertToEntityAttribute(String dbData) {
        return dbData == null ? null : SectionType.fromValue(dbData);
    }
}