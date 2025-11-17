-- 修复ROUND函数以支持DOUBLE PRECISION类型
-- PostgreSQL的ROUND函数默认只支持NUMERIC类型，我们需要创建重载

-- 创建ROUND函数重载来处理DOUBLE PRECISION
CREATE OR REPLACE FUNCTION round(val DOUBLE PRECISION, digits INT DEFAULT 0)
RETURNS NUMERIC AS $$
BEGIN
    RETURN ROUND(val::NUMERIC, digits);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 验证函数已创建
SELECT proname, pronargs, proargtypes::regtype[] 
FROM pg_proc 
WHERE proname = 'round' AND pronamespace = 'public'::regnamespace;

