import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-8">
          <div className="text-red-500 text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">页面出错了</h1>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            抱歉，页面遇到了一个错误。请尝试刷新页面或返回首页。
          </p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="btn-primary"
            >
              刷新页面
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn-secondary"
            >
              返回首页
            </button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <details className="mt-6 p-4 bg-gray-100 rounded-lg max-w-2xl">
              <summary className="cursor-pointer font-medium text-gray-700">
                错误详情（开发模式）
              </summary>
              <pre className="mt-2 text-sm text-red-600 overflow-auto">
                {this.state.error.toString()}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
} 