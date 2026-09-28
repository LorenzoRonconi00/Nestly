package com.nestly.backend.controller;

import com.nestly.backend.config.CurrentUser;
import com.nestly.backend.domain.Page;
import com.nestly.backend.dto.PageResponse;
import com.nestly.backend.dto.SectionResponse;
import com.nestly.backend.service.PageService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/agendas/{agendaId}/pages")
public class PageController {

    private final PageService pageService;

    public PageController(PageService pageService) {
        this.pageService = pageService;
    }

    @GetMapping("/by-date/{date}")
    public PageResponse getByDate(@PathVariable UUID agendaId, @PathVariable LocalDate date) {
        return toResponse(pageService.getOrCreateByDate(agendaId, CurrentUser.id(), date));
    }

    @GetMapping("/by-number/{number}")
    public PageResponse getByNumber(@PathVariable UUID agendaId, @PathVariable int number) {
        return toResponse(pageService.getOrCreateByNumber(agendaId, CurrentUser.id(), number));
    }

    private PageResponse toResponse(Page page) {
        List<SectionResponse> sections = pageService.getSections(page.getId()).stream()
                .map(s -> new SectionResponse(s.getId(), s.getType().getValue(), s.getOrder(), s.getData()))
                .toList();
        return new PageResponse(page.getId(), page.getPageDate(), page.getPageNumber(), sections);
    }
}