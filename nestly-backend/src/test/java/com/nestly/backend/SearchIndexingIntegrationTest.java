package com.nestly.backend;

import java.time.Duration;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.nestly.backend.repository.SearchOutboxRepository;
import com.nestly.backend.search.MeilisearchClient;
import com.nestly.backend.search.SearchIndexer;

class SearchIndexingIntegrationTest extends IntegrationTestBase {

    @Autowired
    private SearchIndexer indexer;

    @Autowired
    private MeilisearchClient client;

    @Autowired
    private SearchOutboxRepository outbox;

    @BeforeEach
    void prepareIndex() {
        indexer.ensureIndex();
    }

    private void drain() {
        while (indexer.processBatch() > 0) {
            // keep going until the queue is empty
        }
    }

    private String userId(Session session) throws Exception {
        MvcResult me = mockMvc.perform(authed(get("/api/auth/me"), session)).andExpect(status().isOk()).andReturn();
        return JsonPath.read(me.getResponse().getContentAsString(), "$.userId");
    }

    private String filter(String agendaId, String userId) {
        return "agendaId = \"" + agendaId + "\" AND userId = \"" + userId + "\"";
    }

    private record Written(String agendaId, String pageId, String freetextId, String checklistId) {

    }

    private Written writePage(Session session, String freetext, String checklistItem) throws Exception {
        String agendaId = createAgenda(session, "standard");
        setStructure(session, agendaId, "freetext", "checklist");
        MvcResult pages = mockMvc.perform(authed(
                get("/api/agendas/" + agendaId + "/pages/by-date-range?from=2026-09-01&count=1"), session))
                .andExpect(status().isOk())
                .andReturn();
        String body = pages.getResponse().getContentAsString();
        Written written = new Written(
                agendaId,
                JsonPath.read(body, "$[0].id"),
                JsonPath.read(body, "$[0].sections[0].id"),
                JsonPath.read(body, "$[0].sections[1].id"));
        saveSection(session, written, written.freetextId(), "{\"text\":\"" + freetext + "\"}");
        saveSection(session, written, written.checklistId(),
                "{\"items\":[{\"id\":\"1\",\"text\":\"" + checklistItem + "\",\"done\":false}]}");
        return written;
    }

    private void saveSection(Session session, Written written, String sectionId, String data) throws Exception {
        mockMvc.perform(authed(patch("/api/agendas/" + written.agendaId() + "/pages/" + written.pageId()
                + "/sections/" + sectionId), session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"data\":" + data + "}"))
                .andExpect(status().isOk());
    }

    private void awaitHits(String query, String filter, int expected) {
        await().atMost(Duration.ofSeconds(15)).pollInterval(Duration.ofMillis(200)).untilAsserted(()
                -> assertThat(client.search(query, filter, 20)).hasSize(expected));
    }

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
