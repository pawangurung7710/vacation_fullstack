import type { CSSProperties } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
	label: string;
	path?: string;
}

interface BreadcrumbsProps {
	items: BreadcrumbItem[];
	className?: string;
	style?: CSSProperties;
	theme?: 'light' | 'default';
}

export function Breadcrumbs({ items, className, style, theme = 'default' }: BreadcrumbsProps) {
	const isLight = theme === 'light';
	const navClassName = ['py-2 sm:py-4', className].filter(Boolean).join(' ');
	const linkClassName = isLight
		? 'text-white/90 hover:text-white transition-colors'
		: 'text-gray-600 hover:text-blue-600 transition-colors';
	const separatorClassName = isLight ? 'text-white/60' : 'text-gray-500';
	const currentClassName = isLight ? 'text-white' : 'text-gray-900';

	return (
		<nav aria-label="Breadcrumb" className={navClassName} style={style}>
			<ol className="flex items-center gap-1.5 text-xs sm:text-sm sm:gap-2 overflow-x-auto whitespace-nowrap sm:overflow-visible [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
				{/* Home */}
				<li className="flex-shrink-0">
					<Link
						to="/"
						className={`flex items-center gap-1 ${linkClassName} group`}
					>
						<Home size={16} className="transition-colors" />
						<span className="hidden sm:inline">Home</span>
					</Link>
				</li>

				{/* Breadcrumb items */}
				{items.map((item, index) => {
					const isLast = index === items.length - 1;
					// Use link color for chevron if next item is a link, otherwise use current page color
					const chevronClassName = (item.path && !isLast) ? linkClassName : currentClassName;

					return (
						<li key={index} className="flex items-center gap-2 flex-shrink-0">
							<span className={chevronClassName}>
								<ChevronRight size={16} className="transition-colors" />
							</span>
							{item.path && !isLast ? (
								<Link
									to={item.path}
									className={linkClassName}
								>
									{item.label}
								</Link>
							) : (
								<span className={currentClassName}>{item.label}</span>
							)}
						</li>
					);
				})}
			</ol>
		</nav>
	);
}
