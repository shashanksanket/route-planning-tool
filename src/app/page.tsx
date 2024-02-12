import Image from "next/image";
import Map from "@/components/Map/map";
import Input from "@/components/Input/input";

export default function Home() {
  return (
    <main className="flex flex-col gap-y-10 m-4">
      <Map/>
      <Input/>
    </main>
  );
}
