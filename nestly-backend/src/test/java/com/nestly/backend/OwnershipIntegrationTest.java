package com.nestly.backend;

import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class OwnershipIntegrationTest extends IntegrationTestBase {

    @Test
    void anotherUserCannotSeeChangeOrDeleteAnAgenda() throws Exception {
        Session owner = registerAndLogin();
        Session intruder = registerAndLogin();
        String agendaId = createAgenda(owner, "standard");
        String base = "/api/agendas/" + agendaId;

        mockMvc.perform(authed(get(base), intruder)).andExpect(status().isNotFound());
        mockMvc.perform(authed(put(base), intruder)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Hijacked\",\"coverTheme\":\"solid:#112233\"}"))
                .andExpect(status().isNotFound());
        mockMvc.perform(structureRequest(intruder, agendaId, true, "mood")).andExpect(status().isNotFound());
        mockMvc.perform(authed(get(base + "/pages/by-date-range?from=2026-01-01&count=2"), intruder))
                .andExpect(status().isNotFound());
        mockMvc.perform(authed(get(base + "/pages/days-with-content?month=2026-01"), intruder))
                .andExpect(status().isNotFound());
        mockMvc.perform(authed(delete(base), intruder)).andExpect(status().isNotFound());

        mockMvc.perform(authed(get(base), owner))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Test agenda"));
    }

    @Test
    void agendaListContainsOnlyTheUsersOwnAgendas() throws Exception {
        Session first = registerAndLogin();
        Session second = registerAndLogin();
        createAgenda(first, "standard");
        createAgenda(first, "notebook");
        createAgenda(second, "diary");

        mockMvc.perform(authed(get("/api/agendas"), first))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
        mockMvc.perform(authed(get("/api/agendas"), second))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void ownerCanRenameAndDeleteAnAgenda() throws Exception {
        Session owner = registerAndLogin();
        String agendaId = createAgenda(owner, "standard");
        String base = "/api/agendas/" + agendaId;

        mockMvc.perform(authed(put(base), owner)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"  Renamed  \",\"coverTheme\":\"solid:#c7e8c0\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Renamed"))
                .andExpect(jsonPath("$.coverTheme").value("solid:#c7e8c0"));

        mockMvc.perform(authed(delete(base), owner)).andExpect(status().isNoContent());
        mockMvc.perform(authed(get(base), owner)).andExpect(status().isNotFound());
    }

    @Test
    void invalidAgendaDetailsAreRejected() throws Exception {
        Session owner = registerAndLogin();
        String agendaId = createAgenda(owner, "standard");

        mockMvc.perform(authed(put("/api/agendas/" + agendaId), owner)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"   \",\"coverTheme\":\"solid:#c7e8c0\"}"))
                .andExpect(status().isBadRequest());
        mockMvc.perform(authed(put("/api/agendas/" + agendaId), owner)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Ok\",\"coverTheme\":\"solid:red\"}"))
                .andExpect(status().isBadRequest());
    }
}
