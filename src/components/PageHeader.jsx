import "./PageHeader.css";

function PageHeader({ icon: Icon, title, subtitle, theme = "indigo", children }) {
  return (
    <div className={`hero-header theme-${theme}`}>
      <span className="ph-circle one"></span>
      <span className="ph-circle two"></span>

      {Icon && (
        <span className="ph-icon">
          <Icon size={26} />
        </span>
      )}

      <div className="ph-text">
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>

      {children && <div className="ph-extra">{children}</div>}
    </div>
  );
}

export default PageHeader;