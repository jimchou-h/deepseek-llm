/**
 * 将嵌套对象扁平化为点号分隔的键值对
 * @param obj 要扁平化的对象
 * @param prefix 键的前缀
 * @returns 扁平化后的对象
 */
export function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, key: string) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      Object.assign(acc, flattenObject(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = String(obj[key]);
    }
    return acc;
  }, {});
}

/**
 * 处理请求体，保持对象的层级结构
 * @param args 参数对象
 * @param parameters 参数定义
 * @returns 处理后的请求体
 */
export function processRequestBody(args: Record<string, any>, parameters: any): Record<string, any> {
  const result: Record<string, any> = {};
  
  Object.entries(args).forEach(([key, value]) => {
    const paramDef = parameters.properties[key];
    if (paramDef?.type === 'object' && typeof value === 'object') {
      result[key] = processRequestBody(value, paramDef);
    } else {
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * 处理 URL 中的参数替换
 * @param url 原始 URL
 * @param args 参数对象
 * @returns 处理后的 URL
 */
export function processUrlParameters(url: string, args: Record<string, any>): string {
  const flattenedArgs = flattenObject(args);
  return Object.entries(flattenedArgs).reduce(
    (processedUrl, [key, value]) => processedUrl.replace(`{${key}}`, encodeURIComponent(value)),
    url
  );
} 