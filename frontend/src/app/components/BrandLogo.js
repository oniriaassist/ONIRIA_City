export default function BrandLogo({ className = "", label }) {
  const classes = ["rohoBrandLogo", className].filter(Boolean).join(" ");
  const accessibility = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true };

  return <span className={classes} {...accessibility} />;
}
