// utils/sanityImage.ts
import { useNextSanityImage } from 'next-sanity-image';
import imageUrlBuilder from '@sanity/image-url';
import { client } from '../../sanity/lib/client';

const builder = imageUrlBuilder(client);

export const GetSanityImageProps = (image: any) => {
  const imageProps: any = useNextSanityImage(client, image);
  return {
    ...imageProps,
    loader: imageProps.loader,
    placeholder: 'blur',
    blurDataURL: builder.image(image).width(20).quality(20).blur(50).url(),
  };
};