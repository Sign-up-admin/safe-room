-- 创建PostgreSQL兼容函数以支持后端代码中的SQL语法

-- 1. 创建ROUND函数兼容（PostgreSQL的ROUND对DOUBLE PRECISION需要类型转换）
-- 实际上PostgreSQL的ROUND应该可以工作，但为了确保兼容性，我们确保字段类型正确

-- 2. 创建DATE_FORMAT函数兼容（PostgreSQL使用TO_CHAR）
CREATE OR REPLACE FUNCTION date_format(timestamp_val TIMESTAMP, format_str TEXT)
RETURNS TEXT AS $$
BEGIN
    -- 将MySQL的DATE_FORMAT格式转换为PostgreSQL的TO_CHAR格式
    format_str := REPLACE(format_str, '%Y-%m-%d', 'YYYY-MM-DD');
    format_str := REPLACE(format_str, '%Y-%m', 'YYYY-MM');
    format_str := REPLACE(format_str, '%Y', 'YYYY');
    RETURN TO_CHAR(timestamp_val, format_str);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. 确保kechengjiage等价格字段可以正确使用ROUND
-- PostgreSQL的ROUND函数对NUMERIC类型工作正常，对DOUBLE PRECISION需要转换
-- 我们创建一个包装函数
CREATE OR REPLACE FUNCTION round_double(val DOUBLE PRECISION, digits INT)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(val::NUMERIC, digits);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 但是，由于MyBatis直接使用ROUND，我们需要确保类型转换
-- 实际上，PostgreSQL的ROUND应该可以工作，问题可能是类型不匹配
-- 让我们检查并确保字段类型正确

