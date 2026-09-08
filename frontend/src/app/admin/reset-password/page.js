import { Suspense } from "react";
import ResetPasswordForm from "../../components/admin/auth/ResetPasswordForm";
import BrandLogo from "../../components/BrandLogo";

export const metadata = {
  title: "Reset Staff Password | Roho",
};

export default function ResetPasswordPage() {
  return (
    <main className="adminLoginPage">
      <div>
        <div className="adminLoginBrandRow"><BrandLogo label="ROHO" /><span>Staff</span></div>
        <h1>Reset Staff Password</h1>
        <p className="adminAuthIntro">Create a new password for your private ROHO staff access.</p>
        <Suspense fallback={<div className="adminLoading">Loading reset form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
