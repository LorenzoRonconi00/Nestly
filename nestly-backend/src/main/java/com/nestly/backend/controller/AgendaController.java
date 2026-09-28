package com.nestly.backend.controller;

import com.nestly.backend.config.CurrentUser;
import com.nestly.backend.domain.Agenda;
import com.nestly.backend.domain.StructureTemplate;
import com.nestly.backend.dto.AgendaResponse;
import com.nestly.backend.dto.CreateAgendaRequest;
import com.nestly.backend.dto.UpdateStructureTemplateRequest;
import com.nestly.backend.service.AgendaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/agendas")
public class AgendaController {

    private final AgendaService agendaService;

    public AgendaController(AgendaService agendaService) {
        this.agendaService = agendaService;
    }

    @PostMapping
    public ResponseEntity<AgendaResponse> create(@Valid @RequestBody CreateAgendaRequest request) {
        Agenda agenda = agendaService.create(CurrentUser.id(), request.name(), request.baseTemplate());
        return ResponseEntity.status(HttpStatus.CREATED).body(toResponse(agenda));
    }

    @GetMapping
    public List<AgendaResponse> list() {
        return agendaService.listForUser(CurrentUser.id()).stream()
                .map(AgendaController::toResponse)
                .toList();
    }

    @GetMapping("/{id}")
    public AgendaResponse get(@PathVariable UUID id) {
        return toResponse(agendaService.getForUser(id, CurrentUser.id()));
    }

    @PatchMapping("/{id}/structure-template")
    public AgendaResponse updateStructureTemplate(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateStructureTemplateRequest request) {
        StructureTemplate template = new StructureTemplate();
        template.setActiveSections(request.sections().stream()
                .map(item -> {
                    StructureTemplate.SectionConfig config = new StructureTemplate.SectionConfig();
                    config.setType(item.type());
                    config.setOrder(item.order());
                    config.setConfig(Map.of());
                    return config;
                })
                .toList());
        Agenda agenda = agendaService.updateStructureTemplate(id, CurrentUser.id(), template);
        return toResponse(agenda);
    }

    private static AgendaResponse toResponse(Agenda agenda) {
        List<AgendaResponse.SectionTemplateItem> sections = agenda.getStructureTemplate().getActiveSections().stream()
                .map(s -> new AgendaResponse.SectionTemplateItem(s.getType(), s.getOrder()))
                .toList();
        return new AgendaResponse(
                agenda.getId(),
                agenda.getName(),
                agenda.getBaseTemplate().getValue(),
                agenda.getCoverTheme(),
                sections,
                agenda.getCreatedAt());
    }
}