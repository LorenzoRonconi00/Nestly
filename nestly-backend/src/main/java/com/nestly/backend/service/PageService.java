package com.nestly.backend.service;

import com.nestly.backend.domain.Agenda;
import com.nestly.backend.domain.BaseTemplate;
import com.nestly.backend.domain.Page;
import com.nestly.backend.domain.Section;
import com.nestly.backend.domain.SectionType;
import com.nestly.backend.repository.PageRepository;
import com.nestly.backend.repository.SectionRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PageService {

    private final PageRepository pageRepository;
    private final SectionRepository sectionRepository;
    private final AgendaService agendaService;

    public PageService(PageRepository pageRepository, SectionRepository sectionRepository,
            AgendaService agendaService) {
        this.pageRepository = pageRepository;
        this.sectionRepository = sectionRepository;
        this.agendaService = agendaService;
    }

    public Page getOrCreateByDate(UUID agendaId, UUID userId, LocalDate date) {
        Agenda agenda = agendaService.getForUser(agendaId, userId);
        if (agenda.getBaseTemplate() == BaseTemplate.NOTEBOOK) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Notebook agendas are addressed by page number, not date");
        }
        return pageRepository.findByAgendaIdAndPageDate(agenda.getId(), date)
                .orElseGet(() -> createPage(agenda, Page.forDate(agenda.getId(), date)));
    }

    public Page getOrCreateByNumber(UUID agendaId, UUID userId, int number) {
        Agenda agenda = agendaService.getForUser(agendaId, userId);
        if (agenda.getBaseTemplate() != BaseTemplate.NOTEBOOK) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Only notebook agendas are addressed by page number");
        }
        return pageRepository.findByAgendaIdAndPageNumber(agenda.getId(), number)
                .orElseGet(() -> createPage(agenda, Page.forNumber(agenda.getId(), number)));
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

    private Page createPage(Agenda agenda, Page page) {
        Page saved = pageRepository.save(page);
        List<Section> sections = agenda.getStructureTemplate().getActiveSections().stream()
                .map(config -> new Section(
                        saved.getId(),
                        SectionType.fromValue(config.getType()),
                        config.getOrder(),
                        config.getConfig()))
                .toList();
        sectionRepository.saveAll(sections);
        return saved;
    }
}