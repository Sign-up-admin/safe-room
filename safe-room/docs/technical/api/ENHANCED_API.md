# 🔌 自动生成的API文档

> 从Java源代码自动生成的API文档
>
> **生成时间**: 2025-11-17T00:39:07.502Z
> **控制器数量**: 29
> **端点数量**: 50

## 📋 API概览

## 🏗️ 微服务架构概览

### 服务发现配置
- **注册中心**: 未配置
- **状态**: 禁用

### Feign客户端统计
- **Feign客户端数**: 0
- **带熔断器的端点**: 0

### 配置属性统计
- **配置类数**: 0

### 熔断器配置
- **熔断器配置数**: 0

---

### 控制器和端点统计

| 控制器 | 端点数 | 基础路径 | 描述 |
|--------|--------|----------|------|
| YonghuController | 1 | `/` | - |
| UsersController | 1 | `users` | - |
| UserController | 1 | `/` | - |
| StoreupController | 2 | `/` | - |
| SijiaoyuyueController | 2 | `/` | - |
| OperationLogController | 2 | `/` | - |
| NewstypeController | 2 | `/` | - |
| NewsController | 2 | `/` | - |
| MessageController | 2 | `/` | - |
| LegalTermsController | 2 | `/` | - |
| KechengyuyueController | 2 | `/` | - |
| KechengtuikeController | 2 | `/` | - |
| KechengleixingController | 2 | `/` | - |
| JianshenqicaiController | 2 | `/` | - |
| JianshenkechengController | 2 | `/` | - |
| JianshenjiaolianController | 2 | `/` | - |
| HuiyuanxufeiController | 2 | `/` | - |
| HuiyuankagoumaiController | 2 | `/` | - |
| HuiyuankaController | 2 | `/` | - |
| FileController | 2 | `/` | - |
| ErrorReportController | 2 | `/` | - |
| DiscussjianshenkechengController | 2 | `/` | - |
| DaoqitixingController | 2 | `/` | - |
| ConfigController | 1 | `config` | - |
| CommonController | 0 | `/` | - |
| ChatController | 2 | `/` | - |
| AssetsController | 2 | `/` | - |
| AdminController | 2 | `/` | - |
| GlobalExceptionHandler | 0 | `/` | - |

## 🎯 YonghuController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/yonghu` | - |

#### GET /yonghu

**认证**: 需要Token

**方法签名**:

```
public class YonghuController { @Autowired private YonghuService yonghuService; @Autowired
```

---

## 🎯 UsersController

**包名**: `com.controller`

**基础路径**: `users`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `users` | - |

