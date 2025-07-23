import { MAP_CONFIG, MAP_SECURITY_CONFIG } from '../constants/map';

export interface SecurityCheckResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  recommendations: string[];
}

/**
 * 检查地图安全配置
 */
export const checkMapSecurity = (): SecurityCheckResult => {
  const result: SecurityCheckResult = {
    isValid: true,
    errors: [],
    warnings: [],
    recommendations: [],
  };

  // 检查API密钥
  if (!MAP_CONFIG.apiKey || MAP_CONFIG.apiKey === 'your-amap-api-key') {
    result.isValid = false;
    result.errors.push('地图API密钥未配置');
    result.recommendations.push('请在环境变量中设置 VITE_AMAP_API_KEY');
  }

  // 检查域名白名单
  const currentDomain = window.location.hostname;
  const isAllowedDomain = MAP_SECURITY_CONFIG.allowedDomains.some(domain => 
    currentDomain === domain || currentDomain.endsWith(`.${domain}`)
  );

  if (!isAllowedDomain) {
    result.warnings.push(`当前域名 ${currentDomain} 不在白名单中`);
    result.recommendations.push('请在 MAP_SECURITY_CONFIG.allowedDomains 中添加当前域名');
  }

  // 检查安全密钥（可选）
  if (!MAP_CONFIG.securityJsCode) {
    result.warnings.push('未配置安全密钥，建议配置以提高安全性');
    result.recommendations.push('请在环境变量中设置 VITE_AMAP_SECURITY_JS_CODE');
  }

  // 检查HTTPS
  if (window.location.protocol !== 'https:' && window.location.hostname !== 'localhost') {
    result.warnings.push('当前使用HTTP协议，建议使用HTTPS');
    result.recommendations.push('请配置HTTPS以提高安全性');
  }

  // 检查环境变量
  const requiredEnvVars = ['VITE_AMAP_API_KEY'];
  const missingEnvVars = requiredEnvVars.filter(envVar => 
    !import.meta.env[envVar]
  );

  if (missingEnvVars.length > 0) {
    result.errors.push(`缺少环境变量: ${missingEnvVars.join(', ')}`);
  }

  return result;
};

/**
 * 验证API密钥格式
 */
export const validateApiKey = (apiKey: string): boolean => {
  // 高德地图API密钥通常是32位字符
  const apiKeyPattern = /^[a-zA-Z0-9]{32}$/;
  return apiKeyPattern.test(apiKey);
};

/**
 * 检查网络连接
 */
export const checkNetworkConnection = async (): Promise<boolean> => {
  try {
    await fetch('https://restapi.amap.com/v3/ip?key=test', {
      method: 'HEAD',
      mode: 'no-cors',
    });
    return true;
  } catch (error) {
    console.warn('网络连接检查失败:', error);
    return false;
  }
};

/**
 * 生成安全报告
 */
export const generateSecurityReport = async (): Promise<string> => {
  const securityCheck = checkMapSecurity();
  const networkOk = await checkNetworkConnection();

  let report = '## 地图安全配置报告\n\n';

  // 总体状态
  report += `### 总体状态\n`;
  report += `- 配置有效性: ${securityCheck.isValid ? '✅ 通过' : '❌ 失败'}\n`;
  report += `- 网络连接: ${networkOk ? '✅ 正常' : '❌ 异常'}\n\n`;

  // 错误信息
  if (securityCheck.errors.length > 0) {
    report += `### 错误信息\n`;
    securityCheck.errors.forEach(error => {
      report += `- ❌ ${error}\n`;
    });
    report += '\n';
  }

  // 警告信息
  if (securityCheck.warnings.length > 0) {
    report += `### 警告信息\n`;
    securityCheck.warnings.forEach(warning => {
      report += `- ⚠️ ${warning}\n`;
    });
    report += '\n';
  }

  // 建议
  if (securityCheck.recommendations.length > 0) {
    report += `### 建议\n`;
    securityCheck.recommendations.forEach(rec => {
      report += `- 💡 ${rec}\n`;
    });
    report += '\n';
  }

  return report;
};

/**
 * 安全配置监控
 */
export class SecurityMonitor {
  private static instance: SecurityMonitor;
  private checkInterval: number | null = null;

  static getInstance(): SecurityMonitor {
    if (!SecurityMonitor.instance) {
      SecurityMonitor.instance = new SecurityMonitor();
    }
    return SecurityMonitor.instance;
  }

  startMonitoring(intervalMs: number = 60000): void {
    if (this.checkInterval) {
      this.stopMonitoring();
    }

    this.checkInterval = window.setInterval(() => {
      const result = checkMapSecurity();
      if (!result.isValid) {
        console.warn('安全配置检查失败:', result.errors);
      }
    }, intervalMs);
  }

  stopMonitoring(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  async getStatus(): Promise<{
    security: SecurityCheckResult;
    network: boolean;
  }> {
    return {
      security: checkMapSecurity(),
      network: await checkNetworkConnection(),
    };
  }
} 