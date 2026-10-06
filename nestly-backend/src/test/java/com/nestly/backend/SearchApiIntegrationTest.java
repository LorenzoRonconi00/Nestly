package com.nestly.backend;

import java.time.Duration;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.awaitility.Awaitility.await;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;

class SearchApiIntegrationTest extends SearchIntegrationTestBase {

    private String searchUrl(String agendaId, String query) {
        return "/api/agendas/" + agendaId + "/search?q=" + query;
    }

    private String awaitSearchBody(Session session, String agendaId, String query, int expectedHits) throws Exception {
        String[] body = new String[1];
        await().atMost(Duration.ofSeconds(15)).pollInterval(Duration.ofMillis(200)).untilAsserted(() -> {
            MvcResult result = mockMvc.perform(authed(get(searchUrl(agendaId, query)), session))
                    .andExpect(status().isOk())
                    .andReturn();
            body[0] = result.getResponse().getContentAsString();
            assertThat(JsonPath.<List<?>>read(body[0], "$")).hasSize(expectedHits);
        });
        return body[0];
    }

    @Test
    void searchReturnsThePageWithMarkedSegments() throws Exception {
        Session user = registerAndLogin();
        Written written = writePage(user, "Visited the dentist this morning", "Buy rosemary");
        drain();

        String body = awaitSearchBody(user, written.agendaId(), "dentist", 1);

        assertThat(JsonPath.<String>read(body, "$[0].pageId")).isEqualTo(written.pageId());
        assertThat(JsonPath.<String>read(body, "$[0].date")).isEqualTo("2026-09-01");
        assertThat(JsonPath.<String>read(body, "$[0].snippets[0].section")).isEqualTo("freetext");
        List<String> matched = JsonPath.read(body, "$[0].snippets[0].segments[?(@.match == true)].text");
        assertThat(matched).containsExactly("dentist");
        List<String> texts = JsonPath.read(body, "$[0].snippets[0].segments[*].text");
        assertThat(String.join("", texts)).isEqualTo("Visited the dentist this morning");
        assertThat(body).doesNotContain("\uE000").doesNotContain("\uE001");
    }

    @Test
    void searchFindsMatchesInOtherSectionsAndToleratesTypos() throws Exception {
        Session user = registerAndLogin();
        Written written = writePage(user, "Nothing special", "Comprare caffè");
        drain();

        String body = awaitSearchBody(user, written.agendaId(), "caffe", 1);

        assertThat(JsonPath.<String>read(body, "$[0].snippets[0].section")).isEqualTo("checklist");
        awaitSearchBody(user, written.agendaId(), "comprre", 1);
    }

    @Test
    void searchStaysInsideTheRequestedAgenda() throws Exception {
        Session user = registerAndLogin();
        Written first = writePage(user, "A story about turnips", "x");
        String secondAgenda = createAgenda(user, "standard");
        Written second = writePage(user, secondAgenda, "2026-09-02", "Another tale of turnips", "y");
        drain();

        String body = awaitSearchBody(user, first.agendaId(), "turnips", 1);

        assertThat(JsonPath.<String>read(body, "$[0].pageId")).isEqualTo(first.pageId());
        awaitSearchBody(user, second.agendaId(), "turnips", 1);
    }

    @Test
    void anotherUserCannotSearchSomeoneElsesAgenda() throws Exception {
        Session owner = registerAndLogin();
        Session intruder = registerAndLogin();
        Written written = writePage(owner, "Private thoughts about radishes", "x");
        drain();
        awaitSearchBody(owner, written.agendaId(), "radishes", 1);

        mockMvc.perform(authed(get(searchUrl(written.agendaId(), "radishes")), intruder))
                .andExpect(status().isNotFound());
    }

    @Test
    void blankAndOversizedQueriesAreHandled() throws Exception {
        Session user = registerAndLogin();
        String agendaId = createAgenda(user, "standard");

        mockMvc.perform(authed(get(searchUrl(agendaId, "%20%20")), user))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(authed(get(searchUrl(agendaId, "a".repeat(201))), user))
                .andExpect(status().isBadRequest());
        mockMvc.perform(authed(get("/api/agendas/" + agendaId + "/search"), user))
                .andExpect(status().isBadRequest());
    }

    @Test
    void searchRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/agendas/00000000-0000-0000-0000-000000000000/search?q=x"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void queryTextCannotChangeTheFilter() throws Exception {
        Session owner = registerAndLogin();
        Session other = registerAndLogin();
        Written ownerPage = writePage(owner, "Owner note about parsnips", "x");
        Written otherPage = writePage(other, "Other note about parsnips", "y");
        drain();
        awaitSearchBody(other, otherPage.agendaId(), "parsnips", 1);

        String hostile = "parsnips%22%20OR%20userId%20%3D%20%22" + userId(owner);
        MvcResult result = mockMvc.perform(authed(get(searchUrl(otherPage.agendaId(), hostile)), other))
                .andExpect(status().isOk())
                .andReturn();

        assertThat(result.getResponse().getContentAsString()).doesNotContain(ownerPage.pageId());
    }
}
