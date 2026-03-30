import { CSSProperties } from "react";
import { colors } from "../constants/colors";
import { sizes } from "../constants/sizes";

interface Props {
  text: string;
  size?: number;
  font?: string;
  flex?: number;
  numberOfLine?: number;
  color?: string;
  type?:
    | "bigTitle"
    | "title"
    | "smallTitle"
    | "thinTitle"
    | "bigText"
    | "text"
    | "smallText";
  styles?: CSSProperties;
}

export default function TextComponent(props: Props) {
  const { text, size, color, flex, styles, type } = props;
  let fontSize: number = sizes.text;

  switch (type) {
    case "bigTitle":
      fontSize = sizes.bigTitle;
      break;
    case "title":
      fontSize = sizes.title;
      break;
    case "smallTitle":
      fontSize = sizes.smallTitle;
      break;
    case "thinTitle":
      fontSize = sizes.thinTitle;
      break;
    case "bigText":
      fontSize = sizes.bigText;
      break;
    case "smallText":
      fontSize = sizes.smallText;
      break;
    default:
      fontSize = sizes.text;
      break;
  }

  return (
    <p
      style={{
        display: "flex",
        flex: flex,
        fontSize: size ?? fontSize,
        color: color ?? colors.text,
        margin: 0,
        ...styles,
      }}
    >
      {text}
    </p>
  );
}
