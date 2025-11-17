package com.utils;

import org.owasp.html.HtmlPolicyBuilder;
import org.owasp.html.PolicyFactory;
import org.owasp.html.Sanitizers;

/**
 * HTML清洗工具类
 * 使用OWASP Java HTML Sanitizer防止XSS攻击
 */
public class HtmlSanitizer {
    
    // 宽松策略：允许基本的HTML标签和格式
    private static final PolicyFactory RELAXED = new HtmlPolicyBuilder()
            .allowElements("p", "br", "strong", "em", "u", "h1", "h2", "h3", "h4", "h5", "h6", 
                          "ul", "ol", "li", "blockquote", "a", "img")
            .allowUrlProtocols("http", "https")
            .allowAttributes("href").onElements("a")
            .allowAttributes("src", "alt", "title").onElements("img")
            .toFactory();
    
    // 严格策略：只允许文本，移除所有HTML标签
    private static final PolicyFactory STRICT = Sanitizers.FORMATTING.and(Sanitizers.LINKS);
    
    // 最严格策略：完全移除HTML
    private static final PolicyFactory NONE = new HtmlPolicyBuilder().toFactory();
    
    /**
     * 清洗HTML内容（宽松策略）
     * @param html HTML内容
     * @return 清洗后的HTML
     */
    public static String sanitize(String html) {
        if (html == null) {
            return null;
        }
        return RELAXED.sanitize(html);
    }
    
    /**
     * 清洗HTML内容（严格策略）
     * @param html HTML内容
     * @return 清洗后的HTML
     */
    public static String sanitizeStrict(String html) {
        if (html == null) {
            return null;
        }
        return STRICT.sanitize(html);
    }
    
    /**
     * 完全移除HTML标签，只保留纯文本
     * @param html HTML内容
     * @return 纯文本
     */
    public static String removeHtml(String html) {
        if (html == null) {
            return null;
        }
        return NONE.sanitize(html);
    }
}

