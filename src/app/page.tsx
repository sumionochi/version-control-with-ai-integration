import Link from "next/link";

import { LatestPost } from "@/app/_components/post";
import { api, HydrateClient } from "@/trpc/server";
import { Button } from '@progress/kendo-react-buttons';

export default async function Home() {
 return(
  <div>
    <Button>
      Hello World
    </Button>
  </div>
 )
}
