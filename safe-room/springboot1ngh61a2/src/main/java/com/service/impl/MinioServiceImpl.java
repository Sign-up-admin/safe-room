package com.service.impl;

import java.io.InputStream;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.TimeUnit;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import com.config.MinioConfig;
import com.service.MinioService;

import io.minio.GetObjectArgs;
import io.minio.GetObjectResponse;
import io.minio.ListObjectsArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.StatObjectArgs;
import io.minio.StatObjectResponse;
import io.minio.errors.ErrorResponseException;
import io.minio.errors.InsufficientDataException;
import io.minio.errors.InternalException;
import io.minio.errors.InvalidResponseException;
import io.minio.errors.ServerException;
import io.minio.errors.XmlParserException;
import io.minio.http.Method;

/**
 * MinIO服务实现类
 */
@Service
@ConditionalOnProperty(name = "minio.enabled", havingValue = "true", matchIfMissing = false)
public class MinioServiceImpl implements MinioService {

    @Autowired
    private MinioClient minioClient;

    @Autowired
    private MinioConfig minioConfig;

    @Override
    public String uploadFile(String objectName, InputStream inputStream, String contentType, long size)
            throws Exception {
        try {
            // 确保bucket存在
            ensureBucketExists();

            // 上传文件
            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .stream(inputStream, size, -1)
                            .contentType(contentType)
                            .build());

            return objectName;
        } catch (Exception e) {
            throw new Exception("上传文件到MinIO失败: " + e.getMessage(), e);
        }
    }

    @Override
    public String getFileUrl(String objectName) throws Exception {
        return getPresignedUrl(objectName, minioConfig.getPresignedUrlExpiry());
    }

    @Override
    public String getPresignedUrl(String objectName, int expirySeconds) throws Exception {
        try {
            String url = minioClient.getPresignedObjectUrl(
                    io.minio.GetPresignedObjectUrlArgs.builder()
                            .method(Method.GET)
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .expiry(expirySeconds, TimeUnit.SECONDS)
                            .build());
            return url;
        } catch (Exception e) {
            throw new Exception("生成预签名URL失败: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String objectName) throws Exception {
        try {
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
        } catch (Exception e) {
            throw new Exception("删除文件失败: " + e.getMessage(), e);
        }
    }

    @Override
    public boolean fileExists(String objectName) throws Exception {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
            return true;
        } catch (ErrorResponseException e) {
            if (e.errorResponse().code().equals("NoSuchKey")) {
                return false;
            }
            throw new Exception("检查文件是否存在失败: " + e.getMessage(), e);
        } catch (Exception e) {
            throw new Exception("检查文件是否存在失败: " + e.getMessage(), e);
        }
    }

    @Override
    public InputStream getFileInputStream(String objectName) throws Exception {
        try {
            GetObjectResponse response = minioClient.getObject(
                    GetObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
            return response;
        } catch (Exception e) {
            throw new Exception("获取文件输入流失败: " + e.getMessage(), e);
        }
    }

    @Override
    public List<String> listFiles(String prefix) throws Exception {
        try {
            List<String> fileList = new ArrayList<>();
            Iterable<io.minio.Result<io.minio.messages.Item>> results = minioClient.listObjects(
                    ListObjectsArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .prefix(prefix)
                            .recursive(true)
                            .build());
            for (io.minio.Result<io.minio.messages.Item> result : results) {
                try {
                    io.minio.messages.Item item = result.get();
                    if (item != null && !item.isDir()) {
                        fileList.add(item.objectName());
                    }
                } catch (Exception e) {
                    // 忽略单个对象获取失败
                }
            }
            return fileList;
        } catch (Exception e) {
            throw new Exception("列出文件失败: " + e.getMessage(), e);
        }
    }

    @Override
    public long getFileSize(String objectName) throws Exception {
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
            return stat.size();
        } catch (Exception e) {
            throw new Exception("获取文件大小失败: " + e.getMessage(), e);
        }
    }

    @Override
    public String getFileContentType(String objectName) throws Exception {
        try {
            StatObjectResponse stat = minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .object(objectName)
                            .build());
            return stat.contentType();
        } catch (Exception e) {
            throw new Exception("获取文件类型失败: " + e.getMessage(), e);
        }
    }

    /**
     * 确保bucket存在，如果不存在则创建
     */
    private void ensureBucketExists() throws Exception {
        try {
            boolean found = minioClient.bucketExists(
                    io.minio.BucketExistsArgs.builder()
                            .bucket(minioConfig.getBucketName())
                            .build());
            if (!found) {
                minioClient.makeBucket(
                        io.minio.MakeBucketArgs.builder()
                                .bucket(minioConfig.getBucketName())
                                .build());
            }
        } catch (Exception e) {
            throw new Exception("检查或创建bucket失败: " + e.getMessage(), e);
        }
    }
}

