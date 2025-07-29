import React, { useState, useEffect } from "react";

interface ImagePreviewProps {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ImagePreview: React.FC<ImagePreviewProps> = ({
  src,
  alt,
  isOpen,
  onClose,
}) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // 触摸相关状态
  const [lastTouchDistance, setLastTouchDistance] = useState(0);
  const [lastTap, setLastTap] = useState(0);

  // 重置状态当模态框打开时
  useEffect(() => {
    if (isOpen) {
      setScale(1);
      setPosition({ x: 0, y: 0 });
      setIsDragging(false);
    }
  }, [isOpen]);

  // ESC键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      // 防止页面滚动
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev * 1.5, 5));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(prev / 1.5, 0.5));
  };

  const handleReset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale((prev) => Math.max(0.5, Math.min(5, prev * delta)));
  };

  // 计算两点之间的距离
  const getDistance = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.sqrt(
      Math.pow(touch2.pageX - touch1.pageX, 2) +
        Math.pow(touch2.pageY - touch1.pageY, 2)
    );
  };

  // 触摸开始
  const handleTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1) {
      const touch = e.touches[0];

      // 单指触摸 - 检测双击退出和开始拖拽
      const now = Date.now();
      const timeDiff = now - lastTap;

      if (timeDiff < 300 && timeDiff > 0) {
        // 双击退出
        onClose();
        return;
      } else {
        // 开始拖拽
        setIsDragging(true);
        setDragStart({
          x: touch.clientX - position.x,
          y: touch.clientY - position.y,
        });
      }

      setLastTap(now);
    } else if (e.touches.length === 2) {
      // 双指触摸 - 开始缩放
      setIsDragging(false);
      const distance = getDistance(e.touches[0], e.touches[1]);
      setLastTouchDistance(distance);
    }
  };

  // 触摸移动
  const handleTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();

    if (e.touches.length === 1 && isDragging) {
      // 单指拖拽
      setPosition({
        x: e.touches[0].clientX - dragStart.x,
        y: e.touches[0].clientY - dragStart.y,
      });
    } else if (e.touches.length === 2) {
      // 双指缩放
      const distance = getDistance(e.touches[0], e.touches[1]);
      if (lastTouchDistance > 0) {
        const scaleChange = distance / lastTouchDistance;
        setScale((prev) => Math.max(0.5, Math.min(5, prev * scaleChange)));
      }
      setLastTouchDistance(distance);
    }
  };

  // 触摸结束
  const handleTouchEnd = () => {
    setIsDragging(false);
    setLastTouchDistance(0);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      onTouchMove={(e) => e.preventDefault()}
    >
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black bg-opacity-80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 图片容器 */}
      <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <img
          src={src}
          alt={alt}
          className="max-w-none cursor-move select-none touch-none"
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? "none" : "transform 0.2s ease-out",
          }}
          onMouseDown={handleMouseDown}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          draggable={false}
        />
      </div>

      {/* 工具栏 */}
      <div className="absolute top-4 right-4 flex items-center space-x-1 md:space-x-2 bg-black bg-opacity-50 rounded-lg p-1 md:p-2">
        <button
          onClick={handleZoomIn}
          className="p-1.5 md:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors touch-manipulation"
          title="放大 (滚轮向上)"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
            />
          </svg>
        </button>

        <button
          onClick={handleZoomOut}
          className="p-1.5 md:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors touch-manipulation"
          title="缩小 (滚轮向下)"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18 12H6"
            />
          </svg>
        </button>

        <button
          onClick={handleReset}
          className="p-1.5 md:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors touch-manipulation"
          title="重置"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>

        <div className="w-px h-4 md:h-6 bg-white bg-opacity-30" />

        <button
          onClick={onClose}
          className="p-1.5 md:p-2 text-white hover:bg-white hover:bg-opacity-20 rounded transition-colors touch-manipulation"
          title="关闭 (ESC)"
        >
          <svg
            className="w-4 h-4 md:w-5 md:h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>

      {/* 提示信息 */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg text-sm max-w-[90vw] text-center">
        <div className="hidden md:flex items-center justify-center space-x-4">
          <span>🖱️ 拖拽移动</span>
          <span>🎡 滚轮缩放</span>
          <span>⌨️ ESC 关闭</span>
        </div>
        <div className="flex md:hidden items-center justify-center space-x-3 text-xs">
          <span>👆 拖拽</span>
          <span>👌 双指缩放</span>
          <span>👆👆 双击退出</span>
        </div>
        {alt && <div className="mt-1 text-center text-gray-300">{alt}</div>}
      </div>
    </div>
  );
};
