import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
    label: string;
    value: string;
}

interface EditFormFieldProps {
    label?: string;
    value: any;
    onChange: (value: any) => void;
    type?: "text" | "number" | "textarea" | "select" | "checkbox" | "password" | "email";
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    locked?: boolean;
    helperText?: string;
    error?: string;
    options?: Option[];
    min?: number | string;
    max?: number | string;
    rows?: number;
    className?: string; // Container class
    inputClassName?: string; // Input specific class override
}

export function EditFormField({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required = false,
    disabled = false,
    locked = false,
    helperText,
    error,
    options = [],
    min,
    max,
    rows = 3,
    className,
    inputClassName,
}: EditFormFieldProps) {
    const isNumber = type === "number";

    // Handle input change wrapper
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const val = e.target.value;
        if (isNumber) {
            onChange(val === "" ? "" : parseFloat(val));
        } else {
            onChange(val);
        }
    };

    // Render Input Element
    const renderInput = () => {
        const commonClasses = cn(
            inputClassName,
            error && "border-red-500 focus:ring-red-500",
            locked && "opacity-60 cursor-not-allowed"
        );

        if (type === "select") {
            return (
                <Select
                    value={value?.toString()}
                    onValueChange={onChange}
                    disabled={disabled || locked}
                >
                    <SelectTrigger className={commonClasses}>
                        <SelectValue placeholder={placeholder} />
                    </SelectTrigger>
                    <SelectContent>
                        {options.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            );
        }

        if (type === "textarea") {
            return (
                <Textarea
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    disabled={disabled || locked}
                    rows={rows}
                    className={cn("resize-none", commonClasses)}
                />
            );
        }

        if (type === "checkbox") {
            return (
                <div className="flex items-center gap-3">
                    <Checkbox
                        id={label} // Simple ID generation
                        checked={!!value}
                        onCheckedChange={onChange}
                        disabled={disabled || locked}
                        className={locked ? "opacity-60" : ""}
                    />
                    {label && (
                        <Label
                            htmlFor={label}
                            className={cn("text-sm font-medium cursor-pointer", locked && "opacity-60")}
                        >
                            {label}
                            {locked && <Lock className="inline w-3 h-3 ml-2 text-amber-500" />}
                        </Label>
                    )}
                </div>
            );
        }

        return (
            <div className="relative">
                <Input
                    type={type}
                    value={value}
                    onChange={handleInputChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled || locked}
                    min={min}
                    max={max}
                    className={commonClasses}
                />
                {locked && (
                    <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-muted-foreground/50" />
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn("space-y-2", className)}>
            {label && type !== "checkbox" && (
                <Label className="flex items-center gap-2 text-sm font-medium">
                    {label}
                    {required && <span className="text-red-500">*</span>}
                    {locked && <Lock className="w-3 h-3 text-amber-500" />}
                </Label>
            )}

            <div className={cn("relative group", locked && "cursor-not-allowed")}>
                {renderInput()}

                {locked && type !== "checkbox" && (
                    <div className="absolute inset-0 bg-background/5 hidden group-hover:flex items-center justify-center pointer-events-none z-10">
                        <span className="bg-primary text-primary-foreground text-[10px] px-2 py-1 rounded shadow-sm">
                            PRO FEATURE
                        </span>
                    </div>
                )}
            </div>

            {helperText && <p className="text-xs text-muted-foreground">{helperText}</p>}
            {error && <p className="text-xs text-red-500">{error}</p>}
        </div>
    );
}
