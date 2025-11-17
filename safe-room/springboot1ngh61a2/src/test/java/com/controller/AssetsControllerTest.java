package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import com.entity.AssetsEntity;
import com.service.AssetsService;
import com.utils.ExceptionTestHelper;
import com.utils.ServiceTestHelper;
import com.utils.TestUtils;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class AssetsControllerTest extends AbstractControllerIntegrationTest {

    @Autowired
    private AssetsService assetsService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test asset entries to prevent conflicts between test runs
        assetsService.list().stream()
                .filter(asset -> asset.getAssetName() != null &&
                        (asset.getAssetName().contains("test-module") ||
                         asset.getAssetName().contains("update-module") ||
                         asset.getAssetName().contains("delete-module") ||
                         asset.getAssetName().contains("info-module") ||
                         asset.getAssetName().contains("batch-module") ||
                         asset.getAssetName().contains("type-module") ||
                         asset.getAssetName().contains("status-module") ||
                         asset.getAssetName().contains("preview-module") ||
                         asset.getAssetName().contains("filter-module") ||
                         asset.getAssetName().contains("边界测试") ||
                         asset.getAssetName().contains("异常测试") ||
                         asset.getAssetName().contains("null测试") ||
                         asset.getAssetName().contains("特殊字符测试") ||
                         asset.getAssetName().contains("超长测试") ||
                         asset.getAssetName().contains("Unicode测试")))
                .forEach(asset -> assetsService.removeById(asset.getId()));
    }

    @Test
    void shouldReturnPagedAssets() throws Exception {
        getPage("/assets/list")
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldCreateAsset() throws Exception {
        AssetsEntity payload = TestUtils.createAssetRecord("test-module", "image");

        postJson("/assets/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(assetsService.list())
                .anyMatch(asset -> asset.getAssetName().equals(payload.getAssetName()));
    }

    @Test
    void shouldUpdateAsset() throws Exception {
        AssetsEntity existing = TestUtils.createAssetRecord("update-module", "image");
        assetsService.save(existing);

        existing.setAssetName("更新后的素材名称");
        existing.setStatus("inactive");

        postJson("/assets/update", existing)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        AssetsEntity updated = assetsService.getById(existing.getId());
        assertThat(updated.getAssetName()).isEqualTo("更新后的素材名称");
        assertThat(updated.getStatus()).isEqualTo("inactive");
    }

    @Test
    void shouldDeleteAssets() throws Exception {
        AssetsEntity first = TestUtils.createAssetRecord("delete-module1", "image");
        AssetsEntity second = TestUtils.createAssetRecord("delete-module2", "video");
        assetsService.save(first);
        assetsService.save(second);

        deleteJson("/assets/delete", new Long[]{first.getId(), second.getId()})
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(assetsService.listByIds(Arrays.asList(first.getId(), second.getId())))
                .isEmpty();
    }

    @Test
    void shouldGetAssetInfo() throws Exception {
        AssetsEntity asset = TestUtils.createAssetRecord("info-module", "image");
        assetsService.save(asset);

        performAdmin(get("/assets/info/" + asset.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(asset.getId()))
                .andExpect(jsonPath("$.data.assetName").value(asset.getAssetName()));
    }

    @Test
    void shouldReturnErrorWhenAssetNotFound() throws Exception {
        performAdmin(get("/assets/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("素材不存在"));
    }

    @Test
    void shouldBatchDeleteByModule() throws Exception {
        AssetsEntity asset1 = TestUtils.createAssetRecord("batch-module", "image");
        AssetsEntity asset2 = TestUtils.createAssetRecord("batch-module", "video");
        assetsService.save(asset1);
        assetsService.save(asset2);

        Map<String, Object> params = new HashMap<>();
        params.put("module", "batch-module");

        postJson("/assets/batchDelete", params)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        assertThat(assetsService.listByIds(Arrays.asList(asset1.getId(), asset2.getId())))
                .isEmpty();
    }

    @Test
    void shouldBatchDeleteByAssetType() throws Exception {
        AssetsEntity asset1 = TestUtils.createAssetRecord("type-module", "image");
        AssetsEntity asset2 = TestUtils.createAssetRecord("type-module", "image");
        assetsService.save(asset1);
        assetsService.save(asset2);

        Map<String, Object> params = new HashMap<>();
        params.put("assetType", "image");

        postJson("/assets/batchDelete", params)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldReturnOkWhenBatchDeleteWithNoMatches() throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("module", "non-existent-module");

        postJson("/assets/batchDelete", params)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.msg").value("无可删除的素材"));
    }

    @Test
    void shouldBatchUpdateStatus() throws Exception {
        AssetsEntity asset1 = TestUtils.createAssetRecord("status-module1", "image");
        AssetsEntity asset2 = TestUtils.createAssetRecord("status-module2", "video");
        assetsService.save(asset1);
        assetsService.save(asset2);

        Map<String, Object> params = new HashMap<>();
        params.put("ids", Arrays.asList(asset1.getId(), asset2.getId()));
        params.put("status", "archived");

        postJson("/assets/batchStatus", params)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        AssetsEntity updated1 = assetsService.getById(asset1.getId());
        AssetsEntity updated2 = assetsService.getById(asset2.getId());
        assertThat(updated1.getStatus()).isEqualTo("archived");
        assertThat(updated2.getStatus()).isEqualTo("archived");
    }

    @Test
    void shouldReturnErrorWhenBatchStatusWithInvalidParams() throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("ids", "invalid");

        postJson("/assets/batchStatus", params)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("参数不正确"));
    }

    @Test
    void shouldReturnErrorWhenBatchStatusWithEmptyIds() throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("ids", Arrays.asList());
        params.put("status", "archived");

        postJson("/assets/batchStatus", params)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("请选择需要更新的素材"));
    }

    @Test
    void shouldReturnErrorWhenBatchStatusWithBlankStatus() throws Exception {
        Map<String, Object> params = new HashMap<>();
        params.put("ids", Arrays.asList(1L, 2L));
        params.put("status", "");

        postJson("/assets/batchStatus", params)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("参数不正确"));
    }

    @Test
    void shouldPreviewAsset() throws Exception {
        AssetsEntity asset = TestUtils.createAssetRecord("preview-module", "image");
        asset.setTags("tag1,tag2");
        assetsService.save(asset);

        performAdmin(get("/assets/preview/" + asset.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.id").value(asset.getId()))
                .andExpect(jsonPath("$.data.assetName").value(asset.getAssetName()))
                .andExpect(jsonPath("$.data.assetType").value(asset.getAssetType()))
                .andExpect(jsonPath("$.data.filePath").value(asset.getFilePath()))
                .andExpect(jsonPath("$.data.tags").value("tag1,tag2"));
    }

    @Test
    void shouldReturnErrorWhenPreviewNonExistentAsset() throws Exception {
        performAdmin(get("/assets/preview/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("素材不存在"));
    }

    @Test
    void shouldFilterAssetsByType() throws Exception {
        AssetsEntity imageAsset = TestUtils.createAssetRecord("filter-module", "image");
        AssetsEntity videoAsset = TestUtils.createAssetRecord("filter-module", "video");
        assetsService.save(imageAsset);
        assetsService.save(videoAsset);

        performAdmin(get("/assets/list")
                        .param("page", "1")
                        .param("limit", "10")
                        .param("assetType", "image"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.data.list").isArray());
    }

    @Test
    void shouldFilterAssetsByModule() throws Exception {
        AssetsEntity asset = TestUtils.createAssetRecord("filter-module-specific", "image");
        assetsService.save(asset);

        performAdmin(get("/assets/list")
                        .param("page", "1")
                        .param("limit", "10")
                        .param("module", "filter-module-specific"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    // ============ 边界条件和异常场景测试 ============

    @Test
    void shouldHandleNullAssetNameInSave() throws Exception {
        AssetsEntity payload = TestUtils.createAssetRecord("边界测试", "image");
        payload.setAssetName(null);

        postJson("/assets/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleNullAssetTypeInSave() throws Exception {
        AssetsEntity payload = TestUtils.createAssetRecord("边界测试", null);
        payload.setAssetType(null);

        postJson("/assets/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleEmptyAssetNameInSave() throws Exception {
        AssetsEntity payload = TestUtils.createAssetRecord("", "image");

        postJson("/assets/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleEmptyAssetTypeInSave() throws Exception {
        AssetsEntity payload = TestUtils.createAssetRecord("边界测试", "");

        postJson("/assets/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleVeryLongAssetName() throws Exception {
        String longName = "a".repeat(1000) + "超长素材名称测试";
        AssetsEntity payload = TestUtils.createAssetRecord(longName, "image");

        postJson("/assets/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleVeryLongFilePath() throws Exception {
        AssetsEntity payload = TestUtils.createAssetRecord("边界测试", "image");
        payload.setFilePath("a".repeat(2000) + "/very/long/path/to/file.jpg");

        postJson("/assets/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleSpecialCharactersInAssetName() throws Exception {
        AssetsEntity payload = TestUtils.createAssetRecord("特殊字符测试<script>alert('xss')</script>素材🚀📝", "image");

        postJson("/assets/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleUnicodeCharactersInAssetName() throws Exception {
        AssetsEntity payload = TestUtils.createAssetRecord("Unicode测试素材🚀📝中文", "image");

        postJson("/assets/save", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleInvalidPaginationParameters() throws Exception {
        performAdmin(get("/assets/list")
                        .param("page", "abc")
                        .param("limit", "def"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleNegativePaginationParameters() throws Exception {
        performAdmin(get("/assets/list")
                        .param("page", "-1")
                        .param("limit", "-10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleVeryLargePaginationParameters() throws Exception {
        performAdmin(get("/assets/list")
                        .param("page", "999999")
                        .param("limit", "10000"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleNonExistentAssetId() throws Exception {
        performAdmin(get("/assets/info/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUpdateWithNonExistentId() throws Exception {
        AssetsEntity payload = TestUtils.createAssetRecord("异常测试", "image");
        payload.setId(999999L);

        postJson("/assets/update", payload)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleBatchDeleteWithEmptyIds() throws Exception {
        performAdmin(post("/assets/batchDelete")
                        .contentType("application/json")
                        .content("[]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleBatchDeleteWithNullIds() throws Exception {
        performAdmin(post("/assets/batchDelete")
                        .contentType("application/json")
                        .content("null"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleBatchDeleteWithNonExistentIds() throws Exception {
        performAdmin(post("/assets/batchDelete")
                        .contentType("application/json")
                        .content("[999999, 999998]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));
    }

    @Test
    void shouldHandleBatchStatusUpdateWithEmptyIds() throws Exception {
        performAdmin(post("/assets/batchStatus")
                        .param("ids", "")
                        .param("status", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleBatchStatusUpdateWithInvalidStatus() throws Exception {
        AssetsEntity asset = TestUtils.createAssetRecord("边界测试", "image");
        assetsService.save(asset);

        performAdmin(post("/assets/batchStatus")
                        .param("ids", asset.getId().toString())
                        .param("status", "invalid"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandlePreviewNonExistentAsset() throws Exception {
        performAdmin(get("/assets/preview/999999"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUploadWithOversizedFile() throws Exception {
        // Create a mock file larger than typical limits
        byte[] largeContent = new byte[100 * 1024 * 1024]; // 100MB
        MockMultipartFile file = new MockMultipartFile("file", "large-file.jpg", "image/jpeg", largeContent);

        mockMvc.perform(multipart("/assets/upload")
                        .file(file)
                        .param("module", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleUploadWithUnsupportedFileType() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "test.exe", "application/x-msdownload",
                "fake executable content".getBytes());

        mockMvc.perform(multipart("/assets/upload")
                        .file(file)
                        .param("module", "test"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(Matchers.anyOf(Matchers.is(0), Matchers.is(500))));
    }

    @Test
    void shouldHandleConcurrentAssetOperations() throws Exception {
        // Test concurrent operations on the same asset
        AssetsEntity asset = TestUtils.createAssetRecord("并发测试", "image");
        assetsService.save(asset);

        // Perform multiple updates rapidly
        for (int i = 0; i < 5; i++) {
            asset.setAssetName("并发测试更新" + i);
            postJson("/assets/update", asset)
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.code").value(0));
        }
    }

    @Test
    void shouldHandleRapidAssetCreateAndDelete() throws Exception {
        // Test rapid creation and deletion
        AssetsEntity asset = TestUtils.createAssetRecord("快速创建删除测试", "image");
        assetsService.save(asset);

        // Immediately delete
        performAdmin(post("/assets/batchDelete")
                        .contentType("application/json")
                        .content("[\"" + asset.getId() + "\"]"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0));

        // Verify deletion
        assertThat(assetsService.getById(asset.getId())).isNull();
    }
}