#### GET users

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R login(String username, String password, String captcha, HttpServletRequest request) {
```

---

## 🎯 UserController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/user` | - |

#### GET /user

**认证**: 需要Token

**方法签名**:

```
public class UserController { private final UserService userService; private final TokenService tokenService; @Autowired
```

---

## 🎯 StoreupController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/storeup` | - |
| GET | `/page` | - |

#### GET /storeup

**认证**: 需要Token

**方法签名**:

```
public class StoreupController { @Autowired private StoreupService storeupService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,StoreupEntity storeup,
```

---

## 🎯 SijiaoyuyueController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/sijiaoyuyue` | - |
| GET | `/page` | - |

#### GET /sijiaoyuyue

**认证**: 需要Token

**方法签名**:

```
public class SijiaoyuyueController { @Autowired private SijiaoyuyueService sijiaoyuyueService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,SijiaoyuyueEntity sijiaoyuyue,
```

---

## 🎯 OperationLogController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/operationLog` | - |
| GET | `/operationLog` | - |

#### GET /operationLog

**认证**: 需要Token

**方法签名**:

```
public class OperationLogController { @Autowired private OperationLogService operationLogService;
```

#### GET /operationLog

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params, OperationLogEntity operationLog) { QueryWrapper<OperationLogEntity> ew = new QueryWrapper<>(); // 按用户名筛选
```

---

## 🎯 NewstypeController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/newstype` | - |
| GET | `/page` | - |

#### GET /newstype

**认证**: 需要Token

**方法签名**:

```
public class NewstypeController { @Autowired private NewstypeService newstypeService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,NewstypeEntity newstype,
```

---

## 🎯 NewsController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/news` | - |
| GET | `/page` | - |

#### GET /news

**认证**: 需要Token

**方法签名**:

```
public class NewsController { @Autowired private NewsService newsService; @Autowired
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,NewsEntity news,
```

---

## 🎯 MessageController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/messages` | - |
| GET | `/messages` | - |

#### GET /messages

**认证**: 需要Token

**方法签名**:

```
public class MessageController { @Autowired private MessageService messageService; /**
```

#### GET /messages

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,MessageEntity message,
```

---

## 🎯 LegalTermsController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/legalterms` | - |
| GET | `/legalterms` | - |

#### GET /legalterms

**认证**: 需要Token

**方法签名**:

```
public class LegalTermsController { @Autowired private LegalTermsService legalTermsService; /**
```

#### GET /legalterms

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params, LegalTermsEntity legalTerms,
```

---

## 🎯 KechengyuyueController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/kechengyuyue` | - |
| GET | `/page` | - |

#### GET /kechengyuyue

**认证**: 需要Token

**方法签名**:

```
public class KechengyuyueController { @Autowired private KechengyuyueService kechengyuyueService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,KechengyuyueEntity kechengyuyue,
```

---

## 🎯 KechengtuikeController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/kechengtuike` | - |
| GET | `/page` | - |

#### GET /kechengtuike

**认证**: 需要Token

**方法签名**:

```
public class KechengtuikeController { @Autowired private KechengtuikeService kechengtuikeService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,KechengtuikeEntity kechengtuike,
```

---

## 🎯 KechengleixingController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/kechengleixing` | - |
| GET | `/page` | - |

#### GET /kechengleixing

**认证**: 需要Token

**方法签名**:

```
public class KechengleixingController { @Autowired private KechengleixingService kechengleixingService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,KechengleixingEntity kechengleixing,
```

---

## 🎯 JianshenqicaiController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/jianshenqicai` | - |
| GET | `/page` | - |

#### GET /jianshenqicai

**认证**: 需要Token

**方法签名**:

```
public class JianshenqicaiController { @Autowired private JianshenqicaiService jianshenqicaiService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,JianshenqicaiEntity jianshenqicai,
```

---

## 🎯 JianshenkechengController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/jianshenkecheng` | - |
| GET | `/page` | - |

#### GET /jianshenkecheng

**认证**: 需要Token

**方法签名**:

```
public class JianshenkechengController { @Autowired private JianshenkechengService jianshenkechengService; @Autowired
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,JianshenkechengEntity jianshenkecheng,
```

---

## 🎯 JianshenjiaolianController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/jianshenjiaolian` | - |
| GET | `` | - |

#### GET /jianshenjiaolian

**认证**: 需要Token

**方法签名**:

```
public class JianshenjiaolianController { @Autowired private JianshenjiaolianService jianshenjiaolianService; @Autowired
```

#### GET 

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R login(String username, String password, String captcha, HttpServletRequest request) { JianshenjiaolianEntity u = jianshenjiaolianService.getOne(new QueryWrapper<JianshenjiaolianEntity>().eq("jiaoliangonghao", username));
```

---

## 🎯 HuiyuanxufeiController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/huiyuanxufei` | - |
| GET | `/page` | - |

#### GET /huiyuanxufei

**认证**: 需要Token

**方法签名**:

```
public class HuiyuanxufeiController { @Autowired private HuiyuanxufeiService huiyuanxufeiService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,HuiyuanxufeiEntity huiyuanxufei,
```

---

## 🎯 HuiyuankagoumaiController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/huiyuankagoumai` | - |
| GET | `/page` | - |

#### GET /huiyuankagoumai

**认证**: 需要Token

**方法签名**:

```
public class HuiyuankagoumaiController { @Autowired private HuiyuankagoumaiService huiyuankagoumaiService; @Autowired
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,HuiyuankagoumaiEntity huiyuankagoumai,
```

---

## 🎯 HuiyuankaController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/huiyuanka` | - |
| GET | `/page` | - |

#### GET /huiyuanka

**认证**: 需要Token

**方法签名**:

```
public class HuiyuankaController { @Autowired private HuiyuankaService huiyuankaService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,HuiyuankaEntity huiyuanka,
```

---

## 🎯 FileController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `file` | - |
| GET | `/upload` | - |

#### GET file

**认证**: 需要Token

**方法签名**:

```
public class FileController{ @Autowired private ConfigService configService; @Autowired private AssetsService assetsService;
```

#### GET /upload

**认证**: 无需认证

**返回值**: R (统一响应格式)

**方法签名**:

```
public R upload(@RequestParam("file") MultipartFile file,String type) throws Exception {
```

---

## 🎯 ErrorReportController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/error` | - |
| GET | `/report` | - |

#### GET /api/error

**认证**: 需要Token

**方法签名**:

```
public class ErrorReportController { private static final Logger logger = LoggerFactory.getLogger(ErrorReportController.class); private static final Logger errorLogger = LoggerFactory.getLogger("errorReport");
```

#### GET /report

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R reportError(@RequestBody Map<String, Object> errorInfo) {
```

---

## 🎯 DiscussjianshenkechengController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/discussjianshenkecheng` | - |
| GET | `/page` | - |

#### GET /discussjianshenkecheng

**认证**: 需要Token

**方法签名**:

```
public class DiscussjianshenkechengController { @Autowired private DiscussjianshenkechengService discussjianshenkechengService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,DiscussjianshenkechengEntity discussjianshenkecheng,
```

---

## 🎯 DaoqitixingController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/daoqitixing` | - |
| GET | `/page` | - |

#### GET /daoqitixing

**认证**: 需要Token

**方法签名**:

```
public class DaoqitixingController { @Autowired private DaoqitixingService daoqitixingService; @Autowired private MessageService messageService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,DaoqitixingEntity daoqitixing,
```

---

## 🎯 ConfigController

**包名**: `com.controller`

**基础路径**: `config`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `configconfig` | - |

#### GET configconfig

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,ConfigEntity config){ QueryWrapper<ConfigEntity> ew = new QueryWrapper<ConfigEntity>(); PageUtils page = configService.queryPage(params, MPUtil.sort(MPUtil.between(MPUtil.likeOrEq(ew, config), params), params)); return R.ok().put("data", page); }
```

---

## 🎯 CommonController

**包名**: `com.controller`

**基础路径**: `/`

---

## 🎯 ChatController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/chat` | - |
| GET | `/page` | - |

#### GET /chat

**认证**: 需要Token

**方法签名**:

```
public class ChatController { @Autowired private ChatService chatService;
```

#### GET /page

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R page(@RequestParam Map<String, Object> params,ChatEntity chat,
```

---

## 🎯 AssetsController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/assets` | - |
| GET | `/assets` | - |

#### GET /assets

**认证**: 需要Token

**方法签名**:

```
public class AssetsController { @Autowired private AssetsService assetsService;
```

#### GET /assets

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
public R list(@RequestParam Map<String, Object> params) { PageUtils page = assetsService.queryPage(params); return R.ok().put("data", page); }
```

---

## 🎯 AdminController

**包名**: `com.controller`

**基础路径**: `/`

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/admin` | - |
| GET | `/clearRateLimit` | - |

#### GET /admin

**认证**: 需要Token

**方法签名**:

```
public class AdminController { // @Autowired(required = false) // private RateLimitInterceptor rateLimitInterceptor; // 已禁用限流功能
```

#### GET /clearRateLimit

**认证**: 需要Token

**返回值**: R (统一响应格式)

**方法签名**:

```
// public R clearRateLimit( // @RequestParam(required = false) String ip, // @RequestParam(required = false) String key,
```

---

## 🎯 GlobalExceptionHandler

**包名**: `com.config`

**基础路径**: `/`

---

## 📊 统计信息

- **总控制器数**: 29
- **总端点数**: 50
- **GET请求**: 50
- **POST请求**: 0
- **PUT请求**: 0
- **DELETE请求**: 0

---

*此文档由工具自动生成，如需修改请更新Java源代码中的注释*
