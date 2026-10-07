package com.nestly.backend.service;

import java.util.List;
import java.util.Map;
import java.util.stream.IntStream;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatCode;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import com.nestly.backend.domain.SectionType;

class SectionDataValidatorTest {

    private final SectionDataValidator validator = new SectionDataValidator();

    private void assertRejected(SectionType type, Map<String, Object> data) {
        assertThatThrownBy(() -> validator.validate(type, data))
                .isInstanceOfSatisfying(ResponseStatusException.class,
                        ex -> assertThat(ex.getStatusCode()).isEqualTo(HttpStatus.BAD_REQUEST));
    }

    @Test
    void acceptsTheShapesWrittenByTheFrontend() {
        assertThatCode(() -> {
            validator.validate(SectionType.FREETEXT, Map.of("text", "Dear diary", "confirmed", true));
            validator.validate(SectionType.MOOD, Map.of("value", 4));
            validator.validate(SectionType.CHECKLIST, Map.of("confirmed", false, "items", List.of(
                    Map.of("id", "a", "text", "Buy bread", "done", true))));
            validator.validate(SectionType.EXPENSES, Map.of("confirmed", true, "items", List.of(
                    Map.of("id", "a", "label", "Coffee", "amount", 2.5, "category", "Food"))));
            validator.validate(SectionType.APPOINTMENTS, Map.of("confirmed", true, "items", List.of(
                    Map.of("id", "a", "time", "09:30", "description", "Dentist"))));
        }).doesNotThrowAnyException();
    }

    @Test
    void acceptsEmptyData() {
        for (SectionType type : SectionType.values()) {
            assertThatCode(() -> validator.validate(type, Map.of())).doesNotThrowAnyException();
        }
    }

    @Test
    void rejectsUnknownFields() {
        assertRejected(SectionType.FREETEXT, Map.of("text", "a", "extra", 1));
        assertRejected(SectionType.CHECKLIST, Map.of("items", List.of(Map.of("text", "a", "extra", 1))));
        assertRejected(SectionType.MOOD, Map.of("value", 3, "extra", 1));
    }

    @Test
    void rejectsValuesOfTheWrongType() {
        assertRejected(SectionType.FREETEXT, Map.of("text", 5));
        assertRejected(SectionType.FREETEXT, Map.of("confirmed", "yes"));
        assertRejected(SectionType.CHECKLIST, Map.of("items", "not-a-list"));
        assertRejected(SectionType.CHECKLIST, Map.of("items", List.of("not-an-object")));
        assertRejected(SectionType.CHECKLIST, Map.of("items", List.of(Map.of("done", "yes"))));
        assertRejected(SectionType.EXPENSES, Map.of("items", List.of(Map.of("amount", "5"))));
        assertRejected(SectionType.EXPENSES, Map.of("items", List.of(Map.of("amount", 1e15))));
    }

    @Test
    void rejectsTextAndListsThatAreTooLarge() {
        assertThatCode(() -> validator.validate(SectionType.FREETEXT, Map.of("text", "x".repeat(50_000))))
                .doesNotThrowAnyException();
        assertRejected(SectionType.FREETEXT, Map.of("text", "x".repeat(50_001)));
        assertRejected(SectionType.CHECKLIST, Map.of("items", List.of(Map.of("text", "x".repeat(501)))));

        List<Object> hundred = IntStream.range(0, 100).<Object>mapToObj(i -> Map.of("text", "a")).toList();
        List<Object> tooMany = IntStream.range(0, 101).<Object>mapToObj(i -> Map.of("text", "a")).toList();
        assertThatCode(() -> validator.validate(SectionType.CHECKLIST, Map.of("items", hundred)))
                .doesNotThrowAnyException();
        assertRejected(SectionType.CHECKLIST, Map.of("items", tooMany));
    }

    @Test
    void rejectsMoodValuesOutsideTheScale() {
        assertRejected(SectionType.MOOD, Map.of("value", 0));
        assertRejected(SectionType.MOOD, Map.of("value", 6));
        assertRejected(SectionType.MOOD, Map.of("value", 2.5));
        assertRejected(SectionType.MOOD, Map.of("value", "3"));
    }
}
