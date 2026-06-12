import { SvgIcon } from "@progress/kendo-react-common";
import { checkIcon } from "@progress/kendo-svg-icons";

interface JoinedBadgeProps {
  className: string;
}

export default function JoinedBadge({ className }: JoinedBadgeProps) {
  return (
    <span className={className} aria-label="Joined">
      <SvgIcon icon={checkIcon} className="joined-badge-icon" />
      Joined
    </span>
  );
}
