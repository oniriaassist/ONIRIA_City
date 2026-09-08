import { Suspense } from "react";
import ForgotEmailForm from "../../components/admin/auth/ForgotEmailForm";
import BrandLogo from "../../components/BrandLogo";

export const metadata = {
  title: "Forgot Staff Email | Roho",
};

export default function ForgotEmailPage() {
  return (
    <main className="adminLoginPage">
      <div>
        <div className="adminLoginBrandRow"><BrandLogo label="ROHO" /><span>Staff</span></div>
        <h1>Recover Staff Access</h1>
        <p className="adminAuthIntro">Submit a request for an authorised ROHO administrator to review manually.</p>
        <Suspense fallback={<div className="adminLoading">Loading recovery form...</div>}>
          <ForgotEmailForm />
        </Suspense>
      </div>
    </main>
  );
}
