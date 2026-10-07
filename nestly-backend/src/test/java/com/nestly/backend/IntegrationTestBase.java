package com.nestly.backend;

import java.util.StringJoiner;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.wait.strategy.Wait;
import org.testcontainers.postgresql.PostgreSQLContainer;

import com.jayway.jsonpath.JsonPath;

import jakarta.servlet.http.Cookie;

@SpringBootTest(properties = "spring.jpa.show-sql=false")
@AutoConfigureMockMvc
public abstract class IntegrationTestBase {

    private static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer("postgres:16-alpine");

    protected static final String MEILI_KEY = "test-master-key-0123456789";

    private static final GenericContainer<?> MEILI = new GenericContainer<>("getmeili/meilisearch:v1.54.3")
            .withEnv("MEILI_MASTER_KEY", MEILI_KEY)
            .withEnv("MEILI_NO_ANALYTICS", "true")
            .withExposedPorts(7700)
            .waitingFor(Wait.forHttp("/health").forStatusCode(200));

    static {
        POSTGRES.start();
        MEILI.start();
    }

    @DynamicPropertySource
    static void datasourceProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("nestly.jwt.secret", () -> "test-only-jwt-secret-0123456789-abcdefghijklmnop");
        registry.add("nestly.search.url", () -> "http://" + MEILI.getHost() + ":" + MEILI.getMappedPort(7700));
        registry.add("nestly.search.api-key", () -> MEILI_KEY);
        registry.add("nestly.search.sync-interval-ms", () -> "3600000");
    }

    protected record Session(String token, Cookie refreshCookie) {

    }

    @Autowired
    protected MockMvc mockMvc;

    protected Session registerAndLogin() throws Exception {
        String body = credentials(uniqueEmail());
        mockMvc.perform(post("/api/auth/register").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isCreated());
        MvcResult login = mockMvc.perform(post("/api/auth/login").contentType(MediaType.APPLICATION_JSON).content(body))
                .andExpect(status().isOk())
                .andReturn();
        String token = JsonPath.read(login.getResponse().getContentAsString(), "$.token");
        return new Session(token, login.getResponse().getCookie("nestly_refresh"));
    }

    protected static String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@test.com";
    }

    protected static String credentials(String email) {
        return "{\"email\":\"" + email + "\",\"password\":\"password123\"}";
    }

    protected static MockHttpServletRequestBuilder authed(MockHttpServletRequestBuilder builder, Session session) {
        return builder.header("Authorization", "Bearer " + session.token());
    }

    protected String createAgenda(Session session, String baseTemplate) throws Exception {
        MvcResult result = mockMvc.perform(authed(post("/api/agendas"), session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"name\":\"Test agenda\",\"baseTemplate\":\"" + baseTemplate + "\"}"))
                .andExpect(status().isCreated())
                .andReturn();
        return JsonPath.read(result.getResponse().getContentAsString(), "$.id");
    }

    protected MockHttpServletRequestBuilder structureRequest(Session session, String agendaId, boolean confirm,
            String... types) {
        StringJoiner sections = new StringJoiner(",");
        for (int index = 0; index < types.length; index++) {
            sections.add("{\"type\":\"" + types[index] + "\",\"order\":" + (index + 1) + "}");
        }
        return authed(patch("/api/agendas/" + agendaId + "/structure-template"), session)
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"sections\":[" + sections + "],\"confirmDataLoss\":" + confirm + "}");
    }

    protected void setStructure(Session session, String agendaId, String... types) throws Exception {
        mockMvc.perform(structureRequest(session, agendaId, true, types)).andExpect(status().isOk());
    }
}
