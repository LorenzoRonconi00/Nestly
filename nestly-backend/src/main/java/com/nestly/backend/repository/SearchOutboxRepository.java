package com.nestly.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nestly.backend.domain.SearchOutboxEntry;

public interface SearchOutboxRepository extends JpaRepository<SearchOutboxEntry, Long> {

    @Query(value = "select * from search_outbox order by id limit :limit for update skip locked", nativeQuery = true)
    List<SearchOutboxEntry> claimBatch(@Param("limit") int limit);
}
