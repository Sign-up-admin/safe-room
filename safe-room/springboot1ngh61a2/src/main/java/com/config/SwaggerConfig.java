// 暂时注释掉Swagger配置以避免编译错误
// TODO: 更新springdoc版本到与Spring Boot 3.3.5兼容的版本
/*
package com.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Swagger/OpenAPI 配置类
 * 提供REST API文档自动生成和在线查看功能
 */
/*
@Configuration
public class SwaggerConfig {

    /**
     * 配置OpenAPI信息
     */
/*
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("健身房管理系统 API")
                        .version("v1.0.0")
                        .description("健身房管理系统后端REST API接口文档，提供完整的API说明和在线测试功能")
                        .contact(new Contact()
                                .name("健身房管理系统开发团队")
                                .email("dev@fitness-gym.com")
                                .url("https://github.com/fitness-gym/backend"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .addServersItem(new Server()
                        .url("http://localhost:8080/springboot1ngh61a2")
                        .description("本地开发环境"))
                .addServersItem(new Server()
                        .url("https://api.fitness-gym.com")
                        .description("生产环境"));
    }
}
*/

