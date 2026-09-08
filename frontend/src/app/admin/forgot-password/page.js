import ForgotPasswordForm from "../../components/admin/auth/ForgotPasswordForm";
import BrandLogo from "../../components/BrandLogo";

export const metadata = {
  title: "Forgot Password | Roho Staff",
};

export default function ForgotPasswordPage() {
  return (
    <main className="adminLoginPage">
      <div>
        <div className="adminLoginBrandRow"><BrandLogo label="ROHO" /><span>Staff</span></div>
        <h1>Staff Account Recovery</h1>
        <p className="adminAuthIntro">Enter your registered staff email to request reset instructions.</p>
        <ForgotPasswordForm />
      </div>
    </main>
  );
}
