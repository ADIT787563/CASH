"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { Loader2, Building2, User, Mail, Phone, MapPin, FileText, CheckCircle2 } from "lucide-react";

interface FormData {
  fullName: string;
  businessName: string;
  businessCategory: string;
  phoneNumber: string;
  businessEmail: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  gstNumber: string;
}

const BUSINESS_CATEGORIES = [
  "Clothing",
  "Services",
  "Electronics",
  "Bakery",
  "Beauty",
  "Handicraft",
  "Others"
];

export default function SetupProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    businessName: "",
    businessCategory: "",
    phoneNumber: "",
    businessEmail: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    gstNumber: "",
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login?redirect=/setup-profile");
    }
  }, [session, isPending, router]);

  // Load existing draft or profile data
  useEffect(() => {
    if (session?.user) {
      loadProfileData();
    }
  }, [session]);

  // Auto-save draft every 3 seconds when form has data
  useEffect(() => {
    if (!session?.user) return;

    const hasData = Object.values(formData).some(value => value.trim() !== "");
    if (!hasData) return;

    const autoSaveInterval = setInterval(() => {
      saveDraft();
    }, 3000);

    return () => clearInterval(autoSaveInterval);
  }, [formData, session]);

  const loadProfileData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/business-profile", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data.userId) {
          // Profile exists, load it
          setFormData({
            fullName: data.fullName || "",
            businessName: data.businessName || "",
            businessCategory: data.businessCategory || "",
            phoneNumber: data.phoneNumber || "",
            businessEmail: data.businessEmail || "",
            street: data.street || "",
            city: data.city || "",
            state: data.state || "",
            pincode: data.pincode || "",
            gstNumber: data.gstNumber || "",
          });

          // If profile is already complete, redirect to plans
          if (data.isComplete) {
            router.push("/plans");
          }
        }
      }
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const saveDraft = useCallback(async () => {
    if (isSaving || isLoading) return;

    try {
      setIsSaving(true);
      const token = localStorage.getItem("bearer_token");

      await fetch("/api/business-profile/draft", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      // Silent fail for auto-save
      console.error("Auto-save error:", error);
    } finally {
      setIsSaving(false);
    }
  }, [formData, isSaving, isLoading]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.businessName.trim()) {
      newErrors.businessName = "Business name is required";
    }

    if (!formData.businessCategory) {
      newErrors.businessCategory = "Select a category";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^(\+91)?[6-9]\d{9}$/.test(formData.phoneNumber.replace(/\s/g, ""))) {
      newErrors.phoneNumber = "Invalid phone number (10 digits required)";
    }

    if (!formData.businessEmail.trim()) {
      newErrors.businessEmail = "Business email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.businessEmail)) {
      newErrors.businessEmail = "Invalid email format";
    }

    if (!formData.street.trim()) {
      newErrors.street = "Street address is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Pincode must be 6 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    setIsLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/business-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to save profile");
        setIsLoading(false);
        return;
      }

      toast.success("Business profile completed successfully!");
      router.push("/plans");
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
            <Building2 className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Complete Your Business Profile</h1>
          <p className="text-muted-foreground">
            Please provide your business details to get started with WaveGroww
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-8 h-1 bg-primary rounded-full"></div>
              <span className="font-medium text-foreground">Step 1 of 1 – Business Setup</span>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="glass-card p-8 rounded-2xl shadow-lg">
          {/* Auto-save indicator */}
          {isSaving && (
            <div className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving draft...</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Personal Information</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Full Name <span className="text-destructive">*</span>
                </label>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange("fullName", e.target.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${errors.fullName ? "border-destructive" : "border-border"
                    } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                  placeholder="Enter your full name"
                />
                {errors.fullName && (
                  <p className="text-sm text-destructive mt-1">{errors.fullName}</p>
                )}
              </div>
            </div>

            {/* Business Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Building2 className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Business Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Name <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) => handleChange("businessName", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.businessName ? "border-destructive" : "border-border"
                      } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    placeholder="e.g., My Fashion Store"
                  />
                  {errors.businessName && (
                    <p className="text-sm text-destructive mt-1">{errors.businessName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Category <span className="text-destructive">*</span>
                  </label>
                  <select
                    value={formData.businessCategory}
                    onChange={(e) => handleChange("businessCategory", e.target.value)}
                    title="Select your business category"
                    className={`w-full px-4 py-3 rounded-xl border ${errors.businessCategory ? "border-destructive" : "border-border"
                      } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                  >
                    <option value="">Select category</option>
                    {BUSINESS_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {errors.businessCategory && (
                    <p className="text-sm text-destructive mt-1">{errors.businessCategory}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Examples: Clothing, Services, Electronics, Bakery, Beauty, Handicraft
                  </p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Phone className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Contact Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Phone Number <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={(e) => handleChange("phoneNumber", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.phoneNumber ? "border-destructive" : "border-border"
                      } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    placeholder="+91 9876543210"
                  />
                  {errors.phoneNumber && (
                    <p className="text-sm text-destructive mt-1">{errors.phoneNumber}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Business Email <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.businessEmail}
                    onChange={(e) => handleChange("businessEmail", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.businessEmail ? "border-destructive" : "border-border"
                      } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    placeholder="business@example.com"
                  />
                  {errors.businessEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.businessEmail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Business Address */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Business Address</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Street <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.street}
                    onChange={(e) => handleChange("street", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.street ? "border-destructive" : "border-border"
                      } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    placeholder="Street address"
                  />
                  {errors.street && (
                    <p className="text-sm text-destructive mt-1">{errors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      City <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => handleChange("city", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.city ? "border-destructive" : "border-border"
                        } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                      placeholder="City"
                    />
                    {errors.city && (
                      <p className="text-sm text-destructive mt-1">{errors.city}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      State <span className="text-destructive">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => handleChange("state", e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border ${errors.state ? "border-destructive" : "border-border"
                        } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                      placeholder="State"
                    />
                    {errors.state && (
                      <p className="text-sm text-destructive mt-1">{errors.state}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Pincode <span className="text-destructive">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.pincode}
                    onChange={(e) => handleChange("pincode", e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${errors.pincode ? "border-destructive" : "border-border"
                      } bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all`}
                    placeholder="123456"
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <p className="text-sm text-destructive mt-1">{errors.pincode}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Tax Information (Optional) */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Tax Information (Optional)</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  GST Number
                </label>
                <input
                  type="text"
                  value={formData.gstNumber}
                  onChange={(e) => handleChange("gstNumber", e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  placeholder="22AAAAA0000A1Z5"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6">
              <button
                type="button"
                onClick={() => toast.info("Please complete your business details to continue.")}
                className="flex-1 px-6 py-3 border border-border rounded-xl font-medium text-foreground hover:bg-muted transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    Save & Continue
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Your information is secure and will only be used for business purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
