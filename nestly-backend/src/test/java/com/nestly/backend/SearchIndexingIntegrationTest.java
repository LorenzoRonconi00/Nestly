package com.nestly.backend;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class SearchIndexingIntegrationTest extends SearchIntegrationTestBase {

    @Test
    void writtenTextBecomesSearchableInEverySectionAndIsMarkedAsOwnedByTheUser() throws Exception {
        Session user = registerAndLogin();
        Written written = writePage(user, "Visited the dentist this morning", "Buy rosemary");
        drain();

        String filter = filter(written.agendaId(), userId(user));
        awaitHits("dentist", filter, 1);
        awaitHits("rosemary", filter, 1);
        List<Map<String, Object>> hits = client.search("dentist", filter, 20);
        assertThat(hits.get(0)).containsEntry("id", written.pageId()).containsEntry("date", "2026-09-01");
    }

    @Test
    void searchToleratesTyposAndIgnoresAccents() throws Exception {
        Session user = registerAndLogin();
        Written written = writePage(user, "Passeggiata al lago con Zoe", "Comprare caffè");
        drain();

        String filter = filter(written.agendaId(), userId(user));
        awaitHits("pasegiata", filter, 1);
        awaitHits("caffe", filter, 1);
    }

    @Test
    void resultsAreFilteredByAgendaAndUser() throws Exception {
        Session first = registerAndLogin();
        Session second = registerAndLogin();
        Written firstPage = writePage(first, "Shared secret word zucchini", "Nothing");
        Written secondPage = writePage(second, "Another zucchini story", "Nothing");
        drain();

        awaitHits("zucchini", filter(firstPage.agendaId(), userId(first)), 1);
        awaitHits("zucchini", filter(secondPage.agendaId(), userId(second)), 1);
        assertThat(client.search("zucchini", filter(firstPage.agendaId(), userId(second)), 20)).isEmpty();
    }

    @Test
    void emptyingAPageRemovesItFromTheIndex() throws Exception {
        Session user = registerAndLogin();
        Written written = writePage(user, "Temporary thought about artichokes", "x");
        drain();
        String filter = filter(written.agendaId(), userId(user));
        awaitHits("artichokes", filter, 1);

        saveSection(user, written, written.freetextId(), "{\"text\":\"\"}");
        saveSection(user, written, written.checklistId(), "{\"items\":[]}");
        drain();

        awaitHits("artichokes", filter, 0);
    }

    @Test
    void removingASectionFromTheStructureUpdatesTheIndex() throws Exception {
        Session user = registerAndLogin();
        Written written = writePage(user, "Notes about the quince jam", "Buy lemons");
        drain();
        String filter = filter(written.agendaId(), userId(user));
        awaitHits("quince", filter, 1);

        mockMvc.perform(structureRequest(user, written.agendaId(), true, "checklist")).andExpect(status().isOk());
        drain();

        awaitHits("quince", filter, 0);
        awaitHits("lemons", filter, 1);
    }

    @Test
    void deletingAnAgendaRemovesItsPagesFromTheIndex() throws Exception {
        Session user = registerAndLogin();
        Written written = writePage(user, "Memories of the plum orchard", "x");
        drain();
        String filter = filter(written.agendaId(), userId(user));
        awaitHits("orchard", filter, 1);

        mockMvc.perform(authed(delete("/api/agendas/" + written.agendaId()), user)).andExpect(status().isNoContent());
        drain();

        awaitHits("orchard", filter, 0);
    }

    @Test
    void burstsOfEditsAreCoalescedAndTheQueueIsEmptied() throws Exception {
        Session user = registerAndLogin();
        Written written = writePage(user, "first", "x");
        for (String text : List.of("second", "third", "fourth edition of the text")) {
            saveSection(user, written, written.freetextId(), "{\"text\":\"" + text + "\"}");
        }

        drain();

        assertThat(outbox.count()).isZero();
        awaitHits("edition", filter(written.agendaId(), userId(user)), 1);
    }
}
