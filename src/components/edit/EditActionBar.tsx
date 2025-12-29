import { Button } from "@/components/ui/button";
import { Loader2, Save } from "lucide-react";
import Link from "next/link";

interface EditActionBarProps {
    isSaving: boolean;
    onSave?: () => void;
    onCancel?: () => void;
    cancelHref?: string;
    showCancel?: boolean;
}

export function EditActionBar({
    isSaving,
    onSave,
    cancelHref = "/catalog",
    showCancel = true,
}: EditActionBarProps) {
    return (
        <div className="flex gap-4 sticky bottom-6 z-10 p-2 bg-background/80 backdrop-blur-md border border-border rounded-2xl shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
            <button
                type="submit"
                disabled={isSaving}
                onClick={onSave}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
            >
                {isSaving ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        Save Changes
                    </>
                )}
            </button>

            {showCancel && (
                <Link
                    href={cancelHref}
                    className="px-8 py-4 border border-border rounded-xl hover:bg-muted transition-colors text-center font-medium flex items-center"
                >
                    Cancel
                </Link>
            )}
        </div>
    );
}
