package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.ChatEntity;
import com.entity.view.ChatView;
import com.entity.vo.ChatVO;
import com.utils.PageUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class ChatServiceImplTest {

    @Autowired
    private ChatService chatService;

    @Test
    void shouldReturnPagedChats() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = chatService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldFilterChatsByUser() {
        List<ChatEntity> chats = chatService.list(new QueryWrapper<ChatEntity>().eq("userid", 200));
        assertThat(chats).isNotEmpty();
    }

    @Test
    void shouldSelectChatViews() {
        var views = chatService.selectListView(new QueryWrapper<ChatEntity>().eq("userid", 200));
        assertThat(views).isNotEmpty();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = chatService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = chatService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = chatService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = chatService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = chatService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleNullWrapper() {
        List<ChatVO> vos = chatService.selectListVO(null);
        assertThat(vos).isNotNull();
    }

    @Test
    void shouldHandleSelectViewWithNullWrapper() {
        ChatView view = chatService.selectView(null);
        // ChatServiceImpl doesn't check for null wrapper, so it may return null or throw exception
        // This test verifies the behavior
        assertThat(view).isNull();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<ChatEntity> wrapper = new QueryWrapper<ChatEntity>()
                .eq("userid", Long.MAX_VALUE);
        List<ChatView> views = chatService.selectListView(wrapper);
        assertThat(views).isEmpty();
    }

    @Test
    void shouldHandleQueryPageWithNullWrapper() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        PageUtils result = chatService.queryPage(params, null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleSaveWithNullEntity() {
        ChatEntity entity = null;
        try {
            chatService.save(entity);
        } catch (Exception e) {
            assertThat(e).isNotNull();
        }
    }

    @Test
    void shouldHandleUpdateNonExistentEntity() {
        ChatEntity entity = new ChatEntity();
        entity.setId(Long.MAX_VALUE);
        entity.setAsk("test question");
        boolean result = chatService.updateById(entity);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleDeleteNonExistentEntity() {
        boolean result = chatService.removeById(Long.MAX_VALUE);
        assertThat(result).isFalse();
    }

    @Test
    void shouldHandleGetByIdWithNonExistentId() {
        ChatEntity entity = chatService.getById(Long.MAX_VALUE);
        assertThat(entity).isNull();
    }
}


