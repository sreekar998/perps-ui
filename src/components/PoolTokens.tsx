import { twMerge } from "tailwind-merge";
import { cloneElement } from "react";

import { getTokenEIcon, TokenE } from "@/utils/TokenUtils";

interface Props {
  className?: string;
  tokens: string[];
}

export function PoolTokens(props: Props) {
  return (
    <div className="flex items-center -space-x-6">
      {props.tokens.slice(0, 3).map((token, i) => {
        const tokenIcon = getTokenEIcon(token);

        return cloneElement(tokenIcon, {
          className: twMerge(
            tokenIcon.props.className,
            props.className,
            "border-black",
            "border",
            "rounded-full",
            "relative"
          ),
          style: { zIndex: 3 - i },
          key: token,
        });
      })}
    </div>
  );
}
