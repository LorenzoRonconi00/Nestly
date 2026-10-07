package com.nestly.backend;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;

class PageStructureIntegrationTest extends IntegrationTestBase {

    private static String dateRange(String agendaId, String from, int count) {
        return "/api/agendas/" + agendaId + "/pages/by-date-range?from=" + from + "&count=" + count;
    }

    private static String sectionPath(String agendaId, String pageId, String sectionId) {
        return "/api/agendas/" + agendaId + "/pages/" + pageId + "/sections/" + sectionId;
    }

    @Test
    void rangeCreatesPagesWithTemplateSectionsAndIsIdempotent() throws Exception {
        Session user = registerAndLogin();
        String agendaId = createAgenda(user, "standard");
        setStructure(user, agendaId, "freetext", "checklist");
        String range = dateRange(agendaId, "2026-05-01", 3);

        MvcResult first = mockMvc.perform(authed(get(range), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(3))
                .andExpect(jsonPath("$[0].date").value("2026-05-01"))
                .andExpect(jsonPath("$[2].date").value("2026-05-03"))
                .andExpect(jsonPath("$[0].sections.length()").value(2))
                .andExpect(jsonPath("$[0].sections[0].type").value("freetext"))
                .andExpect(jsonPath("$[0].sections[1].type").value("checklist"))
                .andReturn();
        MvcResult second = mockMvc.perform(authed(get(range), user)).andExpect(status().isOk()).andReturn();

        List<String> firstIds = JsonPath.read(first.getResponse().getContentAsString(), "$[*].id");
        List<String> secondIds = JsonPath.read(second.getResponse().getContentAsString(), "$[*].id");
        assertThat(secondIds).containsExactlyElementsOf(firstIds);
    }

    @Test
    void rangeRequestsAreValidated() throws Exception {
        Session user = registerAndLogin();
        String standardId = createAgenda(user, "standard");
        String notebookId = createAgenda(user, "notebook");

        mockMvc.perform(authed(get(dateRange(standardId, "2026-05-01", 0)), user)).andExpect(status().isBadRequest());
        mockMvc.perform(authed(get(dateRange(standardId, "2026-05-01", 8)), user)).andExpect(status().isBadRequest());
        mockMvc.perform(authed(get(dateRange(notebookId, "2026-05-01", 2)), user)).andExpect(status().isBadRequest());
        mockMvc.perform(authed(get("/api/agendas/" + standardId + "/pages/by-number-range?from=1&count=2"), user))
                .andExpect(status().isBadRequest());
        mockMvc.perform(authed(get("/api/agendas/" + notebookId + "/pages/by-number-range?from=0&count=2"), user))
                .andExpect(status().isBadRequest());
        mockMvc.perform(authed(get("/api/agendas/" + standardId + "/pages/days-with-content?month=2026-13"), user))
                .andExpect(status().isBadRequest());
    }

    @Test
    void pageNumbersAreLimitedToTheSupportedRange() throws Exception {
        Session user = registerAndLogin();
        String notebookId = createAgenda(user, "notebook");
        setStructure(user, notebookId, "freetext");
        String base = "/api/agendas/" + notebookId + "/pages/by-number-range";

        mockMvc.perform(authed(get(base + "?from=1&count=2"), user)).andExpect(status().isOk());
        mockMvc.perform(authed(get(base + "?from=9999&count=2"), user)).andExpect(status().isOk());
        mockMvc.perform(authed(get(base + "?from=10000&count=2"), user)).andExpect(status().isBadRequest());
        mockMvc.perform(authed(get(base + "?from=10001&count=1"), user)).andExpect(status().isBadRequest());
        mockMvc.perform(authed(get(base + "?from=-5&count=1"), user)).andExpect(status().isBadRequest());
        mockMvc.perform(authed(get(base + "?from=2147483647&count=2"), user)).andExpect(status().isBadRequest());
    }

    @Test
    void datesAreLimitedToTheSupportedRange() throws Exception {
        Session user = registerAndLogin();
        String agendaId = createAgenda(user, "standard");
        setStructure(user, agendaId, "freetext");

        mockMvc.perform(authed(get(dateRange(agendaId, "1900-01-01", 2)), user)).andExpect(status().isOk());
        mockMvc.perform(authed(get(dateRange(agendaId, "2200-12-30", 2)), user)).andExpect(status().isOk());
        mockMvc.perform(authed(get(dateRange(agendaId, "1899-12-31", 1)), user)).andExpect(status().isBadRequest());
        mockMvc.perform(authed(get(dateRange(agendaId, "2200-12-31", 2)), user)).andExpect(status().isBadRequest());
        mockMvc.perform(authed(get(dateRange(agendaId, "2201-01-01", 1)), user)).andExpect(status().isBadRequest());
        mockMvc.perform(authed(get(dateRange(agendaId, "9999-12-31", 1)), user)).andExpect(status().isBadRequest());
    }

    @Test
    void notebookPagesAreAddressedByNumber() throws Exception {
        Session user = registerAndLogin();
        String notebookId = createAgenda(user, "notebook");
        setStructure(user, notebookId, "freetext");

        mockMvc.perform(authed(get("/api/agendas/" + notebookId + "/pages/by-number-range?from=3&count=2"), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].pageNumber").value(3))
                .andExpect(jsonPath("$[1].pageNumber").value(4))
                .andExpect(jsonPath("$[0].sections.length()").value(1));
    }

    @Test
    void structureChangesAreRetroactiveAndProtectExistingData() throws Exception {
        Session user = registerAndLogin();
        String agendaId = createAgenda(user, "standard");
        setStructure(user, agendaId, "freetext", "checklist", "mood");
        String range = dateRange(agendaId, "2026-06-01", 2);

        MvcResult pages = mockMvc.perform(authed(get(range), user)).andExpect(status().isOk()).andReturn();
        String body = pages.getResponse().getContentAsString();
        String pageId = JsonPath.read(body, "$[0].id");
        String freetextId = JsonPath.read(body, "$[0].sections[0].id");
        mockMvc.perform(authed(patch(sectionPath(agendaId, pageId, freetextId)), user)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"data\":{\"text\":\"hello\"}}"))
                .andExpect(status().isOk());

        mockMvc.perform(structureRequest(user, agendaId, false, "checklist", "mood"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.sections[0].type").value("freetext"))
                .andExpect(jsonPath("$.sections[0].pageCount").value(1));
        mockMvc.perform(authed(get(range), user)).andExpect(jsonPath("$[0].sections.length()").value(3));

        mockMvc.perform(structureRequest(user, agendaId, false, "freetext", "checklist"))
                .andExpect(status().isOk());
        mockMvc.perform(authed(get(range), user))
                .andExpect(jsonPath("$[0].sections.length()").value(2))
                .andExpect(jsonPath("$[1].sections.length()").value(2));

        mockMvc.perform(structureRequest(user, agendaId, true, "checklist")).andExpect(status().isOk());
        mockMvc.perform(authed(get(range), user))
                .andExpect(jsonPath("$[0].sections.length()").value(1))
                .andExpect(jsonPath("$[0].sections[0].type").value("checklist"));

        setStructure(user, agendaId, "mood", "checklist");
        mockMvc.perform(authed(get(range), user))
                .andExpect(jsonPath("$[0].sections[0].type").value("mood"))
                .andExpect(jsonPath("$[1].sections[0].type").value("mood"))
                .andExpect(jsonPath("$[1].sections[1].type").value("checklist"));
    }

    @Test
    void duplicateSectionTypesAreRejected() throws Exception {
        Session user = registerAndLogin();
        String agendaId = createAgenda(user, "standard");

        mockMvc.perform(structureRequest(user, agendaId, true, "mood", "mood")).andExpect(status().isBadRequest());
    }

    @Test
    void daysWithContentListsOnlyDaysThatHoldData() throws Exception {
        Session user = registerAndLogin();
        String agendaId = createAgenda(user, "standard");
        setStructure(user, agendaId, "freetext");
        String daysUrl = "/api/agendas/" + agendaId + "/pages/days-with-content?month=2026-07";

        MvcResult pages = mockMvc.perform(authed(get(dateRange(agendaId, "2026-07-10", 2)), user))
                .andExpect(status().isOk())
                .andReturn();
        mockMvc.perform(authed(get(daysUrl), user)).andExpect(jsonPath("$.length()").value(0));

        String body = pages.getResponse().getContentAsString();
        String pageId = JsonPath.read(body, "$[1].id");
        String sectionId = JsonPath.read(body, "$[1].sections[0].id");
        mockMvc.perform(authed(patch(sectionPath(agendaId, pageId, sectionId)), user)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"data\":{\"text\":\"written\"}}"))
                .andExpect(status().isOk());

        mockMvc.perform(authed(get(daysUrl), user))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0]").value("2026-07-11"));
    }

    @Test
    void anotherUserCannotUpdateSections() throws Exception {
        Session owner = registerAndLogin();
        Session intruder = registerAndLogin();
        String agendaId = createAgenda(owner, "standard");
        setStructure(owner, agendaId, "freetext");

        MvcResult pages = mockMvc.perform(authed(get(dateRange(agendaId, "2026-08-01", 1)), owner))
                .andExpect(status().isOk())
                .andReturn();
        String body = pages.getResponse().getContentAsString();
        String pageId = JsonPath.read(body, "$[0].id");
        String sectionId = JsonPath.read(body, "$[0].sections[0].id");

        mockMvc.perform(authed(patch(sectionPath(agendaId, pageId, sectionId)), intruder)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"data\":{\"text\":\"hijacked\"}}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void concurrentRangeRequestsCreateEachPageOnce() throws Exception {
        Session user = registerAndLogin();
        String agendaId = createAgenda(user, "standard");
        setStructure(user, agendaId, "freetext", "mood");
        String range = dateRange(agendaId, "2027-01-10", 4);

        int threads = 6;
        ExecutorService pool = Executors.newFixedThreadPool(threads);
        CountDownLatch start = new CountDownLatch(1);
        List<Future<String>> results = new ArrayList<>();
        for (int index = 0; index < threads; index++) {
            results.add(pool.submit(() -> {
                start.await();
                MvcResult result = mockMvc.perform(authed(get(range), user))
                        .andExpect(status().isOk())
                        .andReturn();
                List<String> ids = JsonPath.read(result.getResponse().getContentAsString(), "$[*].id");
                return ids.toString();
            }));
        }
        start.countDown();

        Set<String> distinctResponses = new HashSet<>();
        for (Future<String> result : results) {
            distinctResponses.add(result.get(30, TimeUnit.SECONDS));
        }
        pool.shutdown();

        assertThat(distinctResponses).hasSize(1);
        mockMvc.perform(authed(get(range), user))
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].sections.length()").value(2))
                .andExpect(jsonPath("$[3].sections.length()").value(2));
    }
}
