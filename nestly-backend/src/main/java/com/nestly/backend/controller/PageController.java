package com.nestly.backend.controller;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.UUID;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nestly.backend.config.CurrentUser;
import com.nestly.backend.domain.Page;
import com.nestly.backend.domain.Section;
import com.nestly.backend.dto.PageResponse;
import com.nestly.backend.dto.SectionResponse;
import com.nestly.backend.dto.UpdateSectionDataRequest;
import com.nestly.backend.service.PageService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/agendas/{agendaId}/pages")
public class PageController {

    private final PageService pageService;

    public PageController(PageService pageService) {
        this.pageService = pageService;
    }

    @GetMapping("/by-date-range")
    public List<PageResponse> getByDateRange(
            @PathVariable UUID agendaId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam int count) {
        return pageService.getOrCreateRangeByDate(agendaId, CurrentUser.id(), from, count).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/by-number-range")
    public List<PageResponse> getByNumberRange(
            @PathVariable UUID agendaId,
            @RequestParam int from,
            @RequestParam int count) {
        return pageService.getOrCreateRangeByNumber(agendaId, CurrentUser.id(), from, count).stream()
                .map(this::toResponse)
                .toList();
    }

    @GetMapping("/days-with-content")
    public List<String> getDaysWithContent(
            @PathVariable UUID agendaId,
            @RequestParam @DateTimeFormat(pattern = "yyyy-MM") YearMonth month) {
        return pageService.getDaysWithContent(agendaId, CurrentUser.id(), month);
    }

    @PatchMapping("/{pageId}/sections/{sectionId}")
    public SectionResponse updateSection(
            @PathVariable UUID agendaId,
            @PathVariable UUID pageId,
            @PathVariable UUID sectionId,
            @Valid @RequestBody UpdateSectionDataRequest request) {
        Section section = pageService.updateSectionData(agendaId, pageId, sectionId, CurrentUser.id(), request.data());
        return new SectionResponse(section.getId(), section.getType().getValue(), section.getOrder(),
                section.getData());
    }

    private PageResponse toResponse(Page page) {
        List<SectionResponse> sections = pageService.getSections(page.getId()).stream()
                .map(s -> new SectionResponse(s.getId(), s.getType().getValue(), s.getOrder(), s.getData()))
                .toList();
        return new PageResponse(page.getId(), page.getPageDate(), page.getPageNumber(), sections);
    }
}
