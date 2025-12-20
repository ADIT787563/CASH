"use client";

import { SettingsSection } from "./SettingsSection";
import { TeamManagement } from "@/components/TeamManagement";

export function TeamSettings() {
    return (
        <SettingsSection
            title="Team & Roles"
            description="Manage access to your dashboard. Invite staff and assign roles."
        >
            <TeamManagement />
        </SettingsSection>
    );
}
