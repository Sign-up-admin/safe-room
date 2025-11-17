package com.controller;

import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.UpdateWrapper;
import com.entity.AssetsEntity;
import com.service.AssetsService;
import com.utils.PageUtils;
import com.utils.R;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Assets management controller
 */
@RestController
@RequestMapping("/assets")
public class AssetsController {

    @Autowired
    private AssetsService assetsService;

    /**
     * Paginated list with filter support.
     */
    @GetMapping("/list")
    public R list(@RequestParam Map<String, Object> params) {
        PageUtils page = assetsService.queryPage(params);
        return R.ok().put("data", page);
    }

    /**
     * Detailed info
     */
    @GetMapping("/info/{id}")
    public R info(@PathVariable("id") Long id) {
        AssetsEntity assets = assetsService.getById(id);
        return assets == null ? R.error("素材不存在") : R.ok().put("data", assets);
    }

    /**
     * Create asset metadata record.
     */
    @PostMapping("/save")
    public R save(@RequestBody AssetsEntity assets) {
        Date now = new Date();
        assets.setAddtime(now);
        assets.setUpdatetime(now);
        assetsService.save(assets);
        return R.ok();
    }

    /**
     * Update asset metadata.
     */
    @PostMapping("/update")
    public R update(@RequestBody AssetsEntity assets) {
        assets.setUpdatetime(new Date());
        assetsService.updateById(assets);
        return R.ok();
    }

    /**
     * Delete single or multiple assets.
     */
    @PostMapping("/delete")
    public R delete(@RequestBody Long[] ids) {
        assetsService.removeByIds(Arrays.asList(ids));
        return R.ok();
    }

    /**
     * Batch delete with query filter (e.g. delete by module/type).
     */
    @PostMapping("/batchDelete")
    public R batchDelete(@RequestBody Map<String, Object> params) {
        QueryWrapper<AssetsEntity> wrapper = new QueryWrapper<>();
        if (params.containsKey("module")) {
            wrapper.eq("module", params.get("module"));
        }
        if (params.containsKey("assetType")) {
            wrapper.eq("asset_type", params.get("assetType"));
        }
        if (params.containsKey("status")) {
            wrapper.eq("status", params.get("status"));
        }
        List<AssetsEntity> targets = assetsService.list(wrapper);
        if (targets.isEmpty()) {
            return R.ok("无可删除的素材");
        }
        assetsService.remove(wrapper);
        return R.ok();
    }

  /**
   * Batch update status.
   */
  @PostMapping("/batchStatus")
  public R batchStatus(@RequestBody Map<String, Object> payload) {
    Object idsObject = payload.get("ids");
    String status = payload.get("status") != null ? payload.get("status").toString() : null;
    if (!(idsObject instanceof List) || StringUtils.isBlank(status)) {
      return R.error("参数不正确");
    }
    List<?> ids = (List<?>) idsObject;
    if (ids.isEmpty()) {
      return R.error("请选择需要更新的素材");
    }
    UpdateWrapper<AssetsEntity> wrapper = new UpdateWrapper<>();
    wrapper.in("id", ids).set("status", status).set("updatetime", new Date());
    assetsService.update(wrapper);
    return R.ok();
  }

    /**
     * Preview asset metadata for quick check.
     */
    @GetMapping("/preview/{id}")
    public R preview(@PathVariable("id") Long id) {
        AssetsEntity asset = assetsService.getById(id);
        if (asset == null) {
            return R.error("素材不存在");
        }
        Map<String, Object> payload = new HashMap<>();
        payload.put("id", asset.getId());
        payload.put("assetName", asset.getAssetName());
        payload.put("assetType", asset.getAssetType());
        payload.put("filePath", asset.getFilePath());
        payload.put("fileFormat", asset.getFileFormat());
        payload.put("fileSize", asset.getFileSize());
        payload.put("dimensions", asset.getDimensions());
        payload.put("width", asset.getWidth());
        payload.put("height", asset.getHeight());
        payload.put("module", asset.getModule());
        payload.put("usage", asset.getUsage());
        payload.put("version", asset.getVersion());
        payload.put("status", asset.getStatus());
        payload.put("tags", StringUtils.defaultString(asset.getTags()));
        payload.put("category", asset.getCategory());
        return R.ok().put("data", payload);
    }
}

