package com.nestly.backend.search;

import java.util.UUID;

import org.springframework.stereotype.Service;

import com.nestly.backend.domain.SearchOutboxEntry;
import com.nestly.backend.domain.SearchOutboxKind;
import com.nestly.backend.repository.SearchOutboxRepository;

@Service
public class SearchOutboxService {

    private final SearchOutboxRepository repository;

    public SearchOutboxService(SearchOutboxRepository repository) {
        this.repository = repository;
    }

    public void pageChanged(UUID pageId) {
        repository.save(new SearchOutboxEntry(SearchOutboxKind.UPSERT_PAGE, pageId));
    }

    public void agendaChanged(UUID agendaId) {
        repository.save(new SearchOutboxEntry(SearchOutboxKind.UPSERT_AGENDA, agendaId));
    }

    public void agendaDeleted(UUID agendaId) {
        repository.save(new SearchOutboxEntry(SearchOutboxKind.DELETE_AGENDA, agendaId));
    }
}
