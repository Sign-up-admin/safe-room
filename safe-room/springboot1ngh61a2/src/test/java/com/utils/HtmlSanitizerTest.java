package com.utils;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * HtmlSanitizer单元测试
 */
class HtmlSanitizerTest {

    @Test
    void shouldReturnNullWhenInputIsNull() {
        String result = HtmlSanitizer.sanitize(null);
        assertThat(result).isNull();

        String strictResult = HtmlSanitizer.sanitizeStrict(null);
        assertThat(strictResult).isNull();

        String removeResult = HtmlSanitizer.removeHtml(null);
        assertThat(removeResult).isNull();
    }

    @Test
    void shouldSanitizeRelaxedHtml() {
        String html = "<p>Hello <strong>world</strong>!</p><script>alert('xss')</script>";
        String result = HtmlSanitizer.sanitize(html);

        assertThat(result)
            .contains("<p>")
            .contains("<strong>world</strong>")
            .contains("Hello")
            .doesNotContain("<script>")
            .doesNotContain("alert('xss')");
    }

    @Test
    void shouldAllowPermittedTagsInRelaxedMode() {
        String html = "<p>Paragraph</p><br><strong>Bold</strong><em>Italic</em><u>Underline</u>" +
                     "<h1>Heading 1</h1><h2>Heading 2</h2><ul><li>Item 1</li><li>Item 2</li></ul>" +
                     "<ol><li>Numbered 1</li><li>Numbered 2</li></ol>" +
                     "<blockquote>Quote</blockquote>" +
                     "<a href=\"https://example.com\">Link</a>" +
                     "<img src=\"image.jpg\" alt=\"Alt text\" title=\"Title\">";

        String result = HtmlSanitizer.sanitize(html);

        assertThat(result)
            .contains("<p>")
            .contains("<strong>")
            .contains("<em>")
            .contains("<u>")
            .contains("<h1>")
            .contains("<h2>")
            .contains("<ul>")
            .contains("<li>")
            .contains("<ol>")
            .contains("<blockquote>")
            .contains("<a href=\"https://example.com\">")
            .contains("<img src=\"image.jpg\" alt=\"Alt text\" title=\"Title\">");
    }

    @Test
    void shouldRemoveDisallowedTagsInRelaxedMode() {
        String html = "<div>Div</div><span>Span</span><script>alert('xss')</script>" +
                     "<iframe src=\"evil.com\"></iframe><object>Object</object>";

        String result = HtmlSanitizer.sanitize(html);

        assertThat(result)
            .doesNotContain("<div>")
            .doesNotContain("<span>")
            .doesNotContain("<script>")
            .doesNotContain("<iframe>")
            .doesNotContain("<object>")
            .doesNotContain("alert('xss')")
            .doesNotContain("evil.com")
            .doesNotContain("Object");
    }

    @Test
    void shouldSanitizeStrictHtml() {
        String html = "<p>Hello <strong>world</strong>!</p><a href=\"https://example.com\">Link</a>";
        String result = HtmlSanitizer.sanitizeStrict(html);

        assertThat(result)
            .contains("Hello")
            .contains("world")
            .contains("Link")
            .doesNotContain("<p>")
            .doesNotContain("<strong>")
            .doesNotContain("<a href");
    }

    @Test
    void shouldRemoveAllHtmlTags() {
        String html = "<p>Hello <strong>world</strong>!</p><script>alert('xss')</script><br>";
        String result = HtmlSanitizer.removeHtml(html);

        assertThat(result)
            .isEqualTo("Hello world!")
            .doesNotContain("<p>")
            .doesNotContain("<strong>")
            .doesNotContain("<script>")
            .doesNotContain("<br>")
            .doesNotContain("alert('xss')");
    }

    @Test
    void shouldPreserveTextContent() {
        String html = "<p>This is <em>emphasized</em> text with <strong>bold</strong> content.</p>";
        String result = HtmlSanitizer.removeHtml(html);

        assertThat(result).isEqualTo("This is emphasized text with bold content.");
    }

    @Test
    void shouldHandleEmptyString() {
        String result = HtmlSanitizer.sanitize("");
        assertThat(result).isEmpty();

        String strictResult = HtmlSanitizer.sanitizeStrict("");
        assertThat(strictResult).isEmpty();

        String removeResult = HtmlSanitizer.removeHtml("");
        assertThat(removeResult).isEmpty();
    }

    @Test
    void shouldHandlePlainText() {
        String text = "This is plain text without any HTML tags.";
        String result = HtmlSanitizer.sanitize(text);
        assertThat(result).isEqualTo(text);

        String strictResult = HtmlSanitizer.sanitizeStrict(text);
        assertThat(strictResult).isEqualTo(text);

        String removeResult = HtmlSanitizer.removeHtml(text);
        assertThat(removeResult).isEqualTo(text);
    }

    @Test
    void shouldHandleComplexHtml() {
        String html = """
            <html>
            <head><title>Test</title></head>
            <body>
                <h1>Main Title</h1>
                <p>This is a <strong>bold</strong> paragraph with <em>emphasis</em>.</p>
                <ul>
                    <li>Item 1</li>
                    <li>Item 2</li>
                </ul>
                <script>maliciousCode()</script>
                <img src="test.jpg" alt="Test Image">
            </body>
            </html>
            """;

        String relaxed = HtmlSanitizer.sanitize(html);
        assertThat(relaxed)
            .contains("<h1>")
            .contains("<p>")
            .contains("<strong>")
            .contains("<em>")
            .contains("<ul>")
            .contains("<li>")
            .contains("<img")
            .doesNotContain("<html>")
            .doesNotContain("<head>")
            .doesNotContain("<title>")
            .doesNotContain("<body>")
            .doesNotContain("<script>")
            .doesNotContain("maliciousCode()");

        String removed = HtmlSanitizer.removeHtml(html);
        assertThat(removed)
            .contains("Main Title")
            .contains("This is a")
            .contains("bold")
            .contains("paragraph")
            .contains("emphasis")
            .contains("Item 1")
            .contains("Item 2")
            .doesNotContain("<")
            .doesNotContain(">")
            .doesNotContain("script")
            .doesNotContain("maliciousCode");
    }

    @Test
    void shouldSanitizeJavaScriptEventHandlers() {
        String html = "<a href=\"#\" onclick=\"alert('xss')\">Click me</a>";
        String result = HtmlSanitizer.sanitize(html);

        assertThat(result)
            .contains("<a href=\"#\">")
            .doesNotContain("onclick")
            .doesNotContain("alert('xss')");
    }

    @Test
    void shouldSanitizeInlineStyles() {
        String html = "<p style=\"color: red; background: url(javascript:alert('xss'))\">Styled text</p>";
        String result = HtmlSanitizer.sanitize(html);

        assertThat(result)
            .contains("<p>")
            .contains("Styled text")
            .doesNotContain("style")
            .doesNotContain("color: red")
            .doesNotContain("javascript:alert");
    }
}
