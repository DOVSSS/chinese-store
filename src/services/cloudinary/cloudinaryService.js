export class CloudinaryService {
  constructor() {
    this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  }

  async uploadImage(file, productId, index) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', this.uploadPreset);
    formData.append('folder', `products/${productId}`);
    formData.append('public_id', `image_${index}`);
    
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      
      if (data.secure_url) {
        // Возвращаем оптимизированный URL для мобильных
        return this.getOptimizedUrl(data.secure_url);
      }
      
      throw new Error('Ошибка загрузки изображения');
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  }

  async uploadMultipleImages(files, productId) {
    const uploadPromises = files.map((file, index) =>
      this.uploadImage(file, productId, index + 1)
    );
    
    return Promise.all(uploadPromises);
  }

  getOptimizedUrl(originalUrl) {
    // Автоматическая оптимизация для мобильных
    // w_500 - ширина 500px, q_auto - автоматическое качество, f_auto - формат WebP если поддерживается
    return originalUrl.replace(
      '/upload/',
      '/upload/w_500,q_auto,f_auto,c_scale/'
    );
  }

  getThumbnailUrl(originalUrl) {
    // Маленькая превьюшка для списков
    return originalUrl.replace(
      '/upload/',
      '/upload/w_300,h_300,c_fit,q_auto,f_auto/'
    );
  }

  deleteImage(publicId) {
    // TODO: Реализовать удаление при необходимости
    return Promise.resolve();
  }
}

export const cloudinaryService = new CloudinaryService();