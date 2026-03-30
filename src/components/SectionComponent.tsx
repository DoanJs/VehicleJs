import { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  styles?: CSSProperties;
}

export default function SectionComponent(props: Props) {
  const { children, styles } = props;
  return (
    <div
      style={{
        paddingLeft: 16,
        paddingRight: 16,
        marginBottom: 16,
        ...styles,
      }}
    >
      {children}
    </div>
  );
}
