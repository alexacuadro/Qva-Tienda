export const compressImage = (file: File, maxSizeMB: number = 2): Promise<string> => {
    return new Promise((resolve, reject) => {
        const maxSizeInBytes = maxSizeMB * 1024 * 1024;
        const reader = new FileReader();

        const image = new Image();
        image.src = URL.createObjectURL(file);
        
        image.onload = () => {
            // Si la imagen original ya es lo suficientemente pequeña y no necesita redimensionamiento,
            // la usamos directamente para evitar una recompresión innecesaria.
            if (file.size < maxSizeInBytes && image.width <= 1920 && image.height <= 1080) {
                reader.readAsDataURL(file);
                reader.onload = () => {
                    URL.revokeObjectURL(image.src);
                    resolve(reader.result as string);
                };
                reader.onerror = error => {
                    URL.revokeObjectURL(image.src);
                    reject(error)
                };
                return;
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                URL.revokeObjectURL(image.src);
                return reject(new Error('No se pudo obtener el contexto del canvas'));
            }

            const MAX_WIDTH = 1920;
            const MAX_HEIGHT = 1080;
            let width = image.width;
            let height = image.height;

            if (width > height) {
                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }
            } else {
                if (height > MAX_HEIGHT) {
                    width *= MAX_HEIGHT / height;
                    height = MAX_HEIGHT;
                }
            }

            canvas.width = width;
            canvas.height = height;

            ctx.drawImage(image, 0, 0, width, height);
            
            // Usamos image/jpeg para una compresión más eficiente en fotos.
            // La calidad de 0.8 ofrece un excelente equilibrio entre tamaño y calidad visual.
            const dataUrl = canvas.toDataURL('image/jpeg', 0.8);

            resolve(dataUrl);
            URL.revokeObjectURL(image.src);
        };
        
        image.onerror = (error) => {
            URL.revokeObjectURL(image.src);
            reject(error);
        };
    });
};
