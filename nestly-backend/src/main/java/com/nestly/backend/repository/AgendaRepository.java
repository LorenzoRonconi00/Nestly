package com.nestly.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.nestly.backend.domain.Agenda;

public interface AgendaRepository extends JpaRepository<Agenda, UUID> {

    List<Agenda> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Agenda> findByIdAndUserId(UUID id, UUID userId);
}