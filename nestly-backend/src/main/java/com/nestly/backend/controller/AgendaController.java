package com.nestly.backend.controller;

import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.nestly.backend.config.CurrentUser;
import com.nestly.backend.domain.Agenda;
import com.nestly.backend.dto.AgendaResponse;
import com.nestly.backend.dto.CreateAgendaRequest;
import com.nestly.backend.dto.DataLossResponse;
import com.nestly.backend.dto.UpdateStructureTemplateRequest;
import com.nestly.backend.service.AgendaService;
import com.nestly.backend.service.DataLossConfirmationRequiredException;
import com.nestly.backend.service.StructureTemplateService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/agendas")
public class AgendaController {

    private final AgendaService agendaService;
    private final StructureTemplateService structureTemplateService;

    public AgendaController(AgendaService agendaService, StructureTemplateService structureTemplateService) {
        this.agendaService = agendaService;
        this.structureTemplateService = structureTemplateService;
    }

    @PostMapping
    public ResponseEntity<AgendaResponse> create(@Valid @RequestBody CreateAgendaRequest request) {
        Agenda agenda = agendaService.create(CurrentUser.id(), request.name(), request.baseTemplate(), request.coverTheme());
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
        List<String> orderedTypes = request.sections().stream()
                .sorted(Comparator.comparingInt(UpdateStructureTemplateRequest.SectionItem::order))
                .map(UpdateStructureTemplateRequest.SectionItem::type)
                .toList();
        Agenda agenda = structureTemplateService.update(
                id, CurrentUser.id(), orderedTypes, Boolean.TRUE.equals(request.confirmDataLoss()));
        return toResponse(agenda);
    }

    @ExceptionHandler(DataLossConfirmationRequiredException.class)
    public ResponseEntity<DataLossResponse> handleDataLoss(DataLossConfirmationRequiredException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT).body(new DataLossResponse(
                ex.getLosses().stream()
                        .map(loss -> new DataLossResponse.Item(loss.type(), loss.pageCount()))
                        .toList()));
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
