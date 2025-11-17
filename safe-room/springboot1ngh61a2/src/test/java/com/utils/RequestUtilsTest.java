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
}
