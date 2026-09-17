"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { adminApi } from "../../services/adminApi";
import { AdminLoadingScreen, StaffAvatar } from "./AdminUI";
import BrandLogo from "../BrandLogo";

const navGroups = [
  ["Core", [
    ["Dashboard", "/admin", null, "DA"],
    ["Leads", "/admin/leads", null, "LE"],
    ["Enquiries", "/admin/enquiries", null, "EN"],
  ]],
  ["Appointments", [
    ["Consultations", "/admin/consultations", null, "CO"],
    ["Site Visits", "/admin/site-visits", null, "SV"],
  ]],
  ["Content and Communication", [
    ["Brochures", "/admin/brochure-requests", null, "BR"],
    ["WhatsApp", "/admin/whatsapp", null, "WA"],
    ["Campaigns", "/admin/campaigns", null, "CA"],
  ]],
  ["Operations", [
    ["Follow-ups", "/admin/follow-ups", null, "FU"],
    ["Subscribers", "/admin/subscribers", ["administrator", "marketing_staff"], "SU"],
  ]],
  ["Administration", [
    ["Account Recovery", "/admin/account-recovery", ["administrator"], "AR"],
    ["Staff", "/admin/staff", ["administrator"], "ST"],
  ]],
];

export default function AdminLayout({ title, children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [session, setSession] = useState(null);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState("");
  const [timedOut, setTimedOut] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const checkStartedRef = useRef(false);
  const redirectedRef = useRef(false);

  useEffect(() => {
    if (checkStartedRef.current) {
      return;
    }
    checkStartedRef.current = true;
    setTimedOut(false);
    adminApi
      .cachedSession()
      .then((result) => {
        setSession(result);
        setStatus("authenticated");
      })
      .catch(() => {
        setStatus("unauthenticated");
        if (!redirectedRef.current) {
          redirectedRef.current = true;
          router.replace("/admin/login");
        }
      });
  }, [router]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      if (status === "loading") {
        setTimedOut(true);
      }
    }, 9000);
    return () => {
      window.clearTimeout(timeout);
    };
  }, [status]);

  function retrySession() {
    adminApi.session().then((result) => {
      setSession(result);
      setStatus("authenticated");
      setTimedOut(false);
    }).catch(() => {
      setTimedOut(true);
    });
  }

  async function logout() {
    try {
      await adminApi.logout();
      router.replace("/admin/login");
    } catch (err) {
      setError(err.message);
    }
  }

  if (status === "loading") {
    return <AdminLoadingScreen timedOut={timedOut} onRetry={retrySession} />;
  }

  if (status === "unauthenticated" || !session) {
    return <AdminLoadingScreen title="Redirecting to sign in" message="Your staff session could not be verified." />;
  }

  const staffName = session.staff.full_name;
  const primaryRole = session.staff.roles?.[0]?.replace(/_/g, " ") || "staff";

  return (
    <main className="adminShell">
      {sidebarOpen && <button className="adminSidebarBackdrop" type="button" aria-label="Close navigation" onClick={() => setSidebarOpen(false)} />}
      <aside className={`adminSidebar ${sidebarOpen ? "isOpen" : ""}`}>
        <div className="adminBrandBlock">
          <Link href="/admin" className="adminBrand" aria-label="ROHO dashboard" prefetch={false} onClick={() => setSidebarOpen(false)}>
            <BrandLogo />
          </Link>
          <span>Private Staff Area</span>
        </div>
        <nav aria-label="Staff navigation">
          {navGroups.map(([group, items]) => {
            const visibleItems = items.filter(([, , roles]) => !roles || roles.some((role) => session.staff.roles?.includes(role)));
            if (!visibleItems.length) return null;
            return (
              <section className="adminNavGroup" key={group}>
                <p>{group}</p>
                {visibleItems.map(([label, href, , icon]) => {
                  const active = href === "/admin" ? pathname === href : pathname?.startsWith(href);
                  return (
                    <Link
                      href={href}
                      key={href}
                      prefetch={false}
                      className={active ? "isActive" : ""}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <span className="adminNavIcon" aria-hidden="true">{icon}</span>
                      {label}
                    </Link>
                  );
                })}
              </section>
            );
          })}
        </nav>
      </aside>

      <section className="adminMain">
        <header className="adminTopbar">
          <button className="adminMenuButton" type="button" aria-label="Open navigation" onClick={() => setSidebarOpen(true)}>
            <span />
            <span />
            <span />
          </button>
          <div>
            <p>STAFF WORKSPACE</p>
            <h1>{title}</h1>
          </div>
          <div className="adminStaffBadge">
            <StaffAvatar name={staffName} />
            <div>
              <strong>{staffName}</strong>
              <span>{primaryRole}</span>
            </div>
            <button type="button" onClick={logout}>
              Logout
            </button>
          </div>
        </header>
        {error && <div className="adminError">{error}</div>}
        {children}
      </section>
    </main>
  );
}
