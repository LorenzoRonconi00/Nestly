package com.nestly.backend.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "pages")
public class Page {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "agenda_id", nullable = false)
    private UUID agendaId;

    @Column(name = "page_date")
    private LocalDate pageDate;

    @Column(name = "page_number")
    private Integer pageNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    protected Page() {
    }

    private Page(UUID agendaId, LocalDate pageDate, Integer pageNumber) {
        this.agendaId = agendaId;
        this.pageDate = pageDate;
        this.pageNumber = pageNumber;
        this.createdAt = Instant.now();
    }

    public static Page forDate(UUID agendaId, LocalDate date) {
        return new Page(agendaId, date, null);
    }

    public static Page forNumber(UUID agendaId, int number) {
        return new Page(agendaId, null, number);
    }

    public UUID getId() {
        return id;
    }

    public UUID getAgendaId() {
        return agendaId;
    }

    public LocalDate getPageDate() {
        return pageDate;
    }

    public Integer getPageNumber() {
        return pageNumber;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}