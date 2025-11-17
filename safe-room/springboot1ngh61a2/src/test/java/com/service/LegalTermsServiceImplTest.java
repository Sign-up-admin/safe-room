package com.service;

import com.baomidou.mybatisplus.core.conditions.Wrapper;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.LegalTermsEntity;
import com.utils.PageUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class LegalTermsServiceImplTest {

    @Autowired
    private LegalTermsService legalTermsService;

    @Test
    void shouldReturnPagedLegalTerms() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = legalTermsService.queryPage(params);

        assertThat(result).isNotNull();
        assertThat(result.getList()).isNotNull();
    }

    @Test
    void shouldQueryPageWithWrapper() {
        LegalTermsEntity terms = createLegalTerms("包装器测试", "内容");
        legalTermsService.save(terms);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        QueryWrapper<LegalTermsEntity> wrapper = new QueryWrapper<>();
        wrapper.eq("title", "包装器测试");

        PageUtils result = legalTermsService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldListLegalTerms() {
        LegalTermsEntity terms = createLegalTerms("列表测试", "内容");
        legalTermsService.save(terms);

        List<LegalTermsEntity> allTerms = legalTermsService.list(new QueryWrapper<>());
        assertThat(allTerms).isNotEmpty();
    }

    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = legalTermsService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = legalTermsService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = legalTermsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = legalTermsService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = legalTermsService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldSaveLegalTerms() {
        LegalTermsEntity terms = createLegalTerms("保存测试", "保存内容");
        legalTermsService.save(terms);

        LegalTermsEntity saved = legalTermsService.getById(terms.getId());
        assertThat(saved).isNotNull();
        assertThat(saved.getTitle()).isEqualTo("保存测试");
    }

    @Test
    void shouldUpdateLegalTerms() {
        LegalTermsEntity terms = createLegalTerms("更新前", "更新前内容");
        legalTermsService.save(terms);

        terms.setTitle("更新后");
        terms.setContent("更新后内容");
        legalTermsService.updateById(terms);

        LegalTermsEntity updated = legalTermsService.getById(terms.getId());
        assertThat(updated.getTitle()).isEqualTo("更新后");
    }

    @Test
    void shouldDeleteLegalTerms() {
        LegalTermsEntity terms = createLegalTerms("删除测试", "删除内容");
        legalTermsService.save(terms);

        legalTermsService.removeById(terms.getId());

        LegalTermsEntity deleted = legalTermsService.getById(terms.getId());
        assertThat(deleted).isNull();
    }

    @Test
    void shouldQueryPageWithComplexWrapper() {
        LegalTermsEntity terms1 = createLegalTerms("复杂查询1", "内容1");
        LegalTermsEntity terms2 = createLegalTerms("复杂查询2", "内容2");
        legalTermsService.save(terms1);
        legalTermsService.save(terms2);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "10");

        QueryWrapper<LegalTermsEntity> wrapper = new QueryWrapper<>();
        wrapper.like("title", "复杂查询");

        PageUtils result = legalTermsService.queryPage(params, wrapper);
        assertThat(result).isNotNull();
    }

    private LegalTermsEntity createLegalTerms(String title, String content) {
        LegalTermsEntity entity = new LegalTermsEntity();
        entity.setTitle(title);
        entity.setContent(content);
        entity.setCreateTime(new Date());
        entity.setUpdateTime(new Date());
        return entity;
    }
}

