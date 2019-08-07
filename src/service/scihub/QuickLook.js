export default class QuickLook {
    constructor(iconUrl, fetch) {
        this._icon = iconUrl;
        this._fetch = fetch;

        this._image = null;
    }

    /**
     * Loads icon for the specific QuickLook in the form of image. Once the image was loaded, it is cached.
     * @returns {Promise<Image>}
     */
    async icon() {
        if(this._image) {
            return this._image;
        }

        // The request needs to be authorized
        const response = await this._fetch(this._icon, {
            headers: {
                "Accept": "blob",
            }
        });
        if(!response.ok) {
            throw new Error('ERROR QuickLook#icon Status: ' + response.status);
        }
        const blobData = await response.blob();
        const url = window.URL.createObjectURL(blobData);
        const image = await this.createImage(url);
        window.URL.revokeObjectURL(url);

        this._image = image;
        return image;
    }

    async createImage(url) {
        return new Promise((resolve, reject) => {
            const imageOfQuickLook = new Image();
            imageOfQuickLook.addEventListener('load', () => {
                resolve(imageOfQuickLook);
            }, false);
            imageOfQuickLook.src = url;
        });
    }
}