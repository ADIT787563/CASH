import { Save, Loader2 } from "lucide-react";

interface SettingsSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
    onSave?: () => void;
    isSaving?: boolean;
}

export function SettingsSection({ title, description, children, onSave, isSaving }: SettingsSectionProps) {
    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-sm flex flex-col h-full min-h-[600px] relative pb-20 max-w-5xl mx-auto">
            <div className="p-6 border-b border-slate-100 dark:border-slate-800">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
                <p className="text-sm text-slate-500 mt-1">{description}</p>
            </div>

            <div className="p-6 space-y-6 flex-1 overflow-y-auto">
                {children}
            </div>

            {onSave && (
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 rounded-b-lg flex justify-end">
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Save className="w-4 h-4" />
                        )}
                        Save Changes
                    </button>
                </div>
            )}
        </div>
    );
}
