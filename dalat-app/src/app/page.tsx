// import Image from "next/image";

import Map from "@/components/Map";

export default function Home() {
  return (
    <div>
      <h1>Đồi chè cầu đất</h1>
      <div style={{ width: "60%" }}>
        <Map lat={11.8777526} lon={108.5603366} name="Đồi chè Cầu Đất" />
      </div>
    </div>
  );
}
