interface InputGroupProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    helpVar?: string;
    error?: string;
}

export function InputGroup({ label, helpVar, error, className, ...props }: InputGroupProps) {
    return (
        <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
            </label>
            <input
                className={`w-full px-3 py-2 bg-white dark:bg-slate-950 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-shadow ${error ? 'border-rose-500' : 'border-slate-300 dark:border-slate-700'
                    } ${className || ''}`}
                {...props}
            />
            {helpVar && <p className="text-xs text-slate-500">{helpVar}</p>}
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}
