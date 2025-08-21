import { skipToken, useQuery } from "@tanstack/react-query";
import { useDustClient } from "./useDustClient";

type CursorPosition = {
  x: number;
  y: number;
  z: number;
};

export function useCursorPositionQuery() {
  const { data: dustClient } = useDustClient();

  return useQuery<CursorPosition | null>({
    queryKey: ["cursorPosition"],
    queryFn: !dustClient
      ? skipToken
      : async () => {
          //console.log("Refetching cursor position...");
          const position = await dustClient.provider.request({
            method: "getCursorPosition",
          });
          if (!position) {
            return null;
          }
          //console.log("Backend returned cursor position:", position);
          return {
            x: Math.floor(position.x),
            y: Math.floor(position.y),
            z: Math.floor(position.z),
          };
        },
    enabled: Boolean(dustClient),
    refetchIntervalInBackground: true,
    refetchInterval: 500,
  });
}
