import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

interface SEOProps {
  title: string;
  description?: string;
  keywords?: string;
}

const DEFAULT_DESCRIPTION =
  "Maidenhead Town Bowls Club, formerly known as Oaken Grove Bowls, is a friendly lawn bowls club in Maidenhead, Berkshire.";

const DEFAULT_KEYWORDS = `
  Maidenhead Town Bowls Club,
  Oaken Grove Bowls,
  Oaken Grove Bowling Club,
  Lawn bowls Maidenhead,
  Bowls club Berkshire,
  Flat green bowls
`;

const SEO: React.FC<SEOProps> = ({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
}) => {
  const location = useLocation();
  const canonicalUrl = `https://www.maidenheadtownbc.com${location.pathname}`;

  return (
    <Helmet>
      {/* Primary SEO */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / social sharing */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content="website" />

      {/* Optional but harmless */}
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
};

export default SEO;
