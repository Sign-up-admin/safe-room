package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.Set;
import java.util.stream.Stream;

import org.springframework.http.MediaType;

import org.hamcrest.Matchers;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class BackendControllersSmokeTest extends AbstractControllerIntegrationTest {

    @ParameterizedTest(name = "page - {0}")
    @MethodSource("standardEndpointSpecs")
    void shouldReturnPagedData(EndpointSpec spec) throws Exception {
        getPage(spec.basePath() + "/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @ParameterizedTest(name = "empty page - {0}")
    @MethodSource("standardEndpointSpecs")
    void shouldGracefullyHandleEmptyPages(EndpointSpec spec) throws Exception {
        performAdmin(get(spec.basePath() + "/page")
                        .param("page", "99")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list.length()").value(0));
    }

    @ParameterizedTest(name = "info - {0}")
    @MethodSource("detailEndpoints")
    void shouldReturnDetailInfo(EndpointSpec spec) throws Exception {
        performAdmin(get(spec.basePath() + "/info/" + spec.sampleId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").exists());
    }

    @Test
    void commonControllerOptionShouldReturnValues() throws Exception {
        performAdmin(get("/option/huiyuanka/huiyuankamingcheng"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data", Matchers.hasItem("黄金会员")));
    }

    @Test
    void commonControllerFollowShouldReturnEntity() throws Exception {
        performAdmin(get("/follow/jianshenkecheng/id")
                        .param("columnValue", "600"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.kechengmingcheng").value("基础瑜伽"));
    }

    @Test
    void errorReportControllerShouldAcceptPayload() throws Exception {
        performAdmin(post("/api/error/report")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(json(Map.of(
                                "type", "TestError",
                                "message", "something went wrong",
                                "url", "/test",
                                "timestamp", "2024-01-01T00:00:00Z"
                        ))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @ParameterizedTest(name = "requires token - {0}")
    @MethodSource("protectedPageEndpoints")
    void shouldRejectBackendPagesWithoutToken(String basePath) throws Exception {
        mockMvc.perform(get(basePath + "/page")
                        .param("page", "1")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.msg").value("请先登录"));
    }

    @ParameterizedTest(name = "invalid token page - {0}")
    @MethodSource("protectedPageEndpoints")
    void shouldRejectBackendPagesWithInvalidToken(String basePath) throws Exception {
        mockMvc.perform(get(basePath + "/page")
                        .param("page", "1")
                        .param("limit", "5")
                        .header("Token", "invalid-token"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401))
                .andExpect(jsonPath("$.msg").value("请先登录"));
    }

    @ParameterizedTest(name = "write requires auth - {0}")
    @MethodSource("protectedMutationEndpoints")
    void shouldRejectWriteOperationsWithoutToken(String basePath) throws Exception {
        mockMvc.perform(post(basePath + "/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.createObjectNode().toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @ParameterizedTest(name = "public detail - {0}")
    @MethodSource("publicDetailEndpoints")
    void shouldAllowPublicDetailWithoutToken(EndpointSpec spec) throws Exception {
        mockMvc.perform(get(spec.basePath() + "/detail/" + spec.sampleId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").exists());
    }

    private static Stream<String> protectedPageEndpoints() {
        return standardEndpointSpecs().map(EndpointSpec::basePath);
    }

    private static Stream<String> protectedMutationEndpoints() {
        return standardEndpointSpecs().map(EndpointSpec::basePath);
    }

    private static Stream<EndpointSpec> standardEndpointSpecs() {
        return Stream.of(
                new EndpointSpec("/chat", 1300L, true),
                new EndpointSpec("/config", 1L, true),
                new EndpointSpec("/daoqitixing", 1100L, true),
                new EndpointSpec("/discussjianshenkecheng", 1200L, true),
                new EndpointSpec("/huiyuanka", 300L, true),
                new EndpointSpec("/huiyuankagoumai", 301L, true),
                new EndpointSpec("/huiyuanxufei", 302L, true),
                new EndpointSpec("/jianshenjiaolian", 500L, true),
                new EndpointSpec("/jianshenkecheng", 600L, true),
                new EndpointSpec("/jianshenqicai", 601L, true),
                new EndpointSpec("/kechengleixing", 400L, true),
                new EndpointSpec("/kechengtuike", 701L, true),
                new EndpointSpec("/kechengyuyue", 700L, true),
                new EndpointSpec("/news", 900L, false),
                new EndpointSpec("/newstype", 901L, false),
                new EndpointSpec("/sijiaoyuyue", 800L, true),
                new EndpointSpec("/storeup", 1000L, true),
                new EndpointSpec("/user", 101L, true),
                new EndpointSpec("/users", 100L, true),
                new EndpointSpec("/yonghu", 200L, true)
        );
    }

    private static Stream<EndpointSpec> detailEndpoints() {
        return standardEndpointSpecs().filter(EndpointSpec::supportsDetail);
    }

    private static Stream<EndpointSpec> publicDetailEndpoints() {
        return standardEndpointSpecs()
                .filter(spec -> PUBLIC_DETAIL_BASE_PATHS.contains(spec.basePath()));
    }

    private record EndpointSpec(String basePath, long sampleId, boolean supportsDetail) {
        @Override
        public String toString() {
            return basePath;
        }
    }

    private static final Set<String> PUBLIC_DETAIL_BASE_PATHS = Set.of(
            "/chat",
            "/jianshenkecheng",
            "/kechengyuyue",
            "/news",
            "/newstype"
    );
}


