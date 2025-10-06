"use client";

import React, { useMemo, useState } from "react";
import { Container } from "./container";
import { pricingTable, tiers, TierName } from "@/constants/pricing";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { SlidingNumber } from "./sliding-number";
import Link from "next/link";

export const PricingTable = () => {
  const [cycle, setCycle] = useState<"monthly" | "yearly">("monthly");

  const orderedTierNames: TierName[] = useMemo(
    () => [TierName.TIER_1, TierName.TIER_2, TierName.TIER_3],
    [],
  );

  const titleToPrice: Record<string, { monthly: number; yearly: number }> =
    useMemo(() => {
      const map: Record<string, { monthly: number; yearly: number }> = {};
      tiers.forEach((t) => {
        map[t.title] = { monthly: t.monthly, yearly: t.yearly };
      });
      return map;
    }, []);

  return (
    <section>
      <Container className="border-divide border-x">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="">
              <tr className="border-divide divide-divide divide-x border-b">
                <th className="min-w-[220px] px-4 pt-12 pb-8 align-bottom text-sm font-medium text-gray-600 dark:text-neutral-200">
                  <div className="mb-2 text-sm font-normal text-gray-600 dark:text-neutral-200">
                    Select a preferred cycle
                  </div>
                  <div className="inline-flex rounded-md bg-gray-100 p-1 dark:bg-neutral-800">
                    {[
                      { label: "Monthly", value: "monthly" },
                      { label: "Yearly", value: "yearly" },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() =>
                          setCycle(opt.value as "monthly" | "yearly")
                        }
                        className={cn(
                          "relative z-10 rounded-md px-3 py-1 text-sm text-gray-800 dark:text-white",
                          cycle === opt.value &&
                            "shadow-aceternity bg-white dark:bg-neutral-900 dark:text-white",
                        )}
                        aria-pressed={
                          cycle === (opt.value as "monthly" | "yearly")
                        }
                        type="button"
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </th>
                {orderedTierNames.map((tierName) => (
                  <th
                    key={`hdr-${tierName}`}
                    className="min-w-[220px] px-4 pt-12 pb-8 align-bottom"
                  >
                    <div className="text-charcoal-700 text-lg font-medium dark:text-neutral-100">
                      {tierName}
                    </div>
                    <div className="flex items-center text-sm font-normal text-gray-600 dark:text-neutral-300">
                      $<SlidingNumber value={titleToPrice[tierName]?.[cycle]} />
                      /seat billed{" "}
                      {cycle === "monthly" ? "monthly" : "annually"}
                    </div>
                    <Button
                      as={Link}
                      href="/sign-up"
                      className="mt-4 w-full"
                      variant="secondary"
                    >
                      Start for free
                    </Button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="">
              {pricingTable.map((row, index) => (
                <tr
                  key={row.title}
                  className={cn(
                    "border-divide divide-divide divide-x border-b",
                    index % 2 === 0 && "bg-gray-50 dark:bg-neutral-800",
                  )}
                >
                  <td className="text-charcoal-700 flex px-4 py-6 text-center text-sm dark:text-neutral-100">
                    {row.title}
                  </td>
                  {orderedTierNames.map((tierName) => {
                    const tierVal = row.tiers.find(
                      (t) => t.title === tierName,
                    )?.value;
                    return (
                      <td
                        key={`${row.title}-${tierName}`}
                        className="text-charcoal-700 mx-auto px-4 py-6 text-center text-sm dark:text-neutral-100"
                      >
                        {tierVal}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
};

export default PricingTable;
