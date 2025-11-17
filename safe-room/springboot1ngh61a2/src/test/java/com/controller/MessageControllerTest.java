package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.MessageEntity;
import com.service.MessageService;
import com.utils.TestUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Tags;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.Arrays;
import java.util.Date;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@Tags({
    @Tag("integration"),
    @Tag("controller"),
    @Tag("message")
})
class MessageControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private MessageService messageService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test message entries to prevent conflicts between test runs
        messageService.list().stream()
                .filter(message -> message.getTitle() != null &&
                        (message.getTitle().contains("测试消息") ||
                         message.getTitle().contains("提醒消息") ||
                         message.getTitle().contains("delete-message") ||
                         message.getTitle().contains("detail-test") ||
                         message.getTitle().contains("null-test") ||
                         message.getTitle().contains("non-existent") ||
                         message.getTitle().contains("filter-test") ||
                         message.getTitle().contains("mark-read-test") ||
                         message.getTitle().contains("unread-test") ||
                         message.getTitle().contains("query-test") ||
                         message.getTitle().contains("frontend-detail") ||
                         message.getTitle().contains("update-message")))
                .forEach(message -> messageService.removeById(message.getId()));
    }

    @Test
    void shouldReturnPagedMessages() throws Exception {
        performAdmin(get("/messages/page"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateMessageEntry() throws Exception {
        MessageEntity payload = createTestMessage("测试消息", "消息内容", 1L);

        postJson("/messages/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldCreateMessageWithNullIsRead() throws Exception {
        MessageEntity payload = new MessageEntity();
        payload.setTitle("测试消息");
        payload.setContent("消息内容");
        payload.setUserid(1L);
        payload.setType("system");
        // isread is null, should be set to 0 in controller

        postJson("/messages/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleMessageDetailRequest() throws Exception {
        MessageEntity message = persistMessage("detail-test", "测试详情内容", 1L);

        performAdmin(get("/messages/info/" + message.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.title").value("detail-test"));
    }

    @Test
    void shouldHandleMessageDetailWithNonExistentId() throws Exception {
        performAdmin(get("/messages/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleMessageUpdate() throws Exception {
        MessageEntity message = persistMessage("update-message", "原始内容", 1L);

        message.setContent("更新后的内容");

        putJson("/messages/update", message)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        MessageEntity updated = messageService.getById(message.getId());
        assertThat(updated.getContent()).isEqualTo("更新后的内容");
    }

    @Test
    void shouldHandleMessageUpdateWithNonExistentId() throws Exception {
        MessageEntity payload = new MessageEntity();
        payload.setId(999999L);
        payload.setTitle("non-existent");
        payload.setContent("测试内容");

        putJson("/messages/update", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleMessageDelete() throws Exception {
        MessageEntity message1 = persistMessage("delete-message-1", "内容1", 1L);
        MessageEntity message2 = persistMessage("delete-message-2", "内容2", 1L);

        deleteJson("/messages/delete", new Long[]{message1.getId(), message2.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(messageService.getById(message1.getId())).isNull();
        assertThat(messageService.getById(message2.getId())).isNull();
    }

    @Test
    void shouldHandleMessageDeleteWithEmptyArray() throws Exception {
        deleteJson("/messages/delete", new Long[]{})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleInvalidPaginationParameters() throws Exception {
        performAdmin(get("/messages/page")
                        .param("page", "-1")
                        .param("limit", "0"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleMessageSaveWithNullFields() throws Exception {
        MessageEntity payload = new MessageEntity();
        payload.setTitle(null);
        payload.setContent(null);
        payload.setUserid(null);

        postJson("/messages/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleMessageListWithFilter() throws Exception {
        persistMessage("filter-test-1", "内容1", 1L);
        persistMessage("filter-test-2", "内容2", 2L);

        performAdmin(get("/messages/list")
                        .param("userid", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldHandleFrontendMessageList() throws Exception {
        mockMvc.perform(get("/messages/list"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldHandleFrontendMessageDetail() throws Exception {
        MessageEntity message = persistMessage("frontend-detail", "前端详情", 1L);

        mockMvc.perform(get("/messages/detail/" + message.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.title").value("frontend-detail"));
    }

    @Test
    void shouldHandleMessageQuery() throws Exception {
        // Clean all messages first to ensure clean state
        messageService.list().forEach(message -> messageService.removeById(message.getId()));

        MessageEntity message = persistMessage("query-test", "查询测试", 1L);

        performAdmin(get("/messages/query")
                        .param("title", "query-test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.title").value("query-test"));
    }

    @Test
    void shouldHandleUnreadCountWithoutUser() throws Exception {
        mockMvc.perform(get("/messages/unreadCount"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(401));
    }

    @Test
    void shouldHandleMarkReadWithValidIds() throws Exception {
        MessageEntity message1 = persistMessage("mark-read-test-1", "内容1", 1L);
        MessageEntity message2 = persistMessage("mark-read-test-2", "内容2", 1L);

        // Set messages as unread first
        MessageEntity updateEntity = new MessageEntity();
        updateEntity.setIsread(0);
        messageService.updateById(message1);
        messageService.updateById(message2);

        postJson("/messages/markRead", new Long[]{message1.getId(), message2.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // Verify messages are marked as read
        MessageEntity updated1 = messageService.getById(message1.getId());
        MessageEntity updated2 = messageService.getById(message2.getId());
        assertThat(updated1.getIsread()).isEqualTo(1);
        assertThat(updated2.getIsread()).isEqualTo(1);
    }

    @Test
    void shouldHandleMarkReadWithEmptyIds() throws Exception {
        postJson("/messages/markRead", new Long[]{})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("消息ID不能为空"));
    }

    @Test
    void shouldHandleSendReminder() throws Exception {
        // Create test data
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("userId", 1L);
        params.put("title", "提醒消息");
        params.put("content", "这是一条提醒消息");
        params.put("relatedType", "course");
        params.put("relatedId", 100L);

        postJson("/messages/sendReminder", params)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleSendReminderWithMissingParams() throws Exception {
        java.util.Map<String, Object> params = new java.util.HashMap<>();
        params.put("title", "提醒消息");
        // Missing userId, content

        postJson("/messages/sendReminder", params)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("参数不完整"));
    }

    @Test
    void shouldHandleAutoSort() throws Exception {
        mockMvc.perform(get("/messages/autoSort"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data").isNotEmpty());
    }

    private MessageEntity createTestMessage(String title, String content, Long userId) {
        MessageEntity message = new MessageEntity();
        message.setTitle(title);
        message.setContent(content);
        message.setUserid(userId);
        message.setType("system");
        message.setIsread(0);
        message.setAddtime(new Date());
        return message;
    }

    private MessageEntity persistMessage(String title, String content, Long userId) {
        MessageEntity message = createTestMessage(title, content, userId);
        messageService.save(message);
        return message;
    }
}
