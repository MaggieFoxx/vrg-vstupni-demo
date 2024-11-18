import { Tooltip } from "react-tooltip";
import { tooltipStyles } from "../style";
import "react-tooltip/dist/react-tooltip.css";

interface TooltipButtonProps {
  type: "submit" | "reset" | "button" | undefined;
  onClick: () => void;
  tooltipId: string;
  tooltipContent: string;
  buttonClass: string;
  buttonText: string;
}

export const TooltipButton: React.FC<TooltipButtonProps> = ({
  type,
  onClick,
  tooltipId,
  tooltipContent,
  buttonClass,
  buttonText,
}) => (
  <>
    <button
      type={type}
      className={buttonClass}
      onClick={onClick}
      data-tooltip-id={tooltipId}
      data-tooltip-content={tooltipContent}
    >
      {buttonText}
    </button>
    <Tooltip id={tooltipId} place="top" style={tooltipStyles} />
  </>
);
