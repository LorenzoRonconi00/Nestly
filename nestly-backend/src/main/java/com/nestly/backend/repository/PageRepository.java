package com.nestly.backend.repository;

import com.nestly.backend.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;

public interface PageRepository extends JpaRepository<Page, UUID> {

    Optional<Page> findByAgendaIdAndPageDate(UUID agendaId, LocalDate pageDate);

    Optional<Page> findByAgendaIdAndPageNumber(UUID agendaId, Integer pageNumber);
}