package com.nestly.backend.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.nestly.backend.domain.Section;

public interface SectionRepository extends JpaRepository<Section, UUID> {

    List<Section> findAllByPageIdOrderByOrderAsc(UUID pageId);

    Optional<Section> findByIdAndPageId(UUID id, UUID pageId);

    @Query(value = """
            select s.type as "type", count(*) as "pageCount"
            from sections s
            join pages p on p.id = s.page_id
            where p.agenda_id = :agendaId
              and s.type not in (:keepTypes)
              and s.data <> cast('{}' as jsonb)
            group by s.type
            """, nativeQuery = true)
    List<SectionDataCount> countSectionsWithDataOutsideTypes(
            @Param("agendaId") UUID agendaId,
            @Param("keepTypes") Collection<String> keepTypes);

    @Modifying
    @Query(value = """
            delete from sections
            where type not in (:keepTypes)
              and page_id in (select id from pages where agenda_id = :agendaId)
            """, nativeQuery = true)
    int deleteOutsideTypes(
            @Param("agendaId") UUID agendaId,
            @Param("keepTypes") Collection<String> keepTypes);

    @Modifying
    @Query(value = """
            update sections set section_order = :sectionOrder
            where type = :type
              and page_id in (select id from pages where agenda_id = :agendaId)
            """, nativeQuery = true)
    int updateOrder(
            @Param("agendaId") UUID agendaId,
            @Param("type") String type,
            @Param("sectionOrder") int sectionOrder);

    @Modifying
    @Query(value = """
            insert into sections (id, page_id, type, section_order, data)
            select gen_random_uuid(), p.id, :type, :sectionOrder, cast('{}' as jsonb)
            from pages p
            where p.agenda_id = :agendaId
              and not exists (select 1 from sections s where s.page_id = p.id and s.type = :type)
            """, nativeQuery = true)
    int insertMissing(
            @Param("agendaId") UUID agendaId,
            @Param("type") String type,
            @Param("sectionOrder") int sectionOrder);
}
