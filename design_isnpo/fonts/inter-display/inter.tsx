import localFont from "next/font/local";

export const inter = localFont({
  src: [
    {
      path: "./Inter-Light.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./Inter-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Inter-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Inter-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./Inter-Bold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./Inter-ExtraBold.ttf",
      weight: "800",
      style: "normal",
    },
    {
      path: "./Inter-Black.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-inter",
  display: "swap",
});
