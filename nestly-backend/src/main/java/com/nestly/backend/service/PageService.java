package com.nestly.backend.service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.IntStream;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nestly.backend.domain.Agenda;
import com.nestly.backend.domain.BaseTemplate;
import com.nestly.backend.domain.Page;
import com.nestly.backend.domain.Section;
import com.nestly.backend.domain.SectionType;
import com.nestly.backend.repository.PageRepository;
import com.nestly.backend.repository.SectionRepository;

@Service
public class PageService {

    private static final int MAX_RANGE = 7;

    private final PageRepository pageRepository;
    private final SectionRepository sectionRepository;
    private final AgendaService agendaService;

    public PageService(PageRepository pageRepository, SectionRepository sectionRepository,
            AgendaService agendaService) {
        this.pageRepository = pageRepository;
        this.sectionRepository = sectionRepository;
        this.agendaService = agendaService;
    }

    @Transactional
    public Page getOrCreateByDate(UUID agendaId, UUID userId, LocalDate date) {
        return getOrCreateForDate(dateAgenda(agendaId, userId), date);
    }

    @Transactional
    public Page getOrCreateByNumber(UUID agendaId, UUID userId, int number) {
        return getOrCreateForNumber(numberAgenda(agendaId, userId), number);
    }

    @Transactional
    public List<Page> getOrCreateRangeByDate(UUID agendaId, UUID userId, LocalDate from, int count) {
        validateCount(count);
        Agenda agenda = dateAgenda(agendaId, userId);
        return IntStream.range(0, count)
                .mapToObj(offset -> getOrCreateForDate(agenda, from.plusDays(offset)))
                .toList();
    }

    @Transactional
    public List<Page> getOrCreateRangeByNumber(UUID agendaId, UUID userId, int from, int count) {
        validateCount(count);
        if (from < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Page numbers start at 1");
        }
        Agenda agenda = numberAgenda(agendaId, userId);
        return IntStream.range(0, count)
                .mapToObj(offset -> getOrCreateForNumber(agenda, from + offset))
                .toList();
    }

    public List<Section> getSections(UUID pageId) {
        return sectionRepository.findAllByPageIdOrderByOrderAsc(pageId);
    }

    public Section updateSectionData(UUID agendaId, UUID pageId, UUID sectionId, UUID userId,
            Map<String, Object> data) {
        Agenda agenda = agendaService.getForUser(agendaId, userId);
        Page page = pageRepository.findByIdAndAgendaId(pageId, agenda.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Page not found"));
        Section section = sectionRepository.findByIdAndPageId(sectionId, page.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Section not found"));
        section.setData(data);
        return sectionRepository.save(section);
    }

    public List<String> getDaysWithContent(UUID agendaId, UUID userId, YearMonth month) {
        Agenda agenda = dateAgenda(agendaId, userId);
        return sectionRepository.findDaysWithContent(agenda.getId(), month.atDay(1), month.plusMonths(1).atDay(1));
    }

    private Agenda dateAgenda(UUID agendaId, UUID userId) {
        Agenda agenda = agendaService.getForUser(agendaId, userId);
        if (agenda.getBaseTemplate() == BaseTemplate.NOTEBOOK) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Notebook agendas are addressed by page number, not date");
        }
        return agenda;
    }

    private Agenda numberAgenda(UUID agendaId, UUID userId) {
        Agenda agenda = agendaService.getForUser(agendaId, userId);
        if (agenda.getBaseTemplate() != BaseTemplate.NOTEBOOK) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only notebook agendas are addressed by page number");
        }
        return agenda;
    }

    private void validateCount(int count) {
        if (count < 1 || count > MAX_RANGE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Count must be between 1 and " + MAX_RANGE);
        }
    }

    private Page getOrCreateForDate(Agenda agenda, LocalDate date) {
        Optional<Page> existing = pageRepository.findByAgendaIdAndPageDate(agenda.getId(), date);
        if (existing.isPresent()) {
            return existing.get();
        }
        boolean created = pageRepository.insertDatePageIfAbsent(agenda.getId(), date) == 1;
        Page page = pageRepository.findByAgendaIdAndPageDate(agenda.getId(), date)
                .orElseThrow(() -> new IllegalStateException("Page missing after insert"));
        if (created) {
            createSections(agenda, page);
        }
        return page;
    }

    private Page getOrCreateForNumber(Agenda agenda, int number) {
        Optional<Page> existing = pageRepository.findByAgendaIdAndPageNumber(agenda.getId(), number);
        if (existing.isPresent()) {
            return existing.get();
        }
        boolean created = pageRepository.insertNumberPageIfAbsent(agenda.getId(), number) == 1;
        Page page = pageRepository.findByAgendaIdAndPageNumber(agenda.getId(), number)
                .orElseThrow(() -> new IllegalStateException("Page missing after insert"));
        if (created) {
            createSections(agenda, page);
        }
        return page;
    }

    private void createSections(Agenda agenda, Page page) {
        List<Section> sections = agenda.getStructureTemplate().getActiveSections().stream()
                .map(config -> new Section(
                page.getId(),
                SectionType.fromValue(config.getType()),
                config.getOrder(),
                config.getConfig()))
                .toList();
        sectionRepository.saveAll(sections);
    }
}
