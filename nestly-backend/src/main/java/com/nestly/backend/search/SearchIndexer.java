package com.nestly.backend.search;

import java.util.ArrayList;
import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.nestly.backend.domain.Agenda;
import com.nestly.backend.domain.Page;
import com.nestly.backend.domain.SearchOutboxEntry;
import com.nestly.backend.domain.Section;
import com.nestly.backend.repository.AgendaRepository;
import com.nestly.backend.repository.PageRepository;
import com.nestly.backend.repository.SearchOutboxRepository;
import com.nestly.backend.repository.SectionRepository;

@Service
public class SearchIndexer {

    public static final int BATCH_SIZE = 200;
    private static final int REINDEX_CHUNK = 500;

    private final SearchOutboxRepository outbox;
    private final PageRepository pages;
    private final SectionRepository sections;
    private final AgendaRepository agendas;
    private final PageDocumentFactory documentFactory;
    private final MeilisearchClient client;
    private volatile boolean indexReady;

    public SearchIndexer(
            SearchOutboxRepository outbox,
            PageRepository pages,
            SectionRepository sections,
            AgendaRepository agendas,
            PageDocumentFactory documentFactory,
            MeilisearchClient client) {
        this.outbox = outbox;
        this.pages = pages;
        this.sections = sections;
        this.agendas = agendas;
        this.documentFactory = documentFactory;
        this.client = client;
    }

    public synchronized void ensureIndex() {
        if (indexReady) {
            return;
        }
        if (!client.indexExists()) {
            client.createIndex();
        }
        client.configureIndex();
        if (client.documentCount() == 0) {
            reindexAll();
        }
        indexReady = true;
    }

    public void reindexAll() {
        int chunk = 0;
        List<UUID> ids;
        do {
            ids = pages.findAllIds(PageRequest.of(chunk++, REINDEX_CHUNK));
            index(ids);
        } while (ids.size() == REINDEX_CHUNK);
    }

    @Transactional
    public int processBatch() {
        List<SearchOutboxEntry> batch = outbox.claimBatch(BATCH_SIZE);
        if (batch.isEmpty()) {
            return 0;
        }

        Set<UUID> pageIds = new LinkedHashSet<>();
        Set<UUID> deletedAgendas = new LinkedHashSet<>();
        for (SearchOutboxEntry entry : batch) {
            switch (entry.getKind()) {
                case UPSERT_PAGE ->
                    pageIds.add(entry.getRefId());
                case UPSERT_AGENDA ->
                    pageIds.addAll(pages.findIdsByAgendaId(entry.getRefId()));
                case DELETE_AGENDA ->
                    deletedAgendas.add(entry.getRefId());
            }
        }

        index(pageIds);
        deletedAgendas.forEach(agendaId -> client.deleteByFilter("agendaId = \"" + agendaId + "\""));
        outbox.deleteAllInBatch(batch);
        return batch.size();
    }

    private void index(Collection<UUID> pageIds) {
        if (pageIds.isEmpty()) {
            return;
        }

        Map<UUID, Page> pageById = pages.findAllById(pageIds).stream()
                .collect(Collectors.toMap(Page::getId, Function.identity()));
        Set<UUID> agendaIds = pageById.values().stream().map(Page::getAgendaId).collect(Collectors.toSet());
        Map<UUID, Agenda> agendaById = agendas.findAllById(agendaIds).stream()
                .collect(Collectors.toMap(Agenda::getId, Function.identity()));
        Map<UUID, List<Section>> sectionsByPage = sections.findAllByPageIdIn(pageById.keySet()).stream()
                .collect(Collectors.groupingBy(Section::getPageId));

        List<Map<String, Object>> upserts = new ArrayList<>();
        List<String> deletions = new ArrayList<>();
        for (UUID pageId : pageIds) {
            Page page = pageById.get(pageId);
            Agenda agenda = page == null ? null : agendaById.get(page.getAgendaId());
            Optional<Map<String, Object>> document = agenda == null
                    ? Optional.empty()
                    : documentFactory.build(page, agenda, sectionsByPage.getOrDefault(pageId, List.of()));
            if (document.isPresent()) {
                upserts.add(document.get());
            } else {
                deletions.add(pageId.toString());
            }
        }
        client.addDocuments(upserts);
        client.deleteDocuments(deletions);
    }
}
