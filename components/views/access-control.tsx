"use client";

import { ArrowLeft, Info, Lock, ShieldCheck } from "@phosphor-icons/react";
import { useState } from "react";
import { useApp } from "@/lib/app-context";
import {
  CONFIGURABLE_ROLES,
  FEATURE_META,
  ROLE_DISPLAY,
  type FeatureKey
} from "@/lib/permissions";
import type { Role } from "@/lib/types";

const FEATURE_GROUPS = ["Navigation", "Actions", "Content"] as const;

function Toggle({
  checked,
  onChange,
  locked,
  id
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  locked?: boolean;
  id: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={id}
      disabled={locked}
      onClick={() => !locked && onChange(!checked)}
      style={{
        width: 36,
        height: 20,
        borderRadius: 999,
        border: "none",
        padding: 2,
        background: locked ? "var(--outline-variant, rgba(208,194,213,0.4))" : checked ? "var(--primary)" : "var(--outline-variant, rgba(208,194,213,0.6))",
        cursor: locked ? "not-allowed" : "pointer",
        display: "flex",
        alignItems: "center",
        transition: "background 180ms ease",
        flexShrink: 0,
        opacity: locked ? 0.6 : 1
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#fff",
          transform: checked ? "translateX(16px)" : "translateX(0)",
          transition: "transform 180ms ease",
          display: "block",
          boxShadow: "0 1px 3px rgba(0,0,0,0.18)"
        }}
      />
    </button>
  );
}

export function AccessControl() {
  const { setView, permissions, setPermission, announce } = useApp();
  const [activeRole, setActiveRole] = useState<Role>(CONFIGURABLE_ROLES[0]);
  const [saved, setSaved] = useState(false);

  const rolePerms = (permissions[activeRole] ?? {}) as Partial<Record<FeatureKey, boolean>>;

  function handleToggle(feature: FeatureKey, value: boolean) {
    setPermission(activeRole, feature, value);
    setSaved(false);
  }

  function handleSave() {
    setSaved(true);
    announce(`Access rules for ${ROLE_DISPLAY[activeRole]} saved.`);
    setTimeout(() => setSaved(false), 3000);
  }

  function handleReset() {
    const { DEFAULT_PERMISSIONS } = require("@/lib/permissions");
    const defaults = DEFAULT_PERMISSIONS[activeRole];
    if (defaults) {
      Object.entries(defaults).forEach(([feature, value]) => {
        setPermission(activeRole, feature as FeatureKey, value as boolean);
      });
      announce(`Reset ${ROLE_DISPLAY[activeRole]} to defaults.`);
    }
  }

  return (
    <main className="stitch-main">
      <button
        type="button"
        className="stitch-nav-item"
        style={{ display: "inline-flex", width: "auto", marginBottom: 8 }}
        onClick={() => setView("admin")}
      >
        <ArrowLeft size={16} />
        <span>Admin</span>
      </button>

      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 22, color: "var(--on-surface)", margin: "0 0 6px" }}>
          Access Control
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", margin: 0 }}>
          Configure which features each role can access. Changes take effect immediately for all active sessions.
        </p>
      </div>

      {/* UKSSC staff notice */}
      <div style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "12px 16px", borderRadius: 10, background: "var(--primary-soft)", marginBottom: 24 }}>
        <ShieldCheck size={18} style={{ color: "var(--primary)", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 13, color: "var(--primary)", margin: 0, lineHeight: 1.5 }}>
          <strong>UKSSC EXCO</strong> always retains full access. Their permissions cannot be restricted from this panel.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 20, alignItems: "start" }}>
        {/* Role selector */}
        <div className="stitch-card" style={{ padding: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "var(--muted)", marginBottom: 10 }}>
            Role
          </p>
          <div style={{ display: "grid", gap: 4 }}>
            {CONFIGURABLE_ROLES.map((role) => {
              const active = role === activeRole;
              return (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: active ? "1.5px solid var(--primary)" : "1.5px solid transparent",
                    background: active ? "var(--primary-soft)" : "transparent",
                    textAlign: "left",
                    cursor: "pointer",
                    fontSize: 13,
                    fontWeight: active ? 700 : 500,
                    color: active ? "var(--primary)" : "var(--on-surface)",
                    transition: "all 150ms ease"
                  }}
                >
                  {ROLE_DISPLAY[role]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Permissions panel */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 16, color: "var(--on-surface)", margin: 0 }}>
              {ROLE_DISPLAY[activeRole]}
            </h3>
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" className="stitch-secondary" onClick={handleReset} style={{ fontSize: 13 }}>
                Reset to Defaults
              </button>
              <button type="button" className="stitch-primary" onClick={handleSave} style={{ fontSize: 13 }}>
                {saved ? <><ShieldCheck size={14} weight="fill" /> Saved</> : "Save Changes"}
              </button>
            </div>
          </div>

          {FEATURE_GROUPS.map((group) => {
            const features = (Object.entries(FEATURE_META) as [FeatureKey, typeof FEATURE_META[FeatureKey]][])
              .filter(([, meta]) => meta.group === group);

            return (
              <div key={group} className="stitch-card" style={{ padding: 0, marginBottom: 16, overflow: "hidden" }}>
                <div style={{ padding: "12px 20px", borderBottom: "1px solid var(--outline-variant, rgba(208,194,213,0.3))", background: "var(--surface-container, #faf7fb)" }}>
                  <h4 style={{ fontFamily: "Plus Jakarta Sans, sans-serif", fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--muted)", margin: 0 }}>
                    {group}
                  </h4>
                </div>
                <div>
                  {features.map(([feature, meta], i) => {
                    const isLocked = meta.locked?.includes(activeRole);
                    const isEnabled = isLocked ? true : (rolePerms[feature] ?? false);
                    return (
                      <div
                        key={feature}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 16,
                          padding: "14px 20px",
                          borderBottom: i < features.length - 1 ? "1px solid var(--outline-variant, rgba(208,194,213,0.2))" : "none"
                        }}
                      >
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--on-surface)" }}>{meta.label}</span>
                            {isLocked && <Lock size={12} style={{ color: "var(--muted)" }} />}
                          </div>
                          <span style={{ fontSize: 12, color: "var(--muted)" }}>{meta.description}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 12, fontWeight: 600, color: isLocked ? "var(--muted)" : isEnabled ? "var(--primary)" : "var(--muted)" }}>
                            {isLocked ? "Always on" : isEnabled ? "On" : "Off"}
                          </span>
                          <Toggle
                            id={`${activeRole}-${feature}`}
                            checked={isEnabled}
                            locked={isLocked}
                            onChange={(v) => handleToggle(feature, v)}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <div style={{ display: "flex", alignItems: "flex-start", gap: 8, padding: "12px 14px", borderRadius: 10, background: "var(--surface-container, #faf7fb)", border: "1px solid var(--outline-variant, rgba(208,194,213,0.3))" }}>
            <Info size={15} style={{ color: "var(--muted)", flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 12, color: "var(--muted)", margin: 0, lineHeight: 1.5 }}>
              Turning off a navigation item hides it from the sidebar. Users currently on that view are redirected to the dashboard. Changes are stored in session state; Supabase persistence comes with the data layer rollout.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
