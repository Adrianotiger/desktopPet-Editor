class IconConverter {
    /**
     * @param {number} size - The target width/height for the icon (Default: 48)
     */
    constructor(size = 48) {
        this.size = size;
    }

    /**
     * Loads a base64 encoded image string into an HTMLImageElement.
     * @param {string} base64 - The base64 string without "data:image/png;base64,..."
     * @returns {Promise<HTMLImageElement>}
     */
    openIcon(base64) {
        return new Promise((resolve, reject) => {
            let data1 = "data:image/x-icon;base64,";
            let data2 = "data:image/png;base64,";
            let data = data1;
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => {
                if(data == data1)
                {
                    data = data2;
                    img.src = data2+base64;
                }
                else
                    reject(new Error('Failed to load base64 image.'));
            }
            img.src = data1+base64;
        });
    }

    /**
     * Loads a base64 encoded image string into an HTMLImageElement.
     * @param {string} base64 - The base64 string (e.g., "data:image/png;base64,...")
     * @returns {Promise<HTMLImageElement>}
     */
    openImage(base64) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Failed to load base64 image.'));
            img.src = base64;
        });
    }

    /**
     * Converts an image source into a legacy Windows 7 compatible 32-bit ICO Blob.
     * @param {HTMLImageElement|File|Blob|string} input - The image to convert.
     * @returns {Promise<Blob>} - The generated ICO file as a Blob.
     */
    async convertIcon(input) {
        let img;

        // Smart input handling: accept Image, File, Blob, or base64 string
        if (input instanceof HTMLImageElement) {
            img = input;
        } else if (input instanceof File || input instanceof Blob) {
            const base64 = await this._fileToBase64(input);
            img = await this.openImage(base64);
        } else if (typeof input === 'string') {
            img = await this.openImage(input);
        } else {
            throw new Error('Invalid input type. Provide an Image, File, Blob, or base64 string.');
        }

        return this._generateLegacyIco(img);
    }

    /**
     * INTERNAL: Generates the actual binary ICO data.
     * @param {HTMLImageElement} img 
     * @returns {Promise<Blob>}
     */
    async _generateLegacyIco(img) {
        const size = this.size;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        
        // High quality downscaling
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, size, size);
        
        const imageData = ctx.getImageData(0, 0, size, size);
        const rgba = imageData.data;

        // 1. Create the XOR Mask (Pixel Data) - Bottom-up, BGRA format
        const pixelDataSize = size * size * 4;
        const xorMask = new Uint8Array(pixelDataSize);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const srcIdx = ((size - 1 - y) * size + x) * 4; // Flip Y for bottom-up
                const destIdx = (y * size + x) * 4;

                xorMask[destIdx + 0] = rgba[srcIdx + 2]; // B
                xorMask[destIdx + 1] = rgba[srcIdx + 1]; // G
                xorMask[destIdx + 2] = rgba[srcIdx + 0]; // R
                xorMask[destIdx + 3] = rgba[srcIdx + 3]; // A
            }
        }

        // 2. Create the AND Mask (1-bit transparency mask)
        const andMaskRowPadded = Math.ceil((size / 8) / 4) * 4; // Pad to 4-byte boundary
        const andMaskSize = andMaskRowPadded * size;
        const andMask = new Uint8Array(andMaskSize);

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const srcIdx = ((size - 1 - y) * size + x) * 4; // Flip Y
                const alpha = rgba[srcIdx + 3];
                
                if (alpha === 0) { // If pixel is fully transparent
                    const byteIdx = y * andMaskRowPadded + Math.floor(x / 8);
                    const bitIdx = 7 - (x % 8); // MSB first
                    andMask[byteIdx] |= (1 << bitIdx);
                }
            }
        }

        // 3. Construct the BITMAPINFOHEADER (40 bytes)
        const bmpHeader = new ArrayBuffer(40);
        const bmpView = new DataView(bmpHeader);
        bmpView.setUint32(0, 40, true);             // Header size
        bmpView.setUint32(4, size, true);           // Width
        bmpView.setUint32(8, size * 2, true);       // Height (DOUBLED for ICO spec!)
        bmpView.setUint16(12, 1, true);             // Color planes
        bmpView.setUint16(14, 32, true);            // Bits per pixel (32)
        bmpView.setUint32(16, 0, true);             // Compression (BI_RGB = 0)

        // 4. Calculate sizes and offsets
        const imageDataSize = bmpHeader.byteLength + pixelDataSize + andMaskSize;
        const dataOffset = 22; // 6 (ICO header) + 16 (Directory entry)

        // 5. Construct ICO Header (6 bytes)
        const icoHeader = new ArrayBuffer(6);
        const icoView = new DataView(icoHeader);
        icoView.setUint16(0, 0, true);  // Reserved
        icoView.setUint16(2, 1, true);  // Type (1 = ICO)
        icoView.setUint16(4, 1, true);  // Number of images

        // 6. Construct ICO Directory Entry (16 bytes)
        const dirEntry = new ArrayBuffer(16);
        const dirView = new DataView(dirEntry);
        dirView.setUint8(0, size);          // Width
        dirView.setUint8(1, size);          // Height
        dirView.setUint8(2, 0);             // Color count (0 for >= 256 colors)
        dirView.setUint8(3, 0);             // Reserved
        dirView.setUint16(4, 1, true);      // Color planes
        dirView.setUint16(6, 32, true);     // Bits per pixel
        dirView.setUint32(8, imageDataSize, true); // Size of image data
        dirView.setUint32(12, dataOffset, true);   // Offset to image data

        // 7. Combine everything into a single binary buffer
        const totalSize = dataOffset + imageDataSize;
        const finalBuffer = new Uint8Array(totalSize);
        let offset = 0;

        finalBuffer.set(new Uint8Array(icoHeader), offset); offset += icoHeader.byteLength;
        finalBuffer.set(new Uint8Array(dirEntry), offset);  offset += dirEntry.byteLength;
        finalBuffer.set(new Uint8Array(bmpHeader), offset); offset += bmpHeader.byteLength;
        finalBuffer.set(xorMask, offset);                   offset += pixelDataSize;
        finalBuffer.set(andMask, offset);

        // 8. Return as a Blob
        return new Blob([finalBuffer], { type: 'image/x-icon' });
    }

    /**
     * INTERNAL: Helper to convert File/Blob to base64
     */
    _fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    async blobToBase64(blob) {
        const base64 = await this._fileToBase64(blob);
        return base64;
    }
}