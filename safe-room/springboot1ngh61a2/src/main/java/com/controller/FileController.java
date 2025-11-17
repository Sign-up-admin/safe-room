package com.controller;

import java.awt.image.BufferedImage;
import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

import javax.imageio.ImageIO;

import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpRange;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.ResourceUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.annotation.IgnoreAuth;
import com.baomidou.mybatisplus.core.conditions.query.QueryWrapper;
import com.entity.AssetsEntity;
import com.entity.ConfigEntity;
import com.entity.EIException;
import com.service.AssetsService;
import com.service.ConfigService;
import com.service.MinioService;
import com.utils.R;

/**
 * 上传文件映射�? */
@RestController
@RequestMapping("file")
@SuppressWarnings({"unchecked","rawtypes"})
public class FileController{
	@Autowired
    private ConfigService configService;
	@Autowired
	private AssetsService assetsService;
	@Autowired(required = false)
	private MinioService minioService;

	@Value("${minio.enabled:false}")
	private boolean minioEnabled;

	private static final List<String> IMAGE_EXTENSIONS = Arrays.asList("jpg", "jpeg", "png", "webp", "gif", "bmp");
	private static final List<String> VIDEO_EXTENSIONS = Arrays.asList("mp4", "webm", "mov", "mkv", "avi", "flv");
	private static final List<String> ICON_EXTENSIONS = Arrays.asList("svg");
	private static final List<String> MODEL_EXTENSIONS = Arrays.asList("glb", "gltf");
	private static final List<String> LOTTIE_EXTENSIONS = Arrays.asList("json");
	private static final long DEFAULT_MAX_SIZE = 30L * 1024 * 1024;

	/**
	 * 上传文件（增强安全）
	 */
	@RequestMapping("/upload")
    @IgnoreAuth
	public R upload(@RequestParam("file") MultipartFile file,String type) throws Exception {
		if (file.isEmpty()) {
			throw new EIException("上传文件不能为空");
		}
		
		// 获取文件扩展名
		String originalFilename = file.getOriginalFilename();
		if (originalFilename == null || !originalFilename.contains(".")) {
			throw new EIException("文件名格式不正确");
		}
		String fileExt = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
		
		// 验证文件类型（白名单）
		boolean isAllowed = IMAGE_EXTENSIONS.contains(fileExt) || 
		                   VIDEO_EXTENSIONS.contains(fileExt) || 
		                   ICON_EXTENSIONS.contains(fileExt) || 
		                   MODEL_EXTENSIONS.contains(fileExt) || 
		                   LOTTIE_EXTENSIONS.contains(fileExt);
		if (!isAllowed) {
			throw new EIException("不支持的文件类型: " + fileExt);
		}
		
		// 验证文件大小
		long fileSize = file.getSize();
		long maxSize = DEFAULT_MAX_SIZE;
		if (IMAGE_EXTENSIONS.contains(fileExt)) {
			maxSize = 3L * 1024 * 1024; // 3MB for images
		} else if (VIDEO_EXTENSIONS.contains(fileExt)) {
			maxSize = 60L * 1024 * 1024; // 60MB for videos
		}
		if (fileSize > maxSize) {
			throw new EIException("文件大小超过限制: " + (maxSize / 1024 / 1024) + "MB");
		}
		
		File path = new File(ResourceUtils.getURL("classpath:static").getPath());
		if(!path.exists()) {
		    path = new File("");
		}
		File upload = new File(path.getAbsolutePath(),"/upload/");
		if(!upload.exists()) {
		    upload.mkdirs();
		}
		
		// 使用UUID重命名文件，防止路径遍历和文件名冲突
		String fileName;
        if(StringUtils.isNotBlank(type) && type.contains("_template")) {
            fileName = type + "."+fileExt;
            new File(upload.getAbsolutePath()+"/"+fileName).deleteOnExit();
        } else {
        	// 使用UUID + 时间戳确保唯一性
        	fileName = java.util.UUID.randomUUID().toString().replace("-", "") + "_" + System.currentTimeMillis() + "." + fileExt;
        }
        
		// 验证文件名，防止路径遍历
		if (fileName.contains("..") || fileName.contains("/") || fileName.contains("\\")) {
			throw new EIException("文件名包含非法字符");
		}
		
		File dest = new File(upload.getAbsolutePath() + "/" + fileName);
		file.transferTo(dest);
		/**
  		 * 如果使用idea或者eclipse重启项目，发现之前上传的图片或者文件丢失，将下面一行代码注释打开
   		 * 请将以下�?D:\\springbootq33sd\\src\\main\\resources\\static\\upload"替换成你本地项目的upload路径�? 		 * 并且项目路径不能存在中文、空格等特殊字符
 		 */
//		FileUtils.copyFile(dest, new File("D:\\springbootq33sd\\src\\main\\resources\\static\\upload"+"/"+fileName)); /**修改了路径以后请将该行最前面�?/注释去掉**/
		if(StringUtils.isNotBlank(type) && type.equals("1")) {
			ConfigEntity configEntity = configService.getOne(new QueryWrapper<ConfigEntity>().eq("name", "faceFile"));
			if(configEntity==null) {
				configEntity = new ConfigEntity();
				configEntity.setName("faceFile");
				configEntity.setValue(fileName);
			} else {
				configEntity.setValue(fileName);
			}
			configService.saveOrUpdate(configEntity);
		}
		return R.ok().put("file", fileName);
	}
	
