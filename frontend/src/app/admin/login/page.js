import StaffLoginForm from "../../components/admin/StaffLoginForm";
import BrandLogo from "../../components/BrandLogo";

export const metadata = {
  title: "Staff Login | Roho",
};

export default function AdminLoginPage() {
  return (
    <main className="adminLoginPage">
      <div className="adminLoginHero">
        <div className="adminLoginBrandRow"><BrandLogo label="ROHO" /><span>Staff</span></div>
        <h1>Secure access for authorised team members</h1>
        <span>Manage leads, enquiries, appointments and staff operations from the private ROHO workspace.</span>
      </div>
      <div className="adminLoginCard">
        <p>Staff Portal</p>
        <h2>Sign in</h2>
        <StaffLoginForm />
      </div>
    </main>
  );
}
