'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { FaAngleDown } from 'react-icons/fa';
import { isAdmin, isAdminLogin, isAuthenticated, logout } from '@/services/auth';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';
import { useProfile } from '@/contexts/ProfileContext';
import Image from 'next/image';

const Navbar = () => {
  // const [isNewsOpen, setIsNewsOpen] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isContributeOpen, setIsContributeOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contributeRef = useRef<HTMLLIElement>(null);
  const router = useRouter();
  const { profile } = useProfile();

  const toggleDropdown = () => {
    setDropdownOpen(!isDropdownOpen);
  };

  const toggleContributeDropdown = () => {
    setIsContributeOpen(!isContributeOpen);
  };

  const handleLogout = async () => {
    Swal.fire({
      title: 'Bạn có chắc chắn muốn đăng xuất?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Đăng xuất',
      confirmButtonColor: '#d33',
      cancelButtonText: 'Hủy',
      cancelButtonColor: '#3085d6',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await logout();
          if (response) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.reload();
            toast.success("Đăng xuất thành công", {
              autoClose: 3000,
            });
            router.push('/home');
          }
        } catch (error) {
          console.error('Error logging out:', error);
          toast.error('Đã xảy ra lỗi, vui lòng thử lại sau', {
            autoClose: 3000,
          });
        }
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
      if (contributeRef.current && !contributeRef.current.contains(event.target as Node)) {
        setIsContributeOpen(false);
      }
    };

    if (isDropdownOpen || isContributeOpen) {
      window.addEventListener('click', handleClickOutside);
    }

    return () => {
      window.removeEventListener('click', handleClickOutside);
    };
  }, [isDropdownOpen, isContributeOpen]);

  return (
    <nav
      className="bg-[#0c2946] text-white py-2 pt-4"
      style={{ height: "14vh" }}
    >
      <div className="container mx-auto flex justify-between items-center px-4 align-middle">
        {/* Logo */}
        <Link href="/home"
          className="flex items-center space-x-2 hover:cursor-pointer"
        >
          <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-lg">🌸</span>
          </div>
          <div>
            <h1 className="text-xl font-bold text-green-400">Da Lat</h1>
            <p className="text-sm text-red-400">Flower City!</p>
          </div>
        </Link>

        {/* Menu Items */}
        <ul className="flex items-center space-x-6 text-white">
          {/* <li className="relative">
            <button
              className="flex items-center space-x-1 hover:text-orange-500"
              onClick={() => setIsNewsOpen(!isNewsOpen)}
            >
              <span>NEWS</span>
              <FaAngleDown />
            </button>
            {isNewsOpen && (
              <ul className="absolute left-0 mt-2 w-32 bg-white shadow-md text-black py-2">
                <li className="px-4 py-2 hover:bg-gray-200">
                  <Link href="#">Latest News</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <Link href="#">Events</Link>
                </li>
              </ul>
            )}
          </li> */}
          <li><Link href="/home" className="hover:text-orange-500">Trang chủ</Link></li>
          <li className="relative" ref={contributeRef}>
            <button
              className="flex items-center space-x-1 hover:text-orange-500"
              onClick={toggleContributeDropdown}
            >
              <span>Đóng góp</span>
              <FaAngleDown />
            </button>
            {isContributeOpen && (
              <ul className="absolute left-0 mt-2 w-44 bg-white shadow-md text-black py-2 z-50">
                <li className="px-4 py-2 hover:bg-gray-200">
                  <Link href="/contribute/food">Địa điểm nổi bật</Link>
                </li>
                <li className="px-4 py-2 hover:bg-gray-200">
                  <Link href="/contribute">Địa điểm nổi tiếng</Link>
                </li>
              </ul>
            )}
          </li>
          {
            isAuthenticated() && (
              <li><Link href="/plan" className="hover:text-orange-500">Lịch trình</Link></li>
            )
          }
          <li><Link href="/festival" className="hover:text-orange-500">Lễ hội</Link></li>
          {/* <li><Link href="#" className="hover:text-orange-500">Liên hệ</Link></li> */}
          <li>
            {
              isAuthenticated() ? (
                <div className="relative" ref={dropdownRef}>
                  <div className="flex items-center space-x-4 cursor-pointer" onClick={toggleDropdown}>
                    <span className="text-white font-medium">{profile.name}</span>
                    <Image
                      src={profile.avatarUrl}
                      alt="User Avatar"
                      width={40}
                      height={40}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  </div>
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-50">
                      {
                        isAdminLogin() && (
                          <a href="/admin/account" className="block px-4 py-2 text-gray-800 hover:bg-gray-200" onClick={toggleDropdown}>
                            Trang quản trị
                          </a>
                        )
                      }
                      <Link href="/auth/wishlist" className="block px-4 py-2 text-gray-800 hover:bg-gray-200" onClick={toggleDropdown}>
                        Danh sách yêu thích
                      </Link>
                      <Link href="/auth/profile" className="block px-4 py-2 text-gray-800 hover:bg-gray-200" onClick={toggleDropdown}>
                        Thông tin cá nhân
                      </Link>
                      <Link href="/auth/change-password" className="block px-4 py-2 text-gray-800 hover:bg-gray-200" onClick={toggleDropdown}>
                        Đổi mật khẩu
                      </Link>
                      <li className="block px-4 py-2 text-gray-800 hover:bg-gray-200 cursor-pointer" onClick={handleLogout}>
                        Đăng xuất
                      </li>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="hover:text-orange-500 text-white">Đăng nhập</Link>
              )
            }
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;