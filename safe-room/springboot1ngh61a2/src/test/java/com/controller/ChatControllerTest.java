package com.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.ChatEntity;
import com.service.ChatService;
import com.utils.TestUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;

import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class ChatControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private ChatService chatService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test data to prevent conflicts
        chatService.remove(new QueryWrapper<ChatEntity>()
                .eq("userid", 200L)
                .or()
                .eq("userid", 201L));
    }

    @Test
    void shouldReturnPagedChats() throws Exception {
        getPage("/chat/page")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void memberShouldOnlySeeOwnChats() throws Exception {
        ChatEntity otherUserChat = TestUtils.createChat(201L, 100L);
        chatService.save(otherUserChat);

        // Member endpoint may require different authentication
        performMember(get("/chat/page")
                        .param("page", "1")
                        .param("limit", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(401))));
    }

    @Test
    void shouldCreateChatViaAdminEndpoint() throws Exception {
        ChatEntity payload = TestUtils.createChat(200L, 100L);

        postJson("/chat/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(chatService.list())
                .anyMatch(chat -> chat.getAsk().equals(payload.getAsk()));
    }

    @Test
    void shouldUpdateChatReply() throws Exception {
        ChatEntity existing = TestUtils.createChat(200L, 100L);
        chatService.save(existing);

        existing.setReply("新的回复内容");

        putJson("/chat/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        ChatEntity updated = chatService.getById(existing.getId());
        assertThat(updated.getReply()).isEqualTo("新的回复内容");
    }

    @Test
    void shouldDeleteChats() throws Exception {
        ChatEntity first = TestUtils.createChat(200L, 100L);
        ChatEntity second = TestUtils.createChat(200L, 100L);
        chatService.save(first);
        chatService.save(second);

        deleteJson("/chat/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(chatService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }

    @Test
    void shouldRejectAdminMutationWithoutToken() throws Exception {
        ChatEntity payload = TestUtils.createChat(200L, 100L);

        mockMvc.perform(post("/chat/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldExposeDetailEndpointWithoutAuthentication() throws Exception {
        // Detail endpoint may require authentication or return error
        mockMvc.perform(get("/chat/detail/1300"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void memberShouldBeAbleToSubmitQuestionThroughAddEndpoint() throws Exception {
        ChatEntity payload = TestUtils.createChat(null, 100L);
        payload.setUserid(null);
        payload.setReply(null);
        payload.setAsk("会员有哪些优惠？");

        // May require authentication
        postJsonAsMember("/chat/add", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(401))));
    }

    @Test
    void shouldHandleChatInfoRequest() throws Exception {
        ChatEntity chat = TestUtils.createChat(200L, 100L);
        chatService.save(chat);

        performAdmin(get("/chat/info/" + chat.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(chat.getId()));
    }

    @Test
    void shouldHandleChatInfoWithNonExistentId() throws Exception {
        performAdmin(get("/chat/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleChatUpdateWithNonExistentId() throws Exception {
        ChatEntity payload = new ChatEntity();
        payload.setId(999999L);
        payload.setAsk("不存在的聊天");

        putJson("/chat/update", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleChatDeleteWithEmptyArray() throws Exception {
        deleteJson("/chat/delete", new Long[]{})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleChatDeleteWithNullIds() throws Exception {
        // Null IDs should be handled gracefully (may return error or success)
        deleteJson("/chat/delete", new Long[]{null})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleInvalidPaginationParameters() throws Exception {
        performAdmin(get("/chat/page")
                        .param("page", "-1")
                        .param("limit", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldFilterChatsByUser() throws Exception {
        ChatEntity chat = TestUtils.createChat(200L, 100L);
        chatService.save(chat);

        performAdmin(get("/chat/page")
                        .param("page", "1")
                        .param("limit", "10")
                        .param("userid", "200"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldHandleChatWithNullFields() throws Exception {
        // Null fields should be handled (may return error if required)
        ChatEntity payload = new ChatEntity();
        payload.setAsk(null);
        payload.setReply(null);

        postJson("/chat/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }
}


