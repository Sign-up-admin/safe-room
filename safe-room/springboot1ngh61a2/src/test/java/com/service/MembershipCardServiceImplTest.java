package com.service;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.MembershipCardEntity;
import com.entity.view.MembershipCardView;
import com.utils.PageUtils;
import com.utils.TestUtils;
import org.junit.jupiter.api.AfterEach;
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
class MembershipCardServiceImplTest {

    @Autowired
    private MembershipCardService membershipCardService;

    @AfterEach
    void cleanupTestData() {
        // Clean up test data to prevent conflicts between test runs
        membershipCardService.remove(new QueryWrapper<MembershipCardEntity>()
                .like("membership_card_name", "自动化")
                .or()
                .like("membership_card_name", "黑金会员")
                .or()
                .like("membership_card_name", "列表校验卡"));
    }

    @Test
    void shouldQueryPagedMembershipCards() {
        membershipCardService.save(TestUtils.createMembershipCardEntity("自动化体验卡", 1288, "12个月", "通用课程"));

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils page = membershipCardService.queryPage(params);

        assertThat(page.getList()).isNotEmpty();
        assertThat(page.getTotal()).isGreaterThanOrEqualTo(page.getList().size());
    }

    @Test
    void shouldFilterCardsUsingWrapperQuery() {
        MembershipCardEntity entity = new MembershipCardEntity<>();
        entity.setMembershipCardName("自动化年度卡");
        entity.setPrice(1888);
        entity.setValidityPeriod("18个月");
        membershipCardService.save(entity);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils page = membershipCardService.queryPage(params,
                new QueryWrapper<MembershipCardEntity>().eq("membership_card_name", "自动化年度卡"));

        assertThat(page.getList())
                .extracting(MembershipCardView.class::cast)
                .anyMatch(view -> "自动化年度卡".equals(view.getMembershipCardName()));
    }

    @Test
    void shouldSelectListViewAndVo() {
        String uniqueName = "列表校验卡-" + System.nanoTime();
        MembershipCardEntity marker = TestUtils.createMembershipCardEntity(uniqueName, 1999, "24个月", "含私教");
        membershipCardService.save(marker);

        List<MembershipCardView> views = membershipCardService.selectListView(
                new QueryWrapper<MembershipCardEntity>().eq("membership_card_name", uniqueName));

        assertThat(views).isNotEmpty();
        assertThat(membershipCardService.selectVO(
                new QueryWrapper<MembershipCardEntity>().eq("membership_card_name", uniqueName))).isNotNull();
    }

    @Test
    void shouldPersistAndQueryMembershipCards() {
        // Use a unique name to avoid conflicts
        String uniqueName = "黑金会员-" + System.nanoTime();
        MembershipCardEntity card = TestUtils.createMembershipCardEntity(uniqueName, 3888, "36个月", "无限次通行");
        // Remove if exists to avoid duplicate key error
        membershipCardService.remove(new QueryWrapper<MembershipCardEntity>().eq("membership_card_name", uniqueName));
        membershipCardService.save(card);

        Map<String, Object> params = new HashMap<>();
        params.put("page", "1");
        params.put("limit", "5");

        PageUtils result = membershipCardService.queryPage(params);

        assertThat(result.getList()).isNotEmpty();
        MembershipCardEntity savedCard = membershipCardService.getById(card.getId());
        assertThat(savedCard).isNotNull();
        assertThat(savedCard.getMembershipCardName()).isEqualTo(uniqueName);
    }
}

