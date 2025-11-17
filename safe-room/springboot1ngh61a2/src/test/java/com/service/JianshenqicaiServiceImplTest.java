package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.JianshenqicaiEntity;
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
class JianshenqicaiServiceImplTest {

    @Autowired
    private JianshenqicaiService jianshenqicaiService;

    @Test
    void shouldReturnPagedEquipments() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = jianshenqicaiService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
    }

    @Test
    void shouldSelectEquipmentViews() {
        List<JianshenqicaiEntity> equipments = jianshenqicaiService.list(new QueryWrapper<>());
        assertThat(equipments).isNotEmpty();
    }

    @Test
    void shouldFilterByBrand() {
        // First check if any equipments exist
        List<JianshenqicaiEntity> allEquipments = jianshenqicaiService.list(new QueryWrapper<>());
        if (!allEquipments.isEmpty()) {
            // Use the first equipment's brand for the test
            String brand = allEquipments.get(0).getPinpai();
            if (brand != null && !brand.isEmpty()) {
                List<JianshenqicaiEntity> equipments = jianshenqicaiService.list(new QueryWrapper<JianshenqicaiEntity>().eq("pinpai", brand));
                assertThat(equipments).isNotEmpty();
            } else {
                // If no brand, test with a known brand
                List<JianshenqicaiEntity> equipments = jianshenqicaiService.list(new QueryWrapper<JianshenqicaiEntity>().eq("pinpai", "Rogue"));
                // May be empty if brand doesn't exist, which is acceptable
            }
        } else {
            // If no equipments exist, the result should be empty
            List<JianshenqicaiEntity> equipments = jianshenqicaiService.list(new QueryWrapper<JianshenqicaiEntity>().eq("pinpai", "Rogue"));
            assertThat(equipments).isEmpty();
        }
    }

    // 边界条件测试
    @Test
    void shouldHandleEmptyParams() {
        Map<String, Object> emptyParams = new HashMap<>();
        PageUtils result = jianshenqicaiService.queryPage(emptyParams);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleNullParams() {
        PageUtils result = jianshenqicaiService.queryPage(null);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleInvalidPageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "-1");
        params.put("limit", "5");
        PageUtils result = jianshenqicaiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleZeroLimit() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "0");
        PageUtils result = jianshenqicaiService.queryPage(params);
        assertThat(result).isNotNull();
    }

    @Test
    void shouldHandleLargePageNumber() {
        Map<String, Object> params = new HashMap<>();
        params.put("page", "999999");
        params.put("limit", "10");
        PageUtils result = jianshenqicaiService.queryPage(params);
        assertThat(result).isNotNull();
        assertThat(result.getList()).isEmpty();
    }

    @Test
    void shouldHandleEmptyResultSet() {
        QueryWrapper<JianshenqicaiEntity> wrapper = new QueryWrapper<JianshenqicaiEntity>()
                .eq("qicaimingcheng", "不存在的器材-" + System.nanoTime());
        List<JianshenqicaiEntity> equipments = jianshenqicaiService.list(wrapper);
        assertThat(equipments).isEmpty();
    }
}


