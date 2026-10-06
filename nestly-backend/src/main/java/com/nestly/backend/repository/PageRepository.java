package com.nestly.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nestly.backend.domain.Page;

public interface PageRepository extends JpaRepository<Page, UUID> {

    Optional<Page> findByAgendaIdAndPageDate(UUID agendaId, LocalDate pageDate);

    Optional<Page> findByAgendaIdAndPageNumber(UUID agendaId, Integer pageNumber);

    Optional<Page> findByIdAndAgendaId(UUID id, UUID agendaId);

    @Modifying
    @Query(value = """
            insert into pages (id, agenda_id, page_date, created_at)
            values (gen_random_uuid(), :agendaId, :pageDate, now())
            on conflict do nothing
            """, nativeQuery = true)
    int insertDatePageIfAbsent(@Param("agendaId") UUID agendaId, @Param("pageDate") LocalDate pageDate);

    @Modifying
    @Query(value = """
            insert into pages (id, agenda_id, page_number, created_at)
            values (gen_random_uuid(), :agendaId, :pageNumber, now())
            on conflict do nothing
            """, nativeQuery = true)
    int insertNumberPageIfAbsent(@Param("agendaId") UUID agendaId, @Param("pageNumber") int pageNumber);

    @Query("select p.id from Page p where p.agendaId = :agendaId")
    List<UUID> findIdsByAgendaId(@Param("agendaId") UUID agendaId);

    @Query("select p.id from Page p order by p.id")
    List<UUID> findAllIds(Pageable pageable);
}
