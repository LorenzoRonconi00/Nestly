package com.nestly.backend.service;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.nestly.backend.domain.Agenda;
import com.nestly.backend.domain.BaseTemplate;
import com.nestly.backend.domain.StructureTemplate;
import com.nestly.backend.repository.AgendaRepository;

@Service
public class AgendaService {

    private final AgendaRepository agendaRepository;

    public AgendaService(AgendaRepository agendaRepository) {
        this.agendaRepository = agendaRepository;
    }

    public Agenda create(UUID userId, String name, String baseTemplateValue, String coverTheme) {
        BaseTemplate baseTemplate = BaseTemplate.fromValue(baseTemplateValue);
        Agenda agenda = new Agenda(userId, name, baseTemplate, new StructureTemplate(), coverTheme);
        return agendaRepository.save(agenda);
    }

    public Agenda updateStructureTemplate(UUID id, UUID userId, StructureTemplate structureTemplate) {
        Agenda agenda = getForUser(id, userId);
        agenda.setStructureTemplate(structureTemplate);
        return agendaRepository.save(agenda);
    }

    public List<Agenda> listForUser(UUID userId) {
        return agendaRepository.findAllByUserIdOrderByCreatedAtDesc(userId);
    }

    public Agenda getForUser(UUID id, UUID userId) {
        return agendaRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Agenda not found"));
    }
}
