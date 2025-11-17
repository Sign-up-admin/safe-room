package com.utils;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.assertj.core.api.Assertions.assertThat;

class FileUtilTest {

    @TempDir
    Path tempDir;

    @Test
    void createDirShouldCreateMissingDirectories() {
        Path dir = tempDir.resolve("nested/dir");

        boolean result = FileUtil.createDir(dir.toString());

        assertThat(result).isTrue();
        assertThat(Files.exists(dir)).isTrue();
    }

    @Test
    void deleteFileShouldRemoveExistingFile() throws IOException {
        Path file = Files.createFile(tempDir.resolve("toDelete.txt"));

        boolean deleted = FileUtil.deleteFile(file.toString());

        assertThat(deleted).isTrue();
        assertThat(Files.exists(file)).isFalse();
    }

    @Test
    void existsShouldReturnFalseForInvalidInput() {
        assertThat(FileUtil.exists(null)).isFalse();
        assertThat(FileUtil.exists("")).isFalse();
    }

    @Test
    void getExtensionShouldReturnSubstringAfterLastDot() {
        assertThat(FileUtil.getExtension("image.png")).isEqualTo("png");
        assertThat(FileUtil.getExtension("archive")).isEmpty();
        assertThat(FileUtil.getExtension(null)).isEmpty();
        assertThat(FileUtil.getExtension("")).isEmpty();
    }

    @Test
    void createDirShouldHandleNullAndEmptyPaths() {
        assertThat(FileUtil.createDir(null)).isFalse();
        assertThat(FileUtil.createDir("")).isFalse();
    }

    @Test
    void createDirShouldReturnTrueForExistingDirectory() {
        Path existingDir = tempDir.resolve("existing");
        FileUtil.createDir(existingDir.toString()); // Create first time

        boolean result = FileUtil.createDir(existingDir.toString()); // Create again

        assertThat(result).isTrue();
        assertThat(Files.exists(existingDir)).isTrue();
    }

    @Test
    void createDirShouldCreateParentDirectories() {
        Path deepDir = tempDir.resolve("level1/level2/level3");

        boolean result = FileUtil.createDir(deepDir.toString());

        assertThat(result).isTrue();
        assertThat(Files.exists(deepDir)).isTrue();
    }

    @Test
    void deleteFileShouldHandleNullAndEmptyPaths() {
        assertThat(FileUtil.deleteFile(null)).isFalse();
        assertThat(FileUtil.deleteFile("")).isFalse();
    }

    @Test
    void deleteFileShouldReturnFalseForNonExistentFile() {
        Path nonExistent = tempDir.resolve("does-not-exist.txt");

        boolean result = FileUtil.deleteFile(nonExistent.toString());

        assertThat(result).isFalse();
    }

    @Test
    void deleteFileShouldDeleteDirectories() throws IOException {
        Path dir = Files.createDirectory(tempDir.resolve("toDeleteDir"));

        boolean result = FileUtil.deleteFile(dir.toString());

        assertThat(result).isTrue();
        assertThat(Files.exists(dir)).isFalse();
    }

    @Test
    void existsShouldReturnTrueForExistingFile() throws IOException {
        Path file = Files.createFile(tempDir.resolve("existing.txt"));

        assertThat(FileUtil.exists(file.toString())).isTrue();
    }

    @Test
    void existsShouldReturnTrueForExistingDirectory() throws IOException {
        Path dir = Files.createDirectory(tempDir.resolve("existingDir"));

        assertThat(FileUtil.exists(dir.toString())).isTrue();
    }

    @Test
    void existsShouldReturnFalseForNonExistentPath() {
        Path nonExistent = tempDir.resolve("non-existent");

        assertThat(FileUtil.exists(nonExistent.toString())).isFalse();
    }

    @Test
    void getExtensionShouldHandleVariousFileNames() {
        // Normal cases
        assertThat(FileUtil.getExtension("document.pdf")).isEqualTo("pdf");
        assertThat(FileUtil.getExtension("image.jpeg")).isEqualTo("jpeg");
        assertThat(FileUtil.getExtension("archive.tar.gz")).isEqualTo("gz");

        // Edge cases
        assertThat(FileUtil.getExtension(".hidden")).isEqualTo("hidden");
        assertThat(FileUtil.getExtension("noextension")).isEmpty();
        assertThat(FileUtil.getExtension("multiple.dots.file.txt")).isEqualTo("txt");
        assertThat(FileUtil.getExtension("ends.with.dot.")).isEmpty();
        assertThat(FileUtil.getExtension("just.a.dot.")).isEmpty();
    }

    @Test
    void getExtensionShouldHandleSpecialCharacters() {
        assertThat(FileUtil.getExtension("file with spaces.txt")).isEqualTo("txt");
        assertThat(FileUtil.getExtension("file-with-dashes.pdf")).isEqualTo("pdf");
        assertThat(FileUtil.getExtension("file_with_underscores.jpg")).isEqualTo("jpg");
        assertThat(FileUtil.getExtension("file(1).doc")).isEqualTo("doc");
        assertThat(FileUtil.getExtension("file[1].xls")).isEqualTo("xls");
    }

    @Test
    void getExtensionShouldHandleUnicodeCharacters() {
        assertThat(FileUtil.getExtension("文件.txt")).isEqualTo("txt");
        assertThat(FileUtil.getExtension("файл.pdf")).isEqualTo("pdf");
        assertThat(FileUtil.getExtension("ファイル.jpg")).isEqualTo("jpg");
    }

    @Test
    void operationsShouldHandleRelativePaths() {
        String relativePath = "test-relative-path";

        // Create directory with relative path
        boolean created = FileUtil.createDir(relativePath);
        assertThat(created).isTrue();

        // Check if it exists
        assertThat(FileUtil.exists(relativePath)).isTrue();

        // Delete it
        boolean deleted = FileUtil.deleteFile(relativePath);
        assertThat(deleted).isTrue();
    }
}
