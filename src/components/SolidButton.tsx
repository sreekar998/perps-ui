import { useWallet } from "@solana/wallet-adapter-react";
import { forwardRef, useState } from "react";
import { twMerge } from "tailwind-merge";
import { LoadingSpinner } from "./Icons/LoadingSpinner";

import { LoadingDots } from "./LoadingDots";
import { notify } from "./Notify";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean;
}

export const SolidButton = forwardRef<HTMLButtonElement, Props>(
  function SolidButton(props, ref) {
    const { ...rest } = props;
    const [loading, setLoading] = useState(false);
    const { publicKey } = useWallet()

    const handleClick = async (e) => {
      if (!publicKey) {
          notify('Connect Wallet', 'warn')
          return
      }
      setLoading(true)
      try {
          await rest.onClick?.(e);
      } catch (error) {
          console.error("ButtonWithLoading onClick error:", error)
      }
      setLoading(false)
  }

    return (
      <button
        {...rest}
        ref={ref}
        className={twMerge(
          "bg-purple-500",
          "flex",
          "group",
          "h-14",
          "items-center",
          "justify-center",
          "p-3",
          "relative",
          "rounded",
          "text-white",
          "tracking-normal",
          "transition-colors",
          rest.className,
          !loading && "active:bg-purple-500",
          "disabled:bg-zinc-300",
          "disabled:cursor-not-allowed",
          !loading && "hover:bg-purple-400",
          loading && "cursor-not-allowed"
        )}
        onClick={(e) => {

          handleClick(e)
          // if (!loading && !rest.disabled) {
          //   rest.onClick?.(e);
          // }
        }}
      >
        <div
          className={twMerge(
            "flex",
            "items-center",
            "justify-center",
            "text-current",
            "text-sm",
            "transition-all",
            "group-disabled:text-neutral-400",
            loading ? "opacity-0" : "opacity-100"
          )}
        >
         
          {rest.children}
        </div>
        {loading && (
          <LoadingSpinner className="absolute text-4xl"/>
        )}
      </button>
    );
  }
);
