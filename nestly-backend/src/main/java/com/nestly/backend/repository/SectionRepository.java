package com.nestly.backend.repository;

import com.nestly.backend.domain.Section;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;
import java.util.Optional;

public interface SectionRepository extends JpaRepository<Section, UUID> {

    List<Section> findAllByPageIdOrderByOrderAsc(UUID pageId);

    Optional<Section> findByIdAndPageId(UUID id, UUID pageId);
}