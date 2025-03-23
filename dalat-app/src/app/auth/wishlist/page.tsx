'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { getMyWishlist, removeFromWishlist } from '@/services/wishlist';
import { FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';
import type { Wishlist } from '@/models/Wishlist';
import Pagination from '@/components/Pagination';
import { useRouter } from 'next/navigation';

export default function Wishlist() {
    const [wishlist, setWishlist] = useState<Wishlist[]>([]);
    const [keyword, setKeyword] = useState('');
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const router = useRouter();

    const fetchMyWishlist = async () => {
        try {
            const response = await getMyWishlist(keyword, currentPage, 8);
            setWishlist(response.content);
            setTotalPages(response.page.totalPages);
            console.log('Wishlist data:', response.content); // Để debug
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    };

    const handleRemove = async (id: number) => {
        Swal.fire({
            title: 'Bạn có chắc chắn muốn xóa khỏi yêu thích?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Xóa',
            confirmButtonColor: '#d33',
            cancelButtonText: 'Hủy',
            cancelButtonColor: '#3085d6',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const response = await removeFromWishlist(id);
                    if (response) {
                        toast.success('Đã xóa khỏi yêu thích', {
                            autoClose: 3000,
                        });
                        fetchMyWishlist();
                    }
                } catch (error) {
                    console.error('Error removing from wishlist:', error);
                    toast.error('Đã xảy ra lỗi, vui lòng thử lại sau', {
                        autoClose: 3000,
                    });
                }
            }
        });
    };

    useEffect(() => {
        fetchMyWishlist();
    }, [keyword, currentPage]);

    // Lọc danh sách dựa trên keyword
    const filteredWishlist = wishlist.filter((item) => {
        const place = item.place || item;
        return place.name.toLowerCase().includes(keyword.toLowerCase());
    });

    return (
        <div 
            className="container mx-auto p-6"
            style={{ minHeight: 500 }}
        >
            <h1 className="text-3xl font-bold mb-6 text-gray-800">Danh Sách Yêu Thích</h1>

            {/* Thanh tìm kiếm */}
            <div className="mb-6">
                <input
                    type="text"
                    placeholder="Tìm kiếm địa điểm..."
                    value={keyword}
                    onChange={(e) => setKeyword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
            </div>

            {filteredWishlist.length === 0 ? (
                <p className="text-gray-500 text-center">Danh sách yêu thích của bạn trống.</p>
            ) : (
                <>
                    <div 
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6"
                        style={{ minHeight: '90vh' }}
                    >
                        {filteredWishlist.map((item) => {
                            const place = item.place || item;

                            return (
                                <div
                                    key={place.id || item.id || Math.random()}
                                    className="border rounded-lg shadow-md p-4 bg-white relative hover:shadow-xl transition-shadow duration-300 hover:cursor-pointer transform hover:-translate-y-1"
                                    style={{ height: '370px' }}
                                >
                                    <div 
                                        className="relative w-full h-48 mb-4 overflow-hidden rounded-lg"
                                        onClick={() => router.push(`/place/${place.id}`)}
                                    >
                                        <Image
                                            src={`${process.env.NEXT_PUBLIC_API_URL}/files/preview/${place.imageCode}`}
                                            alt={place.name || 'Địa điểm'}
                                            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                                            width={300}
                                            height={192}
                                            onError={(e) => {
                                                e.currentTarget.src = '/placeholder-image.jpg';
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-xl font-semibold line-clamp-2 mb-2 text-gray-900">
                                        {place.name}
                                    </h3>
                                    <p className="text-sm text-gray-600 line-clamp-2">{place.address}</p>
                                    <button
                                        className="mt-4 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors duration-300 flex items-center justify-center"
                                        onClick={() => handleRemove(item.id || place.id)}
                                    >
                                        <FaTimes className="mr-2" /> Xóa khỏi yêu thích
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <div className='mt-2'>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={(newPage) => setCurrentPage(newPage)}
                        />
                    </div>
                </>
            )}
            <ToastContainer />
        </div>
    );
}