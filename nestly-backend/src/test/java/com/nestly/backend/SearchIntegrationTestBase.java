package com.nestly.backend;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import com.nestly.backend.repository.SearchOutboxRepository;
import com.nestly.backend.search.MeilisearchClient;
import com.nestly.backend.search.SearchIndexer;

public abstract class SearchIntegrationTestBase extends IntegrationTestBase {

    @Autowired
    protected SearchIndexer indexer;

    @Autowired
    protected MeilisearchClient client;

    @Autowired
    protected SearchOutboxRepository outbox;

    @BeforeEach
    void prepareIndex() {
        indexer.ensureIndex();
    }

    protected void drain() {
        while (indexer.processBatch() > 0) {
            // keep going until the queue is empty
        }
    }

    protected String userId(Session session) throws Exception {
        MvcResult me = mockMvc.perform(authed(get("/api/auth/me"), session)).andExpect(status().isOk()).andReturn();
        return JsonPath.read(me.getResponse().getContentAsString(), "$.userId");
    }

    protected String filter(String agendaId, String userId) {
        return "agendaId = \"" + agendaId + "\" AND userId = \"" + userId + "\"";
    }

    protected record Written(String agendaId, String pageId, String freetextId, String checklistId) {

    }

    protected Written writePage(Session session, String freetext, String checklistItem) throws Exception {
        String agendaId = createAgenda(session, "standard");
        return writePage(session, agendaId, "2026-09-01", freetext, checklistItem);
    }

    protected Written writePage(Session session, String agendaId, String date, String freetext,
            String checklistItem) throws Exception {
        setStructure(session, agendaId, "freetext", "checklist");
        MvcResult pages = mockMvc.perform(authed(
                get("/api/agendas/" + agendaId + "/pages/by-date-range?from=" + date + "&count=1"), session))
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

    protected void saveSection(Session session, Written written, String sectionId, String data) throws Exception {
        mockMvc.perform(authed(patch("/api/agendas/" + written.agendaId() + "/pages/" + written.pageId()
                + "/sections/" + sectionId), session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"data\":" + data + "}"))
                .andExpect(status().isOk());
    }

    protected void awaitHits(String query, String filter, int expected) {
        await().atMost(Duration.ofSeconds(15)).pollInterval(Duration.ofMillis(200)).untilAsserted(()
                -> assertThat(client.search(query, filter, 20)).hasSize(expected));
    }
}
