import { Link } from "react-router-dom";
import { VehicleModel } from "../../models";

export default function VehicleItem({
  item,
}: {
  item: VehicleModel;
}) {
  const getBadgeClass = (status: string) => {
    switch (status) {
      case "borrowed":
        return "bg-success-subtle text-success border border-success-subtle";
      case "available":
        return "bg-warning-subtle text-warning border border-warning-subtle";
      case "maintenance":
        return "bg-danger-subtle text-danger border border-danger-subtle";
      default:
        return "bg-secondary-subtle text-secondary border border-secondary-subtle";
    }
  };

  return (
    <tr key={`${item.name}-${item.plate}`}>
      <td className="fw-semibold">
        <Link to={"/"}>{item.name}</Link>
      </td>
      <td>{item.plate}</td>
      <td>{item.currentKm}</td>
      <td>
        {item.fuelLevel === "full"
          ? "Đầy"
          : item.fuelLevel === "three_quarters"
            ? "3/4"
            : item.fuelLevel === "half"
              ? "1/2"
              : item.fuelLevel === "quarter"
                ? "1/4"
                : "Hết"}
      </td>

      <td>
        <span
          className={`badge rounded-pill px-3 py-2 ${getBadgeClass(item.status)}`}
        >
          {item.status === "available"
            ? "Đang rảnh"
            : item.status === "borrowed"
              ? "Đang dùng"
              : "Đang bảo trì"}
        </span>
      </td>

      <td>{item.borrowedByName ?? ""}</td>
      <td>{item.borrowedReason ?? ""}</td>
    </tr>
  );
}
