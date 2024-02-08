// Function that takes in bytes and returns string in human readdable formm 
export const bytesToSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Byte';
    const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))), 10);
    return Math.round(bytes / Math.pow(1024, i)) + ' ' + sizes[i];
};


// Mime type to file extension
export const mimeToExt = (mimeType: string) => {
    const mime = mimeType.split('/')[1];
    return mime;
};