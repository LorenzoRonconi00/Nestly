package com.nestly.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "agendas")
public class Agenda {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String name;

    @Column(name = "base_template", nullable = false)
    private BaseTemplate baseTemplate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structure_template", nullable = false)
    private StructureTemplate structureTemplate;

    @Column(name = "cover_theme")
    private String coverTheme;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Agenda() {
    }

    public Agenda(UUID userId, String name, BaseTemplate baseTemplate, StructureTemplate structureTemplate) {
        this.userId = userId;
        this.name = name;
        this.baseTemplate = baseTemplate;
        this.structureTemplate = structureTemplate;
        this.createdAt = Instant.now();
    }

    public void setStructureTemplate(StructureTemplate structureTemplate) {
        this.structureTemplate = structureTemplate;
    }

    public UUID getId() {
        return id;
    }

    public UUID getUserId() {
        return userId;
    }

    public String getName() {
        return name;
    }

    public BaseTemplate getBaseTemplate() {
        return baseTemplate;
    }

    public StructureTemplate getStructureTemplate() {
        return structureTemplate;
    }

    public String getCoverTheme() {
        return coverTheme;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}