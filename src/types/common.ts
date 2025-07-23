export interface ToolPanelState {
  isOpen: boolean;
  activeView: 'list' | 'timeline';
  filter: {
    status: ('visited' | 'planned' | 'wishlist')[];
    tags: string[];
    search: string;
  };
}

export interface EmptyState {
  type: 'visited' | 'planned' | 'wishlist';
  message: string;
  icon: string;
}

export interface ErrorState {
  type: 'network' | 'content' | 'map' | 'image';
  message: string;
  retryAction?: () => void;
}

export interface LoadingState {
  isLoading: boolean;
  message?: string;
} 