	/**
	 * 下载文件
	 */
	@IgnoreAuth
	@RequestMapping("/download")
	public ResponseEntity<byte[]> download(@RequestParam String fileName) {
		try {
			byte[] fileData;
			if (minioEnabled && minioService != null) {
				// 从MinIO下载
				String objectName = fileName.startsWith("upload/") ? fileName : "upload/" + fileName;
				if (!minioService.fileExists(objectName)) {
					return new ResponseEntity<byte[]>(HttpStatus.NOT_FOUND);
				}
				InputStream inputStream = minioService.getFileInputStream(objectName);
				fileData = IOUtils.toByteArray(inputStream);
				inputStream.close();
			} else {
				// 从本地文件系统下载
				File path = new File(ResourceUtils.getURL("classpath:static").getPath());
				if (!path.exists()) {
					path = new File("");
				}
				File upload = new File(path.getAbsolutePath(), "/upload/");
				if (!upload.exists()) {
					upload.mkdirs();
				}
				File file = new File(upload.getAbsolutePath() + "/" + fileName);
				if (!file.exists()) {
					return new ResponseEntity<byte[]>(HttpStatus.NOT_FOUND);
				}
				fileData = FileUtils.readFileToByteArray(file);
			}
			
			HttpHeaders headers = new HttpHeaders();
			headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
			headers.setContentDispositionFormData("attachment", fileName);
			return new ResponseEntity<byte[]>(fileData, headers, HttpStatus.OK);
		} catch (IOException e) {
			e.printStackTrace();
			return new ResponseEntity<byte[]>(HttpStatus.INTERNAL_SERVER_ERROR);
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<byte[]>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * 素材上传（含元数据记录）
	 */
	@PostMapping("/uploadAsset")
	public R uploadAsset(@RequestParam("file") MultipartFile file,
						 @RequestParam(value = "assetName", required = false) String assetName,
						 @RequestParam(value = "assetType", required = false) String assetType,
						 @RequestParam(value = "module", required = false) String module,
						 @RequestParam(value = "usage", required = false) String usage,
						 @RequestParam(value = "version", required = false) String version,
						 @RequestParam(value = "tags", required = false) String tags,
						 @RequestParam(value = "category", required = false) String category,
						 @RequestParam(value = "status", required = false) String status,
						 @RequestParam(value = "description", required = false) String description,
						 @RequestParam(value = "uploadUser", required = false) String uploadUser) throws Exception {
		if (file == null || file.isEmpty()) {
			throw new EIException("上传文件不能为空");
		}
		String originalFilename = file.getOriginalFilename();
		String fileExt = originalFilename.substring(originalFilename.lastIndexOf(".") + 1).toLowerCase();
		validateExtension(fileExt);
		validateSize(fileExt, file.getSize());

		String resolvedAssetType = StringUtils.defaultIfBlank(assetType, resolveAssetType(fileExt));
		String resolvedModule = sanitizeDirectory(StringUtils.defaultIfBlank(module, "general"));
		String resolvedUsage = sanitizeDirectory(StringUtils.defaultIfBlank(usage, "general"));
		String resolvedVersion = StringUtils.defaultIfBlank(version, "v1");
		String resolvedCategory = StringUtils.defaultIfBlank(category, "static");
		String resolvedStatus = StringUtils.defaultIfBlank(status, "active");

		String cleanBaseName = sanitizeFileName(StringUtils.defaultIfBlank(assetName, originalFilename));
		String finalName = cleanBaseName + "_" + resolvedUsage + "_" + resolvedVersion + "_" + System.currentTimeMillis()
				+ "." + fileExt;
		String filePath;

		Integer width = null;
		Integer height = null;
		String dimensions = null;

		if (minioEnabled && minioService != null) {
			// 使用MinIO存储
			String objectName = "upload/assets/" + resolvedModule + "/" + resolvedAssetType + "/" + finalName;
			String contentType = file.getContentType();
			if (contentType == null) {
				contentType = getContentTypeByExtension(fileExt);
			}
			minioService.uploadFile(objectName, file.getInputStream(), contentType, file.getSize());
			filePath = objectName;

			// 读取图片尺寸
			if (IMAGE_EXTENSIONS.contains(fileExt)) {
				try {
					InputStream imageStream = minioService.getFileInputStream(objectName);
					BufferedImage image = ImageIO.read(imageStream);
					if (image != null) {
						width = image.getWidth();
						height = image.getHeight();
						dimensions = width + "x" + height;
					}
					imageStream.close();
				} catch (IOException ignored) {
				}
			}
		} else {
			// 使用本地文件系统存储
			File path = new File(ResourceUtils.getURL("classpath:static").getPath());
			if (!path.exists()) {
				path = new File("");
			}
			File uploadRoot = new File(path.getAbsolutePath(),
					"/upload/assets/" + resolvedModule + "/" + resolvedAssetType + "/");
			if (!uploadRoot.exists()) {
				uploadRoot.mkdirs();
			}
			File dest = new File(uploadRoot, finalName);
			file.transferTo(dest);
			filePath = "/upload/assets/" + resolvedModule + "/" + resolvedAssetType + "/" + finalName;

			// 读取图片尺寸
			if (IMAGE_EXTENSIONS.contains(fileExt)) {
				try {
					BufferedImage image = ImageIO.read(dest);
					if (image != null) {
						width = image.getWidth();
						height = image.getHeight();
						dimensions = width + "x" + height;
					}
				} catch (IOException ignored) {
				}
			}
		}

		Date now = new Date();
		AssetsEntity assets = new AssetsEntity<>();
		assets.setAssetName(StringUtils.defaultIfBlank(assetName, originalFilename));
		assets.setAssetType(resolvedAssetType);
		assets.setFilePath(filePath.replace("//", "/"));
		assets.setFileSize(file.getSize());
		assets.setFileFormat(fileExt);
		assets.setModule(resolvedModule);
		assets.setUsage(resolvedUsage);
		assets.setDimensions(dimensions);
		assets.setWidth(width);
		assets.setHeight(height);
		assets.setVersion(resolvedVersion);
		assets.setDescription(description);
		assets.setTags(tags);
		assets.setCategory(resolvedCategory);
		assets.setStatus(resolvedStatus);
		assets.setUploadUser(uploadUser);
		assets.setAddtime(now);
		assets.setUpdatetime(now);
		assetsService.save(assets);

		return R.ok()
				.put("file", assets.getFilePath())
				.put("assetId", assets.getId())
				.put("width", width)
				.put("height", height)
				.put("dimensions", dimensions);
	}

	private void validateExtension(String ext) {
		boolean allowed = IMAGE_EXTENSIONS.contains(ext)
				|| VIDEO_EXTENSIONS.contains(ext)
				|| ICON_EXTENSIONS.contains(ext)
				|| MODEL_EXTENSIONS.contains(ext)
				|| LOTTIE_EXTENSIONS.contains(ext);
		if (!allowed) {
			throw new EIException("文件格式不被支持: " + ext);
		}
	}

	private void validateSize(String ext, long size) {
		long limit = DEFAULT_MAX_SIZE;
		if (IMAGE_EXTENSIONS.contains(ext)) {
			limit = 3L * 1024 * 1024;
		} else if (VIDEO_EXTENSIONS.contains(ext)) {
			limit = 60L * 1024 * 1024;
		}
		if (size > limit) {
			throw new EIException("文件体积超过限制: " + (limit / 1024 / 1024) + "MB");
		}
	}

	private String resolveAssetType(String ext) {
		if (IMAGE_EXTENSIONS.contains(ext)) {
			return "image";
		}
		if (VIDEO_EXTENSIONS.contains(ext)) {
			return "video";
		}
		if (ICON_EXTENSIONS.contains(ext)) {
			return "icon";
		}
		if (MODEL_EXTENSIONS.contains(ext)) {
			return "model";
		}
		if (LOTTIE_EXTENSIONS.contains(ext)) {
			return "lottie";
		}
		return "other";
	}

	private String sanitizeDirectory(String input) {
		return input.replaceAll("[^a-zA-Z0-9_-]", "-").toLowerCase();
	}

	private String sanitizeFileName(String input) {
		String base = input.contains(".") ? input.substring(0, input.lastIndexOf(".")) : input;
		return base.replaceAll("[^a-zA-Z0-9_-]", "-").toLowerCase();
	}

	/**
	 * 根据扩展名获取Content-Type
	 */
	private String getContentTypeByExtension(String ext) {
		String lowerExt = ext.toLowerCase();
		if (IMAGE_EXTENSIONS.contains(lowerExt)) {
			return "image/" + (lowerExt.equals("jpg") ? "jpeg" : lowerExt);
		}
		if (VIDEO_EXTENSIONS.contains(lowerExt)) {
			return "video/" + lowerExt;
		}
		if (lowerExt.equals("svg")) {
			return "image/svg+xml";
		}
		return "application/octet-stream";
	}

	/**
	 * 视频在线播放接口（支持Range请求）
	 */
	@GetMapping("/video/{fileName:.+}")
	@IgnoreAuth
	public ResponseEntity<byte[]> streamVideo(
			@PathVariable String fileName,
			@RequestHeader(value = "Range", required = false) String rangeHeader) {
		try {
			InputStream inputStream;
			long fileSize;
			String contentType;

			if (minioEnabled && minioService != null) {
				// 从MinIO获取
				String objectName = fileName.startsWith("upload/") ? fileName : "upload/" + fileName;
				if (!minioService.fileExists(objectName)) {
					return new ResponseEntity<byte[]>(HttpStatus.NOT_FOUND);
				}
				inputStream = minioService.getFileInputStream(objectName);
				fileSize = minioService.getFileSize(objectName);
				contentType = minioService.getFileContentType(objectName);
			} else {
				// 从本地文件系统获取
				File path = new File(ResourceUtils.getURL("classpath:static").getPath());
				if (!path.exists()) {
					path = new File("");
				}
				File upload = new File(path.getAbsolutePath(), "/upload/");
				File file = new File(upload.getAbsolutePath() + "/" + fileName);
				if (!file.exists()) {
					return new ResponseEntity<byte[]>(HttpStatus.NOT_FOUND);
				}
				inputStream = FileUtils.openInputStream(file);
				fileSize = file.length();
				String ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
				contentType = getContentTypeByExtension(ext);
			}

			if (contentType == null || !contentType.startsWith("video/")) {
				contentType = "video/mp4";
			}

			// 处理Range请求
			if (rangeHeader != null && rangeHeader.startsWith("bytes=")) {
				String range = rangeHeader.substring(6);
				String[] ranges = range.split("-");
				long start = 0;
				long end = fileSize - 1;

				if (ranges.length > 0 && !ranges[0].isEmpty()) {
					start = Long.parseLong(ranges[0]);
				}
				if (ranges.length > 1 && !ranges[1].isEmpty()) {
					end = Long.parseLong(ranges[1]);
				}

				long contentLength = end - start + 1;
				byte[] buffer = new byte[(int) contentLength];
				inputStream.skip(start);
				int bytesRead = inputStream.read(buffer, 0, (int) contentLength);
				inputStream.close();

				HttpHeaders headers = new HttpHeaders();
				headers.setContentType(MediaType.parseMediaType(contentType));
				headers.setContentLength(bytesRead);
				headers.set("Content-Range", "bytes " + start + "-" + end + "/" + fileSize);
				headers.set("Accept-Ranges", "bytes");

				return new ResponseEntity<byte[]>(buffer, headers, HttpStatus.PARTIAL_CONTENT);
			} else {
				// 完整文件响应
				byte[] fileData = IOUtils.toByteArray(inputStream);
				inputStream.close();

				HttpHeaders headers = new HttpHeaders();
				headers.setContentType(MediaType.parseMediaType(contentType));
				headers.setContentLength(fileSize);
				headers.set("Accept-Ranges", "bytes");

				return new ResponseEntity<byte[]>(fileData, headers, HttpStatus.OK);
			}
		} catch (Exception e) {
			e.printStackTrace();
			return new ResponseEntity<byte[]>(HttpStatus.INTERNAL_SERVER_ERROR);
		}
	}

	/**
	 * 获取视频元数据信息
	 */
	@GetMapping("/video/info/{fileName:.+}")
	@IgnoreAuth
	public R getVideoInfo(@PathVariable String fileName) {
		try {
			long fileSize;
			String contentType;

			if (minioEnabled && minioService != null) {
				String objectName = fileName.startsWith("upload/") ? fileName : "upload/" + fileName;
				if (!minioService.fileExists(objectName)) {
					return R.error(404, "文件不存在");
				}
				fileSize = minioService.getFileSize(objectName);
				contentType = minioService.getFileContentType(objectName);
			} else {
				File path = new File(ResourceUtils.getURL("classpath:static").getPath());
				if (!path.exists()) {
					path = new File("");
				}
				File upload = new File(path.getAbsolutePath(), "/upload/");
				File file = new File(upload.getAbsolutePath() + "/" + fileName);
				if (!file.exists()) {
					return R.error(404, "文件不存在");
				}
				fileSize = file.length();
				String ext = fileName.substring(fileName.lastIndexOf(".") + 1).toLowerCase();
				contentType = getContentTypeByExtension(ext);
			}

			return R.ok()
					.put("fileName", fileName)
					.put("fileSize", fileSize)
					.put("contentType", contentType)
					.put("format", contentType != null && contentType.contains("/") 
							? contentType.substring(contentType.indexOf("/") + 1) : "unknown");
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("获取视频信息失败: " + e.getMessage());
		}
	}

	/**
	 * 获取文件预览URL
	 */
	@GetMapping("/preview/{fileName:.+}")
	@IgnoreAuth
	public R getPreviewUrl(@PathVariable String fileName) {
		try {
			String url;
			if (minioEnabled && minioService != null) {
				String objectName = fileName.startsWith("upload/") ? fileName : "upload/" + fileName;
				if (!minioService.fileExists(objectName)) {
					return R.error(404, "文件不存在");
				}
				url = minioService.getFileUrl(objectName);
			} else {
				// 本地文件系统，返回相对路径
				url = "/springboot1ngh61a2/file/download?fileName=" + fileName;
			}
			return R.ok().put("url", url).put("fileName", fileName);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("获取预览URL失败: " + e.getMessage());
		}
	}

	/**
	 * 获取预签名URL（用于临时访问）
	 */
	@GetMapping("/presigned/{fileName:.+}")
	@IgnoreAuth
	public R getPresignedUrl(
			@PathVariable String fileName,
			@RequestParam(value = "expiry", defaultValue = "3600") int expirySeconds) {
		try {
			if (!minioEnabled || minioService == null) {
				return R.error("MinIO未启用");
			}
			String objectName = fileName.startsWith("upload/") ? fileName : "upload/" + fileName;
			if (!minioService.fileExists(objectName)) {
				return R.error(404, "文件不存在");
			}
			String url = minioService.getPresignedUrl(objectName, expirySeconds);
			return R.ok().put("url", url).put("expiry", expirySeconds);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("生成预签名URL失败: " + e.getMessage());
		}
	}

	/**
	 * 列出文件（支持分页和过滤）
	 */
	@GetMapping("/list")
	@IgnoreAuth
	public R listFiles(
			@RequestParam(value = "prefix", required = false) String prefix,
			@RequestParam(value = "page", defaultValue = "1") int page,
			@RequestParam(value = "limit", defaultValue = "20") int limit) {
		try {
			if (!minioEnabled || minioService == null) {
				return R.error("MinIO未启用");
			}
			String searchPrefix = StringUtils.defaultIfBlank(prefix, "");
			List<String> allFiles = minioService.listFiles(searchPrefix);
			
			// 分页处理
			int total = allFiles.size();
			int start = (page - 1) * limit;
			int end = Math.min(start + limit, total);
			List<String> pageFiles = allFiles.subList(start, end);

			return R.ok()
					.put("list", pageFiles)
					.put("total", total)
					.put("page", page)
					.put("limit", limit);
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("列出文件失败: " + e.getMessage());
		}
	}

	/**
	 * 删除文件
	 */
	@PostMapping("/delete")
	@IgnoreAuth
	public R deleteFile(@RequestParam String fileName) {
		try {
			if (minioEnabled && minioService != null) {
				String objectName = fileName.startsWith("upload/") ? fileName : "upload/" + fileName;
				if (!minioService.fileExists(objectName)) {
					return R.error(404, "文件不存在");
				}
				minioService.deleteFile(objectName);
			} else {
				// 本地文件系统删除
				File path = new File(ResourceUtils.getURL("classpath:static").getPath());
				if (!path.exists()) {
					path = new File("");
				}
				File upload = new File(path.getAbsolutePath(), "/upload/");
				File file = new File(upload.getAbsolutePath() + "/" + fileName);
				if (!file.exists()) {
					return R.error(404, "文件不存在");
				}
				file.delete();
			}
			return R.ok().put("msg", "删除成功");
		} catch (Exception e) {
			e.printStackTrace();
			return R.error("删除文件失败: " + e.getMessage());
		}
	}
}
