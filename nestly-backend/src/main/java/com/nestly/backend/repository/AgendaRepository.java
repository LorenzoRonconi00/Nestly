package com.nestly.backend.repository;

import com.nestly.backend.domain.Agenda;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface AgendaRepository extends JpaRepository<Agenda, UUID> {

    List<Agenda> findAllByUserId(UUID userId);

    Optional<Agenda> findByIdAndUserId(UUID id, UUID userId);
}