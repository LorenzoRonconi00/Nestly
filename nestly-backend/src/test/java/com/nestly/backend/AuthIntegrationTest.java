package com.nestly.backend;

import static org.assertj.core.api.Assertions.assertThat;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MvcResult;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import jakarta.servlet.http.Cookie;

class AuthIntegrationTest extends IntegrationTestBase {

    @Test
    void registrationRejectsDuplicateEmail() throws Exception {
        String body = credentials(uniqueEmail());
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isConflict());
    }

    @Test
    void registrationRejectsShortPassword() throws Exception {
        String body = "{\"email\":\"" + uniqueEmail() + "\",\"password\":\"short\"}";
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isBadRequest());
    }

    @Test
    void loginRejectsWrongPassword() throws Exception {
        String email = uniqueEmail();
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(credentials(email)))
                .andExpect(status().isCreated());
        String wrong = "{\"email\":\"" + email + "\",\"password\":\"wrong-password\"}";
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(wrong))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void loginIssuesAccessTokenAndHttpOnlyRefreshCookie() throws Exception {
        Session session = registerAndLogin();

        assertThat(session.token()).isNotBlank();
        assertThat(session.refreshCookie()).isNotNull();
        assertThat(session.refreshCookie().isHttpOnly()).isTrue();
        assertThat(session.refreshCookie().getPath()).isEqualTo("/api/auth");
    }

    @Test
    void meRequiresAuthenticationAndReturnsCurrentUser() throws Exception {
        mockMvc.perform(get("/api/auth/me")).andExpect(status().isUnauthorized());

        Session session = registerAndLogin();
        mockMvc.perform(authed(get("/api/auth/me"), session))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").isNotEmpty());
    }

    @Test
    void refreshRotatesTokenAndRevokesTheWholeFamilyOnReuse() throws Exception {
        Session session = registerAndLogin();
        Cookie first = session.refreshCookie();

        MvcResult refreshed = mockMvc.perform(post("/api/auth/refresh").cookie(first))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andReturn();
        Cookie second = refreshed.getResponse().getCookie("nestly_refresh");
        assertThat(second).isNotNull();
        assertThat(second.getValue()).isNotEqualTo(first.getValue());

        mockMvc.perform(post("/api/auth/refresh").cookie(first)).andExpect(status().isUnauthorized());
        mockMvc.perform(post("/api/auth/refresh").cookie(second)).andExpect(status().isUnauthorized());
    }

    @Test
    void refreshWithoutCookieIsUnauthorized() throws Exception {
        mockMvc.perform(post("/api/auth/refresh")).andExpect(status().isUnauthorized());
    }

    @Test
    void logoutRevokesTheRefreshTokenAndClearsTheCookie() throws Exception {
        Session session = registerAndLogin();

        MvcResult logout = mockMvc.perform(post("/api/auth/logout").cookie(session.refreshCookie()))
                .andExpect(status().isNoContent())
                .andReturn();
        Cookie cleared = logout.getResponse().getCookie("nestly_refresh");
        assertThat(cleared).isNotNull();
        assertThat(cleared.getMaxAge()).isZero();

        mockMvc.perform(post("/api/auth/refresh").cookie(session.refreshCookie()))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void registrationRejectsPasswordsLongerThan72BytesWithAClearMessage() throws Exception {
        String longAscii = "a".repeat(73);
        String multiByte = "è".repeat(37);
        for (String password : new String[]{longAscii, multiByte}) {
            String body = "{\"email\":\"" + uniqueEmail() + "\",\"password\":\"" + password + "\"}";
            mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.errors[0].field").value("password"))
                    .andExpect(jsonPath("$.errors[0].message").value(org.hamcrest.Matchers.containsString("72 bytes")));
        }
    }

    @Test
    void registrationAcceptsAPasswordOfExactly72Bytes() throws Exception {
        String body = "{\"email\":\"" + uniqueEmail() + "\",\"password\":\"" + "a".repeat(72) + "\"}";
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
    }

    @Test
    void loginRejectsPasswordsThatBcryptWouldSilentlyTruncate() throws Exception {
        String email = uniqueEmail();
        String register = "{\"email\":\"" + email + "\",\"password\":\"" + "a".repeat(72) + "\"}";
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(register))
                .andExpect(status().isCreated());
        String login = "{\"email\":\"" + email + "\",\"password\":\"" + "a".repeat(100) + "\"}";
        mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(login))
                .andExpect(status().isBadRequest());
    }
}
