package com.entity;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@ActiveProfiles("test")
class AssetsEntityTest {

    @Test
    void shouldCreateAssetsEntity() {
        AssetsEntity entity = new AssetsEntity();
        assertThat(entity).isNotNull();
    }

    @Test
    void shouldSetAndGetAssetName() {
        AssetsEntity entity = new AssetsEntity();
        String testName = "Test Asset";

        entity.setAssetName(testName);

        assertThat(entity.getAssetName()).isEqualTo(testName);
    }

    @Test
    void shouldSetAndGetAssetType() {
        AssetsEntity entity = new AssetsEntity();
        String testType = "image";

        entity.setAssetType(testType);

        assertThat(entity.getAssetType()).isEqualTo(testType);
    }

    @Test
    void shouldSetAndGetFilePath() {
        AssetsEntity entity = new AssetsEntity();
        String testPath = "/upload/test.jpg";

        entity.setFilePath(testPath);

        assertThat(entity.getFilePath()).isEqualTo(testPath);
    }

    @Test
    void shouldSetAndGetFileSize() {
        AssetsEntity entity = new AssetsEntity();
        Long testSize = 1024L;

        entity.setFileSize(testSize);

        assertThat(entity.getFileSize()).isEqualTo(testSize);
    }

    @Test
    void shouldSetAndGetFileFormat() {
        AssetsEntity entity = new AssetsEntity();
        String testFormat = "png";

        entity.setFileFormat(testFormat);

        assertThat(entity.getFileFormat()).isEqualTo(testFormat);
    }

    @Test
    void shouldSetAndGetModule() {
        AssetsEntity entity = new AssetsEntity();
        String testModule = "test-module";

        entity.setModule(testModule);

        assertThat(entity.getModule()).isEqualTo(testModule);
    }

    @Test
    void shouldSetAndGetUsage() {
        AssetsEntity entity = new AssetsEntity();
        String testUsage = "automation";

        entity.setUsage(testUsage);

        assertThat(entity.getUsage()).isEqualTo(testUsage);
    }

    @Test
    void shouldSetAndGetDimensions() {
        AssetsEntity entity = new AssetsEntity();
        String testDimensions = "128x128";

        entity.setDimensions(testDimensions);

        assertThat(entity.getDimensions()).isEqualTo(testDimensions);
    }

    @Test
    void shouldSetAndGetWidth() {
        AssetsEntity entity = new AssetsEntity();
        Integer testWidth = 128;

        entity.setWidth(testWidth);

        assertThat(entity.getWidth()).isEqualTo(testWidth);
    }

    @Test
    void shouldSetAndGetHeight() {
        AssetsEntity entity = new AssetsEntity();
        Integer testHeight = 128;

        entity.setHeight(testHeight);

        assertThat(entity.getHeight()).isEqualTo(testHeight);
    }

    @Test
    void shouldSetAndGetVersion() {
        AssetsEntity entity = new AssetsEntity();
        String testVersion = "v1.0";

        entity.setVersion(testVersion);

        assertThat(entity.getVersion()).isEqualTo(testVersion);
    }

    @Test
    void shouldSetAndGetDescription() {
        AssetsEntity entity = new AssetsEntity();
        String testDescription = "Test asset description";

        entity.setDescription(testDescription);

        assertThat(entity.getDescription()).isEqualTo(testDescription);
    }

    @Test
    void shouldSetAndGetTags() {
        AssetsEntity entity = new AssetsEntity();
        String testTags = "test,automation";

        entity.setTags(testTags);

        assertThat(entity.getTags()).isEqualTo(testTags);
    }

    @Test
    void shouldSetAndGetCategory() {
        AssetsEntity entity = new AssetsEntity();
        String testCategory = "static";

        entity.setCategory(testCategory);

        assertThat(entity.getCategory()).isEqualTo(testCategory);
    }

    @Test
    void shouldSetAndGetStatus() {
        AssetsEntity entity = new AssetsEntity();
        String testStatus = "active";

        entity.setStatus(testStatus);

        assertThat(entity.getStatus()).isEqualTo(testStatus);
    }
}
