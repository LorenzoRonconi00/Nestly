package com.nestly.backend.controller;

import java.util.List;
import java.util.UUID;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nestly.backend.config.CurrentUser;
import com.nestly.backend.dto.SearchHitResponse;
import com.nestly.backend.search.SearchService;

@RestController
@RequestMapping("/api/agendas/{agendaId}/search")
public class SearchController {

    private final SearchService searchService;

    public SearchController(SearchService searchService) {
        this.searchService = searchService;
    }

    @GetMapping
    public List<SearchHitResponse> search(@PathVariable UUID agendaId, @RequestParam("q") String query) {
        return searchService.search(agendaId, CurrentUser.id(), query);
    }
}
