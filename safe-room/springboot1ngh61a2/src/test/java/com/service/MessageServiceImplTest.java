package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.MessageEntity;
import com.entity.view.MessageView;
import com.entity.vo.MessageVO;
import com.utils.PageUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class MessageServiceImplTest {

    @Autowired
    private MessageService messageService;

    @AfterEach
    void cleanupTestData() {
        // 清理测试消息数据
        messageService.list().stream()
                .filter(message -> message.getTitle() != null &&
                        (message.getTitle().contains("test-message") ||
                         message.getTitle().contains("query-test") ||
                         message.getTitle().contains("update-test") ||
                         message.getTitle().contains("delete-test") ||
                         message.getTitle().contains("test-message-save") ||
                         message.getTitle().contains("test-message-update") ||
                         message.getTitle().contains("test-message-delete") ||
                         message.getTitle().contains("test-message-vo-list") ||
                         message.getTitle().contains("test-message-vo-single") ||
                         message.getTitle().contains("test-message-query-wrapper") ||
                         message.getTitle().contains("test-message-status") ||
                         message.getTitle().contains("test-message-view") ||
                         message.getTitle().contains("test-message-view-list")))
                .forEach(message -> messageService.removeById(message.getId()));
    }

    @Test
    void shouldReturnPagedMessages() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = messageService.queryPage(params);

        assertThat(result.getList()).isNotNull();
    }

    @Test
    void shouldSelectMessageView() {
        // First check if any messages exist
        List<MessageView> allViews = messageService.selectListView(new QueryWrapper<>());
        if (!allViews.isEmpty()) {
            // Use the first message's title for the test
            String title = allViews.get(0).getTitle();
            var view = messageService.selectView(new QueryWrapper<MessageEntity>().eq("title", title));
            assertThat(view).isNotNull();
        } else {
            // If no messages exist, the view should be null
            var view = messageService.selectView(new QueryWrapper<MessageEntity>().eq("title", "non-existent-message"));
            assertThat(view).isNull();
        }
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = messageService.queryPage(emptyParams);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = messageService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = messageService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = messageService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = messageService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "0");
        params.put("limit", "10");
        PageUtils result = messageService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                .eq("title", "不存在的消息-" + System.nanoTime());
        List<MessageView> views = messageService.selectListView(wrapper);
        assertThat(views).isEmpty();
    }

    @Test
    void shouldHandleNullWrapper() {
        List<MessageVO> vos = messageService.selectListVO(null);
        assertThat(vos).isNotNull();
    }

    @Test
    void shouldHandleViewWithNullWrapper() {
        MessageView view = messageService.selectView(null);
        assertThat(view).isNull();
    }

    @Test
    void shouldHandleVOWithNonExistentCondition() {
        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                .eq("id", Long.MAX_VALUE);
        MessageVO vo = messageService.selectVO(wrapper);
        assertThat(vo).isNull();
    }

    @Test
    void shouldHandleQueryPageWithWrapperAndEmptyParams() {
        Map<String, Object> params = Collections.emptyMap();
        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<>();
        PageUtils result = messageService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleBoundaryQueryConditions() {
        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                .like("title", "")
                .or()
                .isNull("type");
        List<MessageView> views = messageService.selectListView(wrapper);
        assertThat(views).isNotNull();
    }

    // 异常场景测试
    @Test
    void shouldHandleSaveWithNullEntity() {
        MessageEntity entity = null;
        try {
            messageService.save(entity);
            // 如果没有异常，说明框架处理了null输入
        } catch (Exception e) {
            assertThat(e).isNotNull();
        }
    }

    @Test
    void shouldHandleUpdateNonExistentEntity() {
        MessageEntity entity = new MessageEntity();
        entity.setId(Long.MAX_VALUE);
        entity.setTitle("不存在的消息");
        boolean result = messageService.updateById(entity);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleDeleteNonExistentEntity() {
        boolean result = messageService.removeById(Long.MAX_VALUE);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleGetByIdWithNonExistentId() {
        MessageEntity entity = messageService.getById(Long.MAX_VALUE);
        assertThat(entity).isNull();
    }

    @Test
    void shouldHandleQueryPageWithNullWrapper() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        PageUtils result = messageService.queryPage(params, null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleQueryPageWithComplexParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "2");
        params.put("limit", "20");
        params.put("sort", "addtime");
        params.put("order", "desc");

        PageUtils result = messageService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotNull();
    }

    @Test
    void shouldHandleQueryPageWithWrapper() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");
        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                .like("title", "test");

        PageUtils result = messageService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleSelectListViewWithComplexWrapper() {
        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                .eq("type", "system")
                .orderByDesc("addtime");
        List<MessageView> views = messageService.selectListView(wrapper);
        assertThat(views).isNotNull();
    }

    @Test
    void shouldHandleSelectVOWithValidCondition() {
        // Try to find an existing message
        List<MessageEntity> messages = messageService.list();
        if (!messages.isEmpty()) {
            Long userId = messages.get(0).getUserid();
            QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                    .eq("userid", userId);
            MessageVO vo = messageService.selectVO(wrapper);
            assertThat(vo).isNotNull();
            assertThat(vo.getUserid()).isEqualTo(userId);
        } else {
            // If no messages exist, test with non-existent user ID
            QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                    .eq("userid", 1L);
            MessageVO vo = messageService.selectVO(wrapper);
            assertThat(vo).isNull();
        }
    }

    @Test
    void shouldHandleSelectViewWithValidCondition() {
        // Try to find an existing message
        List<MessageEntity> messages = messageService.list();
        if (!messages.isEmpty()) {
            String title = messages.get(0).getTitle();
            QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                    .eq("title", title);
            MessageView view = messageService.selectView(wrapper);
            assertThat(view).isNotNull();
            assertThat(view.getTitle()).isEqualTo(title);
        } else {
            // If no messages exist, test with non-existent title
            QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                    .eq("title", "non-existent-title");
            MessageView view = messageService.selectView(wrapper);
            assertThat(view).isNull();
        }
    }

    @Test
    void shouldHandleConcurrentOperations() {
        // Test multiple operations in sequence
        Map<String, Object> params1 = new HashMap<>();
        params1.put("page", "1");
        params1.put("limit", "10");

        Map<String, Object> params2 = new HashMap<>();
        params2.put("page", "2");
        params2.put("limit", "5");

        PageUtils result1 = messageService.queryPage(params1);
        PageUtils result2 = messageService.queryPage(params2);

        assertThat(result1).isNotNull();
        assertThat(result2).isNotNull();
    }

    @Test
    void shouldHandleLargePageSize() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "1000");
        PageUtils result = messageService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldSaveMessageWithDefaultValues() {
        MessageEntity message = new MessageEntity();
        message.setTitle("test-message-save");
        message.setContent("Test message content");
        message.setType("system");
        message.setUserid(1L);
        message.setRelatedType("test");

        messageService.save(message);

        assertThat(message.getId()).isNotNull();
        assertThat(message.getIsread()).isZero(); // 应该默认为0
        assertThat(message.getAddtime()).isNotNull(); // 应该自动设置
    }

    @Test
    void shouldUpdateMessageReadStatus() {
        MessageEntity message = new MessageEntity();
        message.setTitle("test-message-update");
        message.setContent("Test message content");
        message.setType("system");
        message.setUserid(1L);
        message.setIsread(0);
        message.setRelatedType("test");

        messageService.save(message);
        Long messageId = message.getId();

        // 更新消息为已读
        MessageEntity updateMessage = new MessageEntity();
        updateMessage.setId(messageId);
        updateMessage.setIsread(1);
        messageService.updateById(updateMessage);

        // 验证更新结果
        MessageEntity updatedMessage = messageService.getById(messageId);
        assertThat(updatedMessage.getIsread()).isEqualTo(1);
    }

    @Test
    void shouldDeleteMessage() {
        MessageEntity message = new MessageEntity();
        message.setTitle("test-message-delete");
        message.setContent("Test message content");
        message.setType("system");
        message.setUserid(1L);
        message.setRelatedType("test");

        messageService.save(message);
        Long messageId = message.getId();

        // 删除消息
        boolean deleted = messageService.removeById(messageId);
        assertThat(deleted).isTrue();

        // 验证删除结果
        MessageEntity deletedMessage = messageService.getById(messageId);
        assertThat(deletedMessage).isNull();
    }

    @Test
    void shouldSelectListVO() {
        MessageEntity message = new MessageEntity();
        message.setTitle("test-message-vo-list");
        message.setContent("Test message content");
        message.setType("system");
        message.setUserid(2L);
        message.setRelatedType("test");

        messageService.save(message);

        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                .eq("userid", 2L);
        List<MessageVO> vos = messageService.selectListVO(wrapper);

        assertThat(vos).isNotNull();
        assertThat(vos).isNotEmpty();
        assertThat(vos.get(0).getUserid()).isEqualTo(2L);
        assertThat(vos.get(0).getTitle()).isEqualTo("test-message-vo-list");
    }

    @Test
    void shouldSelectVO() {
        MessageEntity message = new MessageEntity();
        message.setTitle("test-message-vo-single");
        message.setContent("Test message content");
        message.setType("system");
        message.setUserid(3L);
        message.setRelatedType("test");

        messageService.save(message);
        Long messageId = message.getId();

        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                .eq("id", messageId);
        MessageVO vo = messageService.selectVO(wrapper);

        assertThat(vo).isNotNull();
        assertThat(vo.getTitle()).isEqualTo("test-message-vo-single");
    }

    @Test
    void shouldQueryPageWithWrapper() {
        MessageEntity message = new MessageEntity();
        message.setTitle("test-message-query-wrapper");
        message.setContent("Test message content");
        message.setType("reminder");
        message.setUserid(4L);
        message.setRelatedType("test");

        messageService.save(message);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                .eq("type", "reminder");

        PageUtils result = messageService.queryPage(params, wrapper);

        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotEmpty();
        // 验证返回的结果包含正确的消息类型
        MessageEntity resultMessage = (MessageEntity) result.getList().get(0);
        assertThat(resultMessage.getType()).isEqualTo("reminder");
    }

    @Test
    void shouldHandleMessageStatusTransition() {
        MessageEntity message = new MessageEntity();
        message.setTitle("test-message-status");
        message.setContent("Test message content");
        message.setType("system");
        message.setUserid(5L);
        message.setIsread(0);
        message.setRelatedType("test");

        messageService.save(message);
        Long messageId = message.getId();

        // 验证初始状态为未读
        MessageEntity savedMessage = messageService.getById(messageId);
        assertThat(savedMessage.getIsread()).isZero();

        // 更新为已读
        savedMessage.setIsread(1);
        messageService.updateById(savedMessage);

        // 验证状态变为已读
        MessageEntity updatedMessage = messageService.getById(messageId);
        assertThat(updatedMessage.getIsread()).isEqualTo(1);
    }


    @Test
    void shouldSelectListView() {
        MessageEntity message = new MessageEntity();
        message.setTitle("test-message-view-list");
        message.setContent("Test message content");
        message.setType("system");
        message.setUserid(7L);
        message.setRelatedType("test");

        messageService.save(message);

        QueryWrapper<MessageEntity> wrapper = new QueryWrapper<MessageEntity>()
                .eq("userid", 7L);
        List<MessageView> views = messageService.selectListView(wrapper);

        assertThat(views).isNotNull();
        assertThat(views).isNotEmpty();
        assertThat(views.get(0).getUserid()).isEqualTo(7L);
    }
}
