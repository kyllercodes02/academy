import { Link } from '@inertiajs/react';

export default function Pagination({ meta }) {
    if (!meta || meta.total <= meta.per_page) return null;

    const pagination = () => {
        const delta = 2;
        const left = meta.current_page - delta;
        const right = meta.current_page + delta + 1;
        const pages = [];

        for (let i = 1; i <= meta.last_page; i++) {
            if (
                i === 1 ||
                i === meta.last_page ||
                (i >= left && i < right)
            ) {
                pages.push(i);
            }
        }

        let temp = [];
        let l;

        for (let i of pages) {
            if (l) {
                if (i - l === 2) {
                    temp.push(l + 1);
                } else if (i - l !== 1) {
                    temp.push('...');
                }
            }
            temp.push(i);
            l = i;
        }

        return temp;
    };

    return (
        <div className="mt-4">
            <div className="flex items-center justify-between">
                <div className="flex flex-1 justify-between sm:hidden">
                    {meta.current_page > 1 && (
                        <Link
                            href={`?page=${meta.current_page - 1}`}
                            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            preserveScroll
                        >
                            Previous
                        </Link>
                    )}
                    {meta.current_page < meta.last_page && (
                        <Link
                            href={`?page=${meta.current_page + 1}`}
                            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                            preserveScroll
                        >
                            Next
                        </Link>
                    )}
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing <span className="font-medium">{meta.from}</span> to{' '}
                            <span className="font-medium">{meta.to}</span> of{' '}
                            <span className="font-medium">{meta.total}</span> results
                        </p>
                    </div>
                    <div>
                        <nav className="inline-flex -space-x-px rounded-md shadow-sm isolate" aria-label="Pagination">
                            {meta.current_page > 1 && (
                                <Link
                                    href={`?page=${meta.current_page - 1}`}
                                    className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-l-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                    preserveScroll
                                >
                                    <span className="sr-only">Previous</span>
                                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            )}
                            {pagination().map((page, index) => (
                                page === '...' ? (
                                    <span
                                        key={`ellipsis-${index}`}
                                        className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300"
                                    >
                                        ...
                                    </span>
                                ) : (
                                    <Link
                                        key={page}
                                        href={`?page=${page}`}
                                        className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${
                                            meta.current_page === page
                                                ? 'z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
                                                : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-offset-0'
                                        }`}
                                        preserveScroll
                                    >
                                        {page}
                                    </Link>
                                )
                            ))}
                            {meta.current_page < meta.last_page && (
                                <Link
                                    href={`?page=${meta.current_page + 1}`}
                                    className="relative inline-flex items-center px-2 py-2 text-gray-400 rounded-r-md ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                                    preserveScroll
                                >
                                    <span className="sr-only">Next</span>
                                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                        <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                    </svg>
                                </Link>
                            )}
                        </nav>
                    </div>
                </div>
            </div>
        </div>
    );
} 