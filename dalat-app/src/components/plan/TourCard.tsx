import React from 'react';
import Image from 'next/image';
// import { useRouter } from 'next/navigation';

interface TourCardProps {
  title: string;
  cost: number;
  days: number;
  places: number;
  image: string;
}

const TourCard: React.FC<TourCardProps> = ({ title, cost, days, places, image }) => {
  // const router = useRouter();

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <Image 
        src={"/imgs/dx.jpg"} alt={title} width={500} height={192} 
        className="w-full h-48 object-cover rounded" 
      />
      <div className="mt-2">
        <h3 className="font-bold">{title}</h3>
        <p>Chi phí: {cost.toLocaleString()} VNĐ</p>
        <p>Số ngày: {days} </p>
        <p>Địa điểm gợi ý: {places} </p>
      </div>
    </div>
  );
};

export default TourCard;