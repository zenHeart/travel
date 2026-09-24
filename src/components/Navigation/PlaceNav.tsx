import { useNavigate } from 'react-router-dom';
import { NavPanel } from './NavPanel';

interface PlaceNavProps {
  active: 'index' | 'tenglv';
  variant: 'rail' | 'collapse';
}

const pages = [
  { id: 'index', label: '武汉生活清单', path: '/place/wuhan/index' },
  { id: 'tenglv', label: '腾旅卡', path: '/place/wuhan/tenglv' },
] as const;

export function PlaceNav({ active, variant }: PlaceNavProps) {
  const navigate = useNavigate();
  return <NavPanel label="武汉内容" summary={pages.find(page => page.id === active)?.label} variant={variant}>
    <ul className="space-y-0.5">{pages.map(page => <li key={page.id}>
      <button
        onClick={() => navigate(page.path)}
        aria-current={active === page.id ? 'page' : undefined}
        className={`flex w-full items-stretch gap-2 rounded-md py-2 pr-2 text-left text-sm transition-colors ${active === page.id ? 'bg-teal-50 font-semibold text-teal-900' : 'text-slate-600 hover:bg-slate-100'}`}
      >
        <span aria-hidden className={`w-0.5 shrink-0 rounded-full ${active === page.id ? 'bg-teal-600' : 'bg-transparent'}`} />
        {page.label}
      </button>
    </li>)}</ul>
  </NavPanel>;
}
