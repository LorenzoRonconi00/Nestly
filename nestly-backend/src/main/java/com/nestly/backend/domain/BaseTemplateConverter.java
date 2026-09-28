package com.nestly.backend.domain;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class BaseTemplateConverter implements AttributeConverter<BaseTemplate, String> {

    @Override
    public String convertToDatabaseColumn(BaseTemplate attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public BaseTemplate convertToEntityAttribute(String dbData) {
        return dbData == null ? null : BaseTemplate.fromValue(dbData);
    }
}