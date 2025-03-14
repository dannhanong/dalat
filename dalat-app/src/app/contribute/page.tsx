'use client';

import React, { useEffect, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { createPlace, getAllServicesByCategoryIdId, getLookUpPlace } from '@/services/place';
import Map from '@/components/Map';
import { Autocomplete, Box, Button, Chip, TextField } from '@mui/material';
import { getUserLocation } from '@/services/utils';
import { getCategories } from '@/services/category';
import { isAdmin } from '@/services/auth';

const Contribute: React.FC = () => {
  const [longitude, setLongitude] = useState<number>(0);
  const [latitude, setLatitude] = useState<number>(0);
  const [name, setName] = useState<string>('');
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [hobbyIds, setHobbyIds] = useState<number[]>([]);
  const [serviceIds, setServiceIds] = useState<number[]>([]);
  const [availableServices, setAvailableServices] = useState<{ id: number, name: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const hobbies = [
    { id: 1, name: "Khám phá thiên nhiên" },
    { id: 2, name: "Tham quan văn hóa & lịch sử" },
    { id: 3, name: "Thư giãn & giải trí" },
    { id: 4, name: "Thể thao & vận động" },
    { id: 5, name: "Mua sắm & ẩm thực" }
  ]

  // State để lưu trữ giá trị form và trạng thái active của các trường
  const [formData, setFormData] = useState({
    name: '',
    categoryId: '',
    address: '',
    latitude: '',
    longitude: '',
    description: '',
    image: null as File | null, // Thêm trường riêng cho ảnh đại diện
    images: [] as File[], // Mảng cho nhiều ảnh
    show: 'true',
    price: '',
    hobbyIds: '',
    childFare: '',
    adultFare: '',
    openTime: '',
    closeTime: '',
  });

  const [isFieldsActive, setIsFieldsActive] = useState(false); // Trạng thái để kích hoạt các trường khác

  const fetchAllServicesByCategory = async (categoryId: number) => {
    try {
      const response = await getAllServicesByCategoryIdId(categoryId);
      if (response) {
        // Lưu danh sách dịch vụ có sẵn
        setAvailableServices(response);
        // Bạn có thể chọn tự động chọn tất cả hoặc để trống
        // setServiceIds(response.map((service: {id: number, name: string}) => service.id));
        setServiceIds([]); // Hoặc để trống và để người dùng tự chọn
      }
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  // Xử lý thay đổi trong input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        if (name === 'image') {
          // Xử lý cho ảnh đại diện - chỉ lấy file đầu tiên
          setFormData(prev => ({ ...prev, image: fileInput.files![0] }));
        } else if (name === 'images') {
          // Xử lý cho nhiều ảnh - giới hạn tối đa 4 ảnh
          const filesArray = Array.from(fileInput.files);
          const currentImages = [...formData.images];

          if (currentImages.length >= 4) {
            toast.warning('Chỉ được phép tải lên tối đa 4 ảnh');
            return;
          }

          // Tính toán số ảnh có thể thêm vào
          const remainingSlots = 4 - currentImages.length;
          const newImages = filesArray.slice(0, remainingSlots);

          if (newImages.length < filesArray.length) {
            toast.warning(`Chỉ thêm ${newImages.length}/${filesArray.length} ảnh do đã đạt giới hạn 4 ảnh`);
          }

          setFormData(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files).filter(
        file => file.type.startsWith('image/')
      );

      const currentImages = [...formData.images];

      if (currentImages.length >= 4) {
        toast.warning('Chỉ được phép tải lên tối đa 4 ảnh');
        return;
      }

      // Tính toán số ảnh có thể thêm vào
      const remainingSlots = 4 - currentImages.length;
      const newImages = filesArray.slice(0, remainingSlots);

      if (newImages.length < filesArray.length) {
        toast.warning(`Chỉ thêm ${newImages.length}/${filesArray.length} ảnh do đã đạt giới hạn 4 ảnh`);
      }

      if (newImages.length > 0) {
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, ...newImages],
        }));
        toast.success(`Đã thêm ${newImages.length} hình ảnh`);
      }
    }
  };

  // Xử lý tra cứu địa điểm
  const handleSearch = async () => {
    if (!formData.name.trim()) {
      toast.error('Vui lòng nhập tên địa điểm để tra cứu trước!');
      return;
    }

    try {
      const response = await getLookUpPlace(formData.name);
      if (response) {
        const fullAddress = response.display_name;
        const addressParts = fullAddress.split(', ');
        const shortenedAddress = addressParts.slice(1).join(',').trim();

        setFormData({
          ...formData,
          address: shortenedAddress,
          latitude: response.lat,
          longitude: response.lon,
        });
        setIsFieldsActive(true);
        toast.success('Đã tìm thấy địa điểm!');
        setLongitude(response.lon);
        setLatitude(response.lat);
        setName(response.name);
        console.log('response', response);
      } else {
        toast.error('Không tìm thấy địa điểm, vui lòng thử lại!');
      }
    } catch (error) {
      console.error('Error searching place:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  // Xử lý submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isFieldsActive) {
      toast.error('Vui lòng tra cứu địa điểm trước khi gửi!');
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('name', formData.name);
    formDataToSend.append('categoryId', categoryId ? categoryId.toString() : ''); formDataToSend.append('address', formData.address);
    formDataToSend.append('latitude', formData.latitude);
    formDataToSend.append('longitude', formData.longitude);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('image', formData.image as Blob);
    formData.images.forEach((image) => {
      formDataToSend.append(`images`, image);
    });
    formDataToSend.append('show', formData.show);
    formDataToSend.append('hobbyIds', hobbyIds.join(','));
    formDataToSend.append('serviceIds', serviceIds.join(','));
    formDataToSend.append('openTime', formData.openTime);
    formDataToSend.append('closeTime', formData.closeTime);
    formDataToSend.append('childFare', formData.childFare);
    formDataToSend.append('adultFare', formData.adultFare);

    console.log('formDataToSend', formDataToSend);


    try {
      const response = await createPlace(formDataToSend);

      if (response) {
        if (await isAdmin()) {
          toast.success('Địa điểm đã được đóng góp thành công!');
        } else {
          toast.success('Đã gửi đóng góp, chờ quản trị viên duyệt.');
        }
        setFormData({
          name: '',
          categoryId: '',
          address: '',
          latitude: '',
          longitude: '',
          description: '',
          image: null,
          images: [],
          show: 'true',
          price: '',
          hobbyIds: '',
          childFare: '',
          adultFare: '',
          openTime: '',
          closeTime: '',
        });
        setIsFieldsActive(false); // Reset trạng thái sau khi submit
      } else {
        toast.error('Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      toast.error('Có lỗi xảy ra, vui lòng thử lại.');
    }
  };

  const fetchMyLocation = async () => {
    const location = await getUserLocation();
    if (location) {
      setLatitude(location.latitude);
      setLongitude(location.longitude);
    }
  };

  const fetchCategories = async () => {
    const response = await getCategories('', 0);
    if (response) {
      setCategories(response.content);
    }
  };

  useEffect(() => {
    if (categoryId) {
      fetchAllServicesByCategory(categoryId);
    } else {
      // Reset serviceIds khi không có categoryId được chọn
      setServiceIds([]);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchMyLocation();
    fetchCategories();
  }, []);

  return (
    <Box sx={{ paddingY: 4, maxWidth: '1200px', margin: '0 auto' }}>
      <Box sx={{ textAlign: 'center', marginBottom: 4 }}>
        <h1 className="text-2xl font-bold">Đóng góp địa điểm du lịch</h1>
      </Box>
      <Box display="flex" justifyContent="center" gap={4}>
        <Box component="form" onSubmit={handleSubmit} encType="multipart/form-data" sx={{ width: '100%', maxWidth: '500px', spaceY: 2 }}>
          {/* Name (luôn active) */}
          <TextField
            fullWidth
            label="Tên Địa Điểm"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
            margin="normal"
          />

          {/* Nút Tra cứu */}
          <Box sx={{ textAlign: 'center', marginTop: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSearch}
              sx={{ width: '100%' }}
            >
              Tra Cứu
            </Button>
          </Box>

          {/* Các trường khác, chỉ active khi isFieldsActive là true */}
          {isFieldsActive && (
            <>
              {/* Category ID (sử dụng Autocomplete) */}
              <Autocomplete
                id="categoryId"
                options={categories}
                getOptionLabel={(option) => option.name || 'Không có tên'}
                value={categories.find(category => category.id === categoryId) || null}
                onChange={(event, newValue) => {
                  setCategoryId(newValue ? newValue.id : null);
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn danh mục"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                    required
                  />
                )}
                sx={{ marginTop: 2 }}
              />

              {/* Address */}
              <TextField
                fullWidth
                label="Địa Chỉ"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
                InputProps={{ readOnly: true }}
              />

              {/* Latitude & Longitude */}
              <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                <TextField
                  fullWidth
                  label="Vĩ Độ"
                  id="latitude"
                  name="latitude"
                  value={formData.latitude}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
                <TextField
                  fullWidth
                  label="Kinh Độ"
                  id="longitude"
                  name="longitude"
                  value={formData.longitude}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  margin="normal"
                  InputProps={{ readOnly: true }}
                />
              </Box>

              {/* Description */}
              <TextField
                fullWidth
                label="Mô tả"
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                variant="outlined"
                margin="normal"
                multiline
                rows={4}
              />

              {/* Image */}
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Hình ảnh đại diện (Kéo thả hoặc chọn file)
              </label>
              <input
                type="file"
                id="image"
                name="image"
                onChange={handleChange}
                accept="image/*"
                className="mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
              {formData.image && (
                <div className='mt-2'>
                  <p className="text-sm text-gray-500">Hình ảnh đại diện đã chọn</p>
                  <div className="mt-2 relative inline-block">
                    <img
                      src={URL.createObjectURL(formData.image)}
                      alt="Hình ảnh đại diện"
                      className="h-24 w-auto object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, image: null })}
                      className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                      style={{ transform: 'translate(50%, -50%)' }}
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Images */}
              <Box
                sx={{
                  marginTop: 2,
                  padding: 2,
                  border: isDragging ? '2px dashed #4f46e5' : '2px dashed #e5e7eb',
                  borderRadius: '0.375rem',
                  transition: 'all 0.2s',
                  opacity: formData.images.length >= 4 ? 0.6 : 1, // Làm mờ khi đạt giới hạn
                }}
                onDragOver={formData.images.length < 4 ? handleDragOver : (e) => e.preventDefault()}
                onDragLeave={handleDragLeave}
                onDrop={formData.images.length < 4 ? handleDrop : (e) => {
                  e.preventDefault();
                  toast.warning('Đã đạt giới hạn tối đa 4 ảnh');
                }}
              >
                <label htmlFor="images" className="block text-sm font-medium text-gray-700 mb-2">
                  Các hình ảnh khác (Kéo thả hoặc chọn file) - Tối đa 4 ảnh
                </label>
                <input
                  type="file"
                  id="images"
                  name="images"
                  onChange={handleChange}
                  accept="image/*"
                  multiple
                  disabled={formData.images.length >= 4} // Vô hiệu hóa khi đạt giới hạn
                  className={`mt-1 block w-full p-2 border border-gray-300 rounded-md shadow-sm ${formData.images.length >= 4
                      ? 'bg-gray-100 cursor-not-allowed'
                      : 'focus:ring-indigo-500 focus:border-indigo-500'
                    }`}
                />
                {formData.images.length > 0 && (
                  <div className='mt-2'>
                    <p className="text-sm text-gray-500">
                      {formData.images.length}/4 hình ảnh đã chọn
                      {formData.images.length >= 4 && " (Đã đạt giới hạn)"}
                    </p>
                  </div>
                )}
              </Box>

              {formData.images.length > 0 && (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {Array.from(formData.images).map((file, index) => (
                    <div key={index} className="relative">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Preview ${index}`}
                        className="h-24 w-full object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const newImages = [...formData.images];
                          newImages.splice(index, 1);
                          setFormData({ ...formData, images: newImages });
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 w-6 h-6 flex items-center justify-center"
                        style={{ transform: 'translate(50%, -50%)' }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {formData.images.length > 0 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
                  <p className="text-sm text-gray-500">{formData.images.length} hình ảnh đã chọn</p>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => setFormData(prev => ({ ...prev, images: [] }))}
                  >
                    Xóa tất cả
                  </Button>
                </Box>
              )}

              <Autocomplete
                multiple
                id="hobbyIds"
                options={hobbies}
                getOptionLabel={(option) => option.name || 'Không có tên'}
                value={hobbies.filter(hobby => hobbyIds.includes(hobby.id))}
                onChange={(event, newValue) => {
                  setHobbyIds(newValue.map(hobby => hobby.id));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Chọn sở thích"
                    variant="outlined"
                    margin="normal"
                    fullWidth
                  />
                )}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      label={option.name}
                      {...getTagProps({ index })}
                      key={option.id}
                    />
                  ))
                }
                sx={{ marginTop: 2 }}
              />

              {isFieldsActive && categoryId && (
                <Autocomplete
                  multiple
                  id="serviceIds"
                  options={availableServices}
                  getOptionLabel={(option) => option.name || 'Không có tên'}
                  value={availableServices.filter(service => serviceIds.includes(service.id))}
                  onChange={(event, newValue) => {
                    setServiceIds(newValue.map(service => service.id));
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Chọn dịch vụ"
                      variant="outlined"
                      margin="normal"
                      fullWidth
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => (
                      <Chip
                        label={option.name}
                        {...getTagProps({ index })}
                        key={option.id}
                      />
                    ))
                  }
                  sx={{ marginTop: 2 }}
                />
              )}

              {/* Open Time & Close Time */}
              <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                <TextField
                  fullWidth
                  label="Giờ Mở Cửa"
                  id="openTime"
                  name="openTime"
                  value={formData.openTime}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  margin="normal"
                  type="time"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 phút
                  }}
                />
                <TextField
                  fullWidth
                  label="Giờ Đóng Cửa"
                  id="closeTime"
                  name="closeTime"
                  value={formData.closeTime}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  margin="normal"
                  type="time"
                  InputLabelProps={{
                    shrink: true,
                  }}
                  inputProps={{
                    step: 300, // 5 phút
                  }}
                />
              </Box>

              {/* Child & Adult Fare */}
              <Box sx={{ display: 'flex', gap: 2, marginTop: 2 }}>
                <TextField
                  fullWidth
                  label="Giá Trẻ Em"
                  id="childFare"
                  name="childFare"
                  value={formData.childFare}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  margin="normal"
                  type="number"
                />
                <TextField
                  fullWidth
                  label="Giá Người Lớn"
                  id="adultFare"
                  name="adultFare"
                  value={formData.adultFare}
                  onChange={handleChange}
                  required
                  variant="outlined"
                  margin="normal"
                  type="number"
                />
              </Box>

              {/* Submit Button */}
              <Box sx={{ textAlign: 'center', marginTop: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ width: '100%' }}
                  onClick={handleSubmit}
                >
                  Gửi Đóng Góp
                </Button>
              </Box>
            </>
          )}
        </Box>

        <Box sx={{ width: '60%', marginTop: 4 }}>
          <Map
            lat={Number(latitude)}
            lon={Number(longitude)}
            name={name || 'Vị trí đã chọn'}
          />
        </Box>
      </Box>
      <ToastContainer />
    </Box>
  );
};

export default Contribute;