// 遞迴清除 req.body 所有字串欄位的 HTML 標籤與危險字元
const stripHtml = (str) =>
  typeof str === 'string'
    ? str
        .replace(/<[^>]*>/g, '')          // 移除所有 HTML 標籤
        .replace(/javascript:/gi, '')      // 移除 javascript: 協議
        .replace(/on\w+\s*=/gi, '')        // 移除事件屬性 (onclick= 等)
        .trim()
    : str;

const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') return stripHtml(obj);
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, sanitizeObject(v)])
  );
};

const sanitize = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }
  next();
};

module.exports = { sanitize };
