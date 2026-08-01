// components/SEO.tsx

import {
  Helmet,
} from "react-helmet-async";

import {
  useLocation,
} from "react-router-dom";

interface SEOProps {
  title: string;
  description?: string;
  image?: string;

  type?:
    | "website"
    | "article";
}

const SITE_NAME =
  "Hard Boiled Egg";

const SITE_URL =
  "https://www.oursingapore.co.uk";

const DEFAULT_DESCRIPTION =
  "Hard Boiled Egg — exploring Singapore one bite at a time through recipes, reviews, notes and places worth discovering.";

const DEFAULT_IMAGE =
  `${SITE_URL}/egg.png`;

const SEO = ({
  title,
  description =
    DEFAULT_DESCRIPTION,
  image,
  type = "website",
}: SEOProps) => {
  const location =
    useLocation();

  const canonicalUrl =
    `${SITE_URL}${location.pathname}`;

  /*
   * Social platforms require an absolute
   * image URL.
   *
   * Blog cover images may already be absolute.
   * Local public images such as /egg.png need
   * the production domain added.
   */
  const socialImage = image
    ? image.startsWith(
        "http://"
      ) ||
      image.startsWith(
        "https://"
      )
      ? image
      : `${SITE_URL}${
          image.startsWith("/")
            ? image
            : `/${image}`
        }`
    : DEFAULT_IMAGE;

  const fullTitle =
    title.includes(
      SITE_NAME
    )
      ? title
      : `${title} | ${SITE_NAME}`;

  return (
    <Helmet>
      {/* Primary metadata */}
      <title> {fullTitle} </title>
      <meta name="description" content={ description }/>
      <link rel="canonical" href={ canonicalUrl }/>
      <meta name="robots" content="index, follow" />

      {/* Open Graph */}
      <meta property="og:site_name" content={ SITE_NAME }/>
      <meta property="og:title" content={ fullTitle }/>
      <meta property="og:description" content={ description }/>
      <meta property="og:url" content={ canonicalUrl }/>
      <meta property="og:type" content={ type }/>
      <meta property="og:image" content={ socialImage }/>

      {/* Twitter/X sharing */}
      <meta name="twitter:card" content="summary_large_image"/>
      <meta name="twitter:title" content={ fullTitle }/>
      <meta name="twitter:description" content={ description }/>
      <meta name="twitter:image" content={ socialImage }/>
    </Helmet>
  );
};

export default SEO;