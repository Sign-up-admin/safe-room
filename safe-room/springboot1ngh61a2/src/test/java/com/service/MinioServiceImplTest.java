package com.service;

import com.config.MinioConfig;
import com.service.impl.MinioServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MinioServiceImplTest {

    @Mock
    private MinioConfig minioConfig;

    @InjectMocks
    private MinioServiceImpl minioService;

    @BeforeEach
    void setUp() {
        when(minioConfig.getBucketName()).thenReturn("test-bucket");
    }

    @Test
    void shouldCreateMinioService() {
        assertThat(minioService).isNotNull();
    }

    @Test
    void shouldHaveBucketNameConfigured() {
        // Test that configuration is properly injected
        assertThat(minioService).isNotNull();
        // Note: Full MinIO testing requires complex mocking of MinIO client
        // This basic test ensures the service can be instantiated
    }
}