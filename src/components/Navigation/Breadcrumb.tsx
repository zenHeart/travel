import React from 'react';
import { useLocation, Link } from 'react-router-dom';

export const Breadcrumb: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  const getBreadcrumbItems = () => {
    const items = [
      { name: '首页', path: '/', current: pathnames.length === 0 }
    ];

    if (pathnames.length > 0 && pathnames[0] === 'city') {
      items.push({
        name: '城市详情',
        path: location.pathname,
        current: true
      });
    }

    return items;
  };

  const breadcrumbItems = getBreadcrumbItems();

  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => (
          <li key={item.path} className="flex items-center">
            {index > 0 && (
              <svg
                className="w-4 h-4 text-gray-400 mx-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            {item.current ? (
              <span className="text-gray-500 font-medium">{item.name}</span>
            ) : (
              <Link
                to={item.path}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {item.name}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}; 