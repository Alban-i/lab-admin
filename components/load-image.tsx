import { CldImage } from 'next-cloudinary';

interface LoadImageProps {
  url: string | null;
  size: number;
  alt: string;
}

const LoadImage: React.FC<LoadImageProps> = ({ url, size, alt }) => {
  return url ? (
    <div
      style={{
        height: `${size}px`,
        width: `${size}px`,
      }}
    >
      <CldImage
        width={size}
        height={size}
        src={url}
        alt={alt}
        className="rounded-lg"
      />
    </div>
  ) : (
    <div
      style={{
        height: `${size}px`,
        width: `${size}px`,
      }}
      className={`bg-secondary rounded-lg`}
    ></div>
  );
};

export default LoadImage;
