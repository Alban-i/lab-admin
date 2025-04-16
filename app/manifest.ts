import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Shaafii Center',
    short_name: 'Shaafii',

    description: "Learning Center for: Islamic Sciences, Arabic, Qur'an",

    start_url: '/en',
    display: 'browser',
    background_color: '#015670',
    theme_color: '#B9795E',
    icons: [
      {
        src: '/icon-192.png',
        type: 'image/png',
        sizes: '192x192',
      },
      {
        src: '/icon-512.png',
        type: 'image/png',
        sizes: '512x512',
      },
    ],
  };
}
