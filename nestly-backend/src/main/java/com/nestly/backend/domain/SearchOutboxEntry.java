package com.nestly.backend.domain;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "search_outbox")
public class SearchOutboxEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SearchOutboxKind kind;

    @Column(name = "ref_id", nullable = false, updatable = false)
    private UUID refId;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected SearchOutboxEntry() {
    }

    public SearchOutboxEntry(SearchOutboxKind kind, UUID refId) {
        this.kind = kind;
        this.refId = refId;
        this.createdAt = Instant.now();
    }

    public SearchOutboxKind getKind() {
        return kind;
    }

    public UUID getRefId() {
        return refId;
    }
}
