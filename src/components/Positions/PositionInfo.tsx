import { twMerge } from "tailwind-merge";
import { cloneElement, useEffect } from "react";
import GrowthIcon from "@carbon/icons-react/lib/Growth";
import EditIcon from "@carbon/icons-react/lib/Edit";
import ChevronDownIcon from "@carbon/icons-react/lib/ChevronDown";
import { ACCOUNT_URL } from "@/utils/TransactionHandlers";
import NewTab from "@carbon/icons-react/lib/NewTab";

import { getTokenEIcon, getTokenELabel, asTokenE } from "@/utils/TokenUtils";
import { PositionColumn } from "./PositionColumn";
import { PositionValueDelta } from "./PositionValueDelta";
import { isVariant, Side } from "@/types/index";
import { PositionAccount } from "@/lib/PositionAccount";

function formatPrice(num: number) {
  const formatter = new Intl.NumberFormat("en", {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  });
  return formatter.format(num);
}

interface Props {
  className?: string;
  expanded?: boolean;
  position: PositionAccount;
  onClickExpand?(): void;
}

export function PositionInfo(props: Props) {
  const tokenIcon = getTokenEIcon(props.position.custodyConfig.symbol);
  

  return (
    <div className={twMerge("flex", "items-center", "py-5", props.className)}>
      <PositionColumn num={1}>
        <div
          className={twMerge(
            "gap-x-2",
            "grid-cols-[32px,minmax(0,1fr)]",
            "grid",
            "items-center",
            "overflow-hidden",
            "pl-3"
          )}
        >
          {cloneElement(tokenIcon, {
            className: twMerge(
              tokenIcon.props.className,
              "flex-shrink-0",
              "h-8",
              "w-8"
            ),
          })}
          <div className="pr-2">
            <div className="font-bold text-white">{props.position.custodyConfig.symbol}</div>
            <div className="mt-0.5 truncate text-sm font-medium text-zinc-500">
              {getTokenELabel(asTokenE(props.position.custodyConfig.symbol))}
            </div>
          </div>
        </div>
      </PositionColumn>
      <PositionColumn num={2}>
        <div className="text-sm text-white">{props.position.leverage ?? "1"}x</div>
        <div
          className={twMerge(
            "flex",
            "items-center",
            "mt-1",
            "space-x-1",
            isVariant(props.position.side, 'long')
              ? "text-emerald-400"
              : "text-rose-400"
          )}
        >
          { 
             isVariant(props.position.side, 'long')
            ? 
              <GrowthIcon className="h-3 w-3 fill-current" />
            
            : 
              <GrowthIcon className="h-3 w-3 -scale-y-100 fill-current" />
        
          }
          <div className="text-sm">
            {
                isVariant(props.position.side, 'long')
               ? "Long" : "Short"}
          </div>
        </div>
      </PositionColumn>
      <PositionColumn num={3}>
        <div className="text-sm text-white">
          ${formatPrice(props.position.sizeUsd.toNumber()/ 10**6)}
        </div>
        <PositionValueDelta
          className="mt-0.5"
          valueDelta={props.position.pnlUsd.toNumber()}
          valueDeltaPercentage={(1 - (props.position.collateralUsd.toNumber() / props.position.collateralUsd.toNumber()))*100}
        />
      </PositionColumn>
      <PositionColumn num={4}>
        <div className="flex items-center">
          <div className="text-sm text-white">
            ${formatPrice(props.position.collateralUsd.toNumber()/ 10**6)}
          </div>
          <button className="group ml-2">
            <EditIcon
              className={twMerge(
                "fill-zinc-500",
                "h-4",
                "transition-colors",
                "w-4",
                "group-hover:fill-white"
              )}
            />
          </button>
        </div>
      </PositionColumn>
      <PositionColumn num={5}>
        <div className="text-sm text-white">
          ${formatPrice(props.position.price.toNumber() / 10**6)}
        </div>
      </PositionColumn>
      {/* <PositionColumn num={6}>
        <div className="text-sm text-white">
          ${formatPrice(props.position.markPrice)}
        </div>
      </PositionColumn> */}
      <PositionColumn num={6}>
        <div className="flex items-center justify-between pr-2">
          <div className="text-sm text-white">
            ${formatPrice(props.position.liquidationPriceUsd.toNumber() / 10**6)}
          </div>
          <div className="flex items-center space-x-2">
            <a
              target="_blank"
              rel="noreferrer"
              href={`${ACCOUNT_URL(
                props.position.publicKey.toBase58()
              )}`}
            >
              <NewTab className="fill-white" />
            </a>
            <button
              className={twMerge(
                "bg-zinc-900",
                "grid",
                "h-6",
                "place-items-center",
                "rounded-full",
                "transition-all",
                "w-6",
                "hover:bg-zinc-700",
                props.expanded && "-rotate-180"
              )}
              onClick={() => props.onClickExpand?.()}
            >
              <ChevronDownIcon className="h-4 w-4 fill-white" />
            </button>
          </div>
        </div>
      </PositionColumn>
    </div>
  );
}
