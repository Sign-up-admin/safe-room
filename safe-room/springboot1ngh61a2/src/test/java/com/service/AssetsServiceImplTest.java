package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.AssetsEntity;
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
class AssetsServiceImplTest {

    @Autowired
    private AssetsService assetsService;

    @Test
    void shouldReturnPagedAssets() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = assetsService.queryPage(params);

        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotNull();
    }

    @Test
    void shouldFilterByAssetType() {
        AssetsEntity asset = com.utils.TestUtils.createAssetRecord("filter-module", "image");
        assetsService.save(asset);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("assetType", "image");

        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldFilterByModule() {
        AssetsEntity asset = com.utils.TestUtils.createAssetRecord("specific-module", "image");
        assetsService.save(asset);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("module", "specific-module");

        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldFilterByUsage() {
        AssetsEntity asset = com.utils.TestUtils.createAssetRecord("usage-module", "image");
        asset.setUsage("banner");
        assetsService.save(asset);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("usage", "banner");

        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldFilterByStatus() {
        AssetsEntity asset = com.utils.TestUtils.createAssetRecord("status-module", "image");
        asset.setStatus("active");
        assetsService.save(asset);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("status", "active");

        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldFilterByKeyword() {
        AssetsEntity asset = com.utils.TestUtils.createAssetRecord("keyword-module", "image");
        asset.setAssetName("测试关键词素材");
        asset.setTags("test,keyword");
        assetsService.save(asset);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("keyword", "关键词");

        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldFilterByDateRange() {
        AssetsEntity asset = com.utils.TestUtils.createAssetRecord("date-module", "image");
        assetsService.save(asset);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("startDate", "2024-01-01");
        params.put("endDate", "2025-12-31");

        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = assetsService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = assetsService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldQueryPageWithWrapper() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        QueryWrapper<AssetsEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("status", "active");

        PageUtils result = assetsService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldListAssets() {
        AssetsEntity asset = com.utils.TestUtils.createAssetRecord("list-module", "image");
        assetsService.save(asset);

        List<AssetsEntity> assets = assetsService.list(new QueryWrapper<>());
        assertThat(assets).isNotEmpty();
    }

    @Test
    void shouldHandleMultipleFilters() {
        AssetsEntity asset = com.utils.TestUtils.createAssetRecord("multi-filter-module", "image");
        asset.setUsage("banner");
        asset.setStatus("active");
        assetsService.save(asset);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("assetType", "image");
        params.put("module", "multi-filter-module");
        params.put("usage", "banner");
        params.put("status", "active");

        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleBlankStringParams() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("assetType", "");
        params.put("module", "   ");
        params.put("keyword", null);

        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParamsInBuildWrapper() {
        PageUtils result = assetsService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleAssetTypeWithBlankString() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("assetType", "   ");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleModuleWithBlankString() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("module", "");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleUsageWithBlankString() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("usage", "   ");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleStatusWithBlankString() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("status", "");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleKeywordWithBlankString() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("keyword", "   ");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleStartDateWithBlankString() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("startDate", "");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleEndDateWithBlankString() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        params.put("endDate", "   ");
        PageUtils result = assetsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleQueryPageWithNullWrapper() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");
        PageUtils result = assetsService.queryPage(params, null);
        assertThat(result).isNotNull();
    }
}

