import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";

export default async function Home() {
 return(
  <div>
   <h1 className="font-bold">Hello World</h1>
  </div>
 )
}
