package com.nestly.backend.service;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.nestly.backend.domain.Agenda;
import com.nestly.backend.domain.StructureTemplate;
import com.nestly.backend.repository.SectionDataCount;
import com.nestly.backend.repository.SectionRepository;
import com.nestly.backend.search.SearchOutboxService;

@Service
public class StructureTemplateService {

    private final AgendaService agendaService;
    private final SearchOutboxService searchOutbox;
    private final SectionRepository sectionRepository;

    public StructureTemplateService(AgendaService agendaService, SearchOutboxService searchOutbox, SectionRepository sectionRepository) {
        this.agendaService = agendaService;
        this.searchOutbox = searchOutbox;
        this.sectionRepository = sectionRepository;
    }

    @Transactional
    public Agenda update(UUID agendaId, UUID userId, List<String> orderedTypes, boolean confirmDataLoss) {
        if (new HashSet<>(orderedTypes).size() != orderedTypes.size()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Duplicate section types");
        }
        Agenda agenda = agendaService.getForUser(agendaId, userId);

        if (!confirmDataLoss) {
            List<SectionDataCount> losses
                    = sectionRepository.countSectionsWithDataOutsideTypes(agenda.getId(), orderedTypes);
            if (!losses.isEmpty()) {
                throw new DataLossConfirmationRequiredException(losses.stream()
                        .map(loss -> new DataLossConfirmationRequiredException.Loss(loss.getType(), loss.getPageCount()))
                        .toList());
            }
        }

        sectionRepository.deleteOutsideTypes(agenda.getId(), orderedTypes);
        for (int index = 0; index < orderedTypes.size(); index++) {
            String type = orderedTypes.get(index);
            int order = index + 1;
            sectionRepository.updateOrder(agenda.getId(), type, order);
            sectionRepository.insertMissing(agenda.getId(), type, order);
        }
        searchOutbox.agendaChanged(agenda.getId());
        return agendaService.updateStructureTemplate(agenda.getId(), userId, buildTemplate(orderedTypes));
    }

    private static StructureTemplate buildTemplate(List<String> orderedTypes) {
        StructureTemplate template = new StructureTemplate();
        template.setActiveSections(java.util.stream.IntStream.range(0, orderedTypes.size())
                .mapToObj(index -> {
                    StructureTemplate.SectionConfig config = new StructureTemplate.SectionConfig();
                    config.setType(orderedTypes.get(index));
                    config.setOrder(index + 1);
                    config.setConfig(Map.of());
                    return config;
                })
                .toList());
        return template;
    }
}
