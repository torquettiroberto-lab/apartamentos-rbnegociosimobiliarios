import { Helmet } from "react-helmet-async";
import { siteConfig } from "@/config/site";

export function Seo({ title, description, path = "/", noindex = false }: { title: string; description: string; path?: string; noindex?: boolean }) {
  const url = `${siteConfig.brand.url}${path}`;
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={siteConfig.brand.name} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content="pt_BR" />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
    </Helmet>
  );
}
