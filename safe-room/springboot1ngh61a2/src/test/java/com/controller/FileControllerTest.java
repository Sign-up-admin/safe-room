package com.controller;

import com.controller.support.AbstractControllerIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.util.ResourceUtils;
import org.junit.jupiter.api.AfterEach;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class FileControllerTest extends AbstractControllerIntegrationTest {

    @AfterEach
    void cleanupTestFiles() {
        // 清理可能遗漏的测试文件
        // 注意：主要的文件清理在每个测试方法中进行，此处作为兜底清理
        try {
            // 清理upload目录下的测试文件
            File uploadDir = getUploadDirectory();
            if (uploadDir.exists() && uploadDir.isDirectory()) {
                File[] files = uploadDir.listFiles((dir, name) ->
                    name.startsWith("hello.txt") ||
                    name.startsWith("download.txt") ||
                    name.startsWith("cover.png") ||
                    name.startsWith("large.png") ||
                    name.startsWith("empty.txt") ||
                    name.startsWith("malware.exe"));
                if (files != null) {
                    for (File file : files) {
                        if (file.exists() && !file.delete()) {
                            file.deleteOnExit();
                        }
                    }
                }
            }
        } catch (Exception e) {
            // 忽略清理过程中的异常
        }
    }

    @Test
    void shouldUploadFileAndReturnName() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "hello.txt",
                "text/plain",
                "hello world".getBytes()
        );

        var uploadResult = mockMvc.perform(multipart("/file/upload").file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.file").isString())
                .andReturn();

        String fileName = objectMapper.readTree(uploadResult.getResponse().getContentAsString()).path("file").asText();
        assertThat(fileName).isNotBlank();
        deleteUploadedFile(fileName);
    }

    @Test
    void shouldDownloadPreviouslyUploadedFile() throws Exception {
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "download.txt",
                "text/plain",
                "download me".getBytes()
        );

        var uploadResult = mockMvc.perform(multipart("/file/upload").file(file))
                .andExpect(status().isOk())
                .andReturn();

        String fileName = objectMapper.readTree(uploadResult.getResponse().getContentAsString()).path("file").asText();

        mockMvc.perform(get("/file/download").param("fileName", fileName))
                .andExpect(status().isCreated());

        deleteUploadedFile(fileName);
    }

    @Test
    void shouldRejectEmptyUploadPayload() throws Exception {
        MockMultipartFile emptyFile = new MockMultipartFile(
                "file",
                "empty.txt",
                "text/plain",
                new byte[0]
        );

        mockMvc.perform(multipart("/file/upload").file(emptyFile))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("上传文件不能为空"));
    }

    @Test
    void shouldReturnServerErrorForMissingDownload() throws Exception {
        mockMvc.perform(get("/file/download").param("fileName", "non-existent.txt"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    void shouldUploadAssetAndPersistMetadata() throws Exception {
        MockMultipartFile image = createSamplePng("cover.png");

        MvcResult result = performAdmin(multipart("/file/uploadAsset")
                        .file(image)
                        .param("module", "homepage")
                        .param("usage", "hero")
                        .param("version", "v2")
                        .param("tags", "banner,fitness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(0))
                .andExpect(jsonPath("$.assetId").isNumber())
                .andExpect(jsonPath("$.width").value(2))
                .andReturn();

        String assetPath = objectMapper.readTree(result.getResponse().getContentAsString()).path("file").asText();
        deleteAssetFile(assetPath);
    }

    @Test
    void shouldRejectUnsupportedAssetExtension() throws Exception {
        MockMultipartFile payload = new MockMultipartFile(
                "file",
                "malware.exe",
                "application/octet-stream",
                new byte[]{0x01, 0x02}
        );

        performAdmin(multipart("/file/uploadAsset").file(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("文件格式不被支持: exe"));
    }

    @Test
    void shouldRejectOversizedImageUploads() throws Exception {
        byte[] oversized = new byte[4 * 1024 * 1024];
        MockMultipartFile payload = new MockMultipartFile(
                "file",
                "large.png",
                "image/png",
                oversized
        );

        performAdmin(multipart("/file/uploadAsset").file(payload))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.code").value(500))
                .andExpect(jsonPath("$.msg").value("文件体积超过限制: 3MB"));
    }

    private void deleteUploadedFile(String fileName) throws Exception {
        File path = new File(ResourceUtils.getURL("classpath:static").getPath());
        if (!path.exists()) {
            path = new File("");
        }
        File uploadDir = new File(path.getAbsolutePath(), "/upload/");
        File target = new File(uploadDir.getAbsolutePath() + "/" + fileName);
        if (target.exists() && !target.delete()) {
            target.deleteOnExit();
        }
    }

    private void deleteAssetFile(String assetPath) throws Exception {
        File path = new File(ResourceUtils.getURL("classpath:static").getPath());
        if (!path.exists()) {
            path = new File("");
        }
        String relative = assetPath.startsWith("/") ? assetPath.substring(1) : assetPath;
        File target = new File(path.getAbsolutePath(), relative);
        if (target.exists() && !target.delete()) {
            target.deleteOnExit();
        }
    }

    private MockMultipartFile createSamplePng(String filename) throws IOException {
        BufferedImage image = new BufferedImage(2, 2, BufferedImage.TYPE_INT_RGB);
        image.setRGB(0, 0, 0xFF0000);
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return new MockMultipartFile("file", filename, "image/png", baos.toByteArray());
    }

    private File getUploadDirectory() throws Exception {
        File path = new File(ResourceUtils.getURL("classpath:static").getPath());
        if (!path.exists()) {
            path = new File("");
        }
        return new File(path.getAbsolutePath(), "/upload/");
    }
}


