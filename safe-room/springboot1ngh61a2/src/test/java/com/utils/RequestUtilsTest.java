package com.utils;

import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

/**
 * RequestUtils单元测试
 */
class RequestUtilsTest {

    @Mock
    private HttpServletRequest request;

    RequestUtilsTest() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void shouldReturnXForwardedForHeaderWhenPresent() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.100");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("192.168.1.100");
    }

    @Test
    void shouldReturnXRealIPWhenXForwardedForIsUnknown() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("unknown");
        when(request.getHeader("X-Real-IP")).thenReturn("192.168.1.101");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("192.168.1.101");
    }

    @Test
    void shouldReturnProxyClientIPWhenXForwardedForIsBlank() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("");
        when(request.getHeader("X-Real-IP")).thenReturn("");
        when(request.getHeader("Proxy-Client-IP")).thenReturn("192.168.1.102");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("192.168.1.102");
    }

    @Test
    void shouldReturnWLProxyClientIPWhenOthersAreUnknown() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("unknown");
        when(request.getHeader("X-Real-IP")).thenReturn("unknown");
        when(request.getHeader("Proxy-Client-IP")).thenReturn("unknown");
        when(request.getHeader("WL-Proxy-Client-IP")).thenReturn("192.168.1.103");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("192.168.1.103");
    }

    @Test
    void shouldReturnRemoteAddrWhenAllHeadersAreUnknown() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("unknown");
        when(request.getHeader("X-Real-IP")).thenReturn("unknown");
        when(request.getHeader("Proxy-Client-IP")).thenReturn("unknown");
        when(request.getHeader("WL-Proxy-Client-IP")).thenReturn("unknown");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("127.0.0.1");
    }

    @Test
    void shouldReturnFirstIPWhenXForwardedForContainsMultipleIPs() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.100, 10.0.0.1, 172.16.0.1");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("192.168.1.100");
    }

    @Test
    void shouldHandleNullHeadersGracefully() {
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getHeader("Proxy-Client-IP")).thenReturn(null);
        when(request.getHeader("WL-Proxy-Client-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("127.0.0.1");
    }

    @Test
    void shouldHandleBlankHeadersGracefully() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("   ");
        when(request.getHeader("X-Real-IP")).thenReturn("   ");
        when(request.getHeader("Proxy-Client-IP")).thenReturn("   ");
        when(request.getHeader("WL-Proxy-Client-IP")).thenReturn("   ");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("127.0.0.1");
    }

    @Test
    void shouldReturnNullWhenAllHeadersAndRemoteAddrAreNull() {
        when(request.getHeader("X-Forwarded-For")).thenReturn(null);
        when(request.getHeader("X-Real-IP")).thenReturn(null);
        when(request.getHeader("Proxy-Client-IP")).thenReturn(null);
        when(request.getHeader("WL-Proxy-Client-IP")).thenReturn(null);
        when(request.getRemoteAddr()).thenReturn(null);

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isNull();
    }

    @Test
    void shouldReturnUserAgentHeader() {
        when(request.getHeader("User-Agent")).thenReturn("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");

        String userAgent = RequestUtils.getUserAgent(request);
        assertThat(userAgent).isEqualTo("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    }

    @Test
    void shouldReturnNullUserAgentWhenHeaderIsNull() {
        when(request.getHeader("User-Agent")).thenReturn(null);

        String userAgent = RequestUtils.getUserAgent(request);
        assertThat(userAgent).isNull();
    }

    @Test
    void shouldHandleMultipleIPWithSpaces() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("  192.168.1.100  ,  10.0.0.1  ");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("192.168.1.100");
    }

    @Test
    void shouldHandleCaseInsensitiveUnknown() {
        when(request.getHeader("X-Forwarded-For")).thenReturn("UNKNOWN");
        when(request.getHeader("X-Real-IP")).thenReturn("Unknown");
        when(request.getHeader("Proxy-Client-IP")).thenReturn("UNknown");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        assertThat(ip).isEqualTo("127.0.0.1");
    }

    @Test
    void shouldHandleIpWithSpecialCharacters() {
        // 测试包含特殊字符的IP地址
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.100<script>alert('xss')</script>");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        // 特殊字符会被保留，因为RequestUtils不进行清理
        assertThat(ip).isEqualTo("192.168.1.100<script>alert('xss')</script>");
    }

    @Test
    void shouldHandleVeryLongIpAddress() {
        // 测试超长IP地址
        StringBuilder longIp = new StringBuilder();
        for (int i = 0; i < 1000; i++) {
            longIp.append("192.168.1.").append(i % 255).append(",");
        }
        longIp.append("10.0.0.1");

        when(request.getHeader("X-Forwarded-For")).thenReturn(longIp.toString());
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        // 应该返回逗号分割后的第一个IP
        assertThat(ip).startsWith("192.168.1.");
        assertThat(ip).doesNotContain(",");
    }

    @Test
    void shouldHandleMultipleIpAddressesWithSpecialChars() {
        // 测试多个IP地址，其中包含特殊字符
        when(request.getHeader("X-Forwarded-For")).thenReturn("192.168.1.100<malicious>, 10.0.0.1, 172.16.0.1");
        when(request.getRemoteAddr()).thenReturn("127.0.0.1");

        String ip = RequestUtils.getClientIp(request);
        // 应该返回第一个IP，包含特殊字符
        assertThat(ip).isEqualTo("192.168.1.100<malicious>");
    }
}
