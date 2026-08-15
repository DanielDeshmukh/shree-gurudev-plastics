import Image, { ImageProps } from "next/image";

const BLURDataURL =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPgPAAEBAQBEt9WBAAAAABJRU5ErkJggg==";

type BlurImageProps = ImageProps & { imgClassName?: string };

export default function BlurImage({
  className,
  imgClassName,
  alt,
  ...props
}: BlurImageProps) {
  return (
    <Image
      alt={alt ?? ""}
      {...props}
      loading="lazy"
      placeholder="blur"
      blurDataURL={BLURDataURL}
      className={className ?? imgClassName}
    />
  );
}
