function StatCard({
  title,
  value,
  icon: Icon,
  color = "blue",
  onClick,
  trend,
}) {
  return (
    <button
      type="button"
      className="stat-card stat-card-button"
      onClick={onClick}
      title={`Open ${title}`}
    >
      <div className="stat-content">
        <p>{title}</p>

        <h2>{value}</h2>

        <span className="stat-status">
          <span>●</span> {trend || "Updated today"}
        </span>
      </div>

      <div className={`stat-icon ${color}`}>
        <Icon size={24} />
      </div>
    </button>
  );
}

export default StatCard;