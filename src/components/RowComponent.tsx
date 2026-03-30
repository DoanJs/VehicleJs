import { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  styles?: CSSProperties;
  onClick?:() => void
  justify?:
    | "center"
    | "flex-start"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly"
    | undefined;
}

export default function RowComponent(props: Props) {
  const { children, styles, justify, onClick } = props;
  return (
    <div
      style={{
        display:'flex',
        flexDirection: "row",
        alignItems: "center",
        justifyContent: justify ?? "flex-start",
        ...styles,
      }}
      onClick={onClick ? onClick : undefined}
    >
      {children}
    </div>
  );
}
