package com.nestly.backend.repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nestly.backend.domain.Agenda;

public interface AgendaRepository extends JpaRepository<Agenda, UUID> {

    List<Agenda> findAllByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Agenda> findByIdAndUserId(UUID id, UUID userId);

    @Modifying
    @Query("delete from Agenda a where a.id = :id and a.userId = :userId")
    int deleteByIdAndUserId(@Param("id") UUID id, @Param("userId") UUID userId);
}
