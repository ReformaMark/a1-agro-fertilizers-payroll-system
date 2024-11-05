"use client"

import { useQuery } from "@tanstack/react-query";
import { convexQuery } from "@convex-dev/react-query";
import { api } from "../../convex/_generated/api";

export default function Home() {

  const { data, isPending } = useQuery(convexQuery(api.task.get, {}))

  return (
    <div>
      {isPending ? "Loading..." : data?.title}
    </div>
  );
}